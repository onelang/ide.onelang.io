(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../One/Ast", "./Common/Reader", "./Common/ExpressionParser", "./Common/NodeManager"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Ast_1 = require("../One/Ast");
    const Reader_1 = require("./Common/Reader");
    const ExpressionParser_1 = require("./Common/ExpressionParser");
    const NodeManager_1 = require("./Common/NodeManager");
    class RubyParser {
        constructor(source) {
            this.langData = {
                literalClassNames: {
                    string: "RubyString",
                    boolean: "RubyBoolean",
                    numeric: "RubyNumber",
                    character: "RubyCharacter",
                    map: "RubyMap",
                    array: "RubyArray",
                },
                allowImplicitVariableDeclaration: true
            };
            this.context = [];
            // TODO: less hacky way of removing test code?
            source = source.split("\nbegin\n    TestClass.new().test_method()")[0];
            source = source.replace(/One::Reflect::setup_class(.|\n)*?\n  \]\)\);\n/gm, "");
            this.reader = new Reader_1.Reader(source);
            this.reader.supportsBlockComment = false;
            this.reader.lineComment = "#";
            this.reader.identifierRegex = "[A-Za-z_][A-Za-z0-9_]*[?!]?";
            this.reader.errorCallback = error => {
                throw new Error(`[RubyParser] ${error.message} at ${error.cursor.line}:${error.cursor.column} (context: ${this.context.join("/")})\n${this.reader.linePreview}`);
            };
            this.nodeManager = new NodeManager_1.NodeManager(this.reader);
            this.expressionParser = new ExpressionParser_1.ExpressionParser(this.reader, this.nodeManager);
            this.expressionParser.unaryPrehook = () => this.parseExpressionToken();
        }
        parseExpression() {
            return this.expressionParser.parse();
        }
        parseExpressionToken() {
            if (this.reader.readToken("nil")) {
                return { exprKind: "Literal", literalType: "null", value: "null" };
            }
            else if (this.reader.readToken("true")) {
                return { exprKind: "Literal", literalType: "boolean", value: true };
            }
            else if (this.reader.readToken("false")) {
                return { exprKind: "Literal", literalType: "boolean", value: false };
            }
            else if (this.reader.readToken("self")) {
                return { exprKind: "Identifier", text: "this" };
            }
            else if (this.reader.readToken("@")) {
                const fieldName = this.reader.readIdentifier();
                return this.parseExprFromString(`this.${fieldName}`);
            }
            else if (this.reader.readToken("/#{Regexp.escape(")) {
                const stringContent = this.reader.readString();
                if (stringContent === null)
                    this.reader.fail("expected string here");
                this.reader.expectToken(")}/");
                return { exprKind: "Literal", literalType: "string", value: stringContent };
            }
            else if (this.reader.readToken('"')) {
                this.reader.commentDisabled = true;
                const tmplStr = { exprKind: Ast_1.OneAst.ExpressionKind.TemplateString, parts: [] };
                while (true) {
                    const litMatch = this.reader.readRegex('(\\\\"|\\\\#|[^"#])*');
                    tmplStr.parts.push({ literal: true, text: litMatch[0] });
                    if (this.reader.readToken('"'))
                        break;
                    else {
                        this.reader.expectToken("#{");
                        this.reader.commentDisabled = false;
                        const expr = this.parseExpression();
                        tmplStr.parts.push({ literal: false, expr });
                        this.reader.commentDisabled = true;
                        this.reader.expectToken("}");
                    }
                }
                this.reader.commentDisabled = false;
                if (tmplStr.parts.length === 1)
                    return { exprKind: "Literal", literalType: "string", value: tmplStr.parts[0].text };
                return tmplStr;
            }
            const mapLiteral = this.expressionParser.parseMapLiteral("=>");
            if (mapLiteral != null)
                return mapLiteral;
            const arrayLiteral = this.expressionParser.parseArrayLiteral();
            if (arrayLiteral != null)
                return arrayLiteral;
            return null;
        }
        parseIf() {
            const ifStmt = { stmtType: Ast_1.OneAst.StatementType.If, then: { statements: [] } };
            ifStmt.condition = this.parseExpression();
            while (!this.reader.readToken("end")) {
                if (this.reader.readToken("else")) {
                    ifStmt.else = this.parseBlock();
                    break;
                }
                else if (this.reader.readToken("elsif")) {
                    ifStmt.else = { statements: [this.parseIf()] };
                    break;
                }
                else {
                    ifStmt.then.statements.push(this.parseStatement());
                }
            }
            return ifStmt;
        }
        parseStatement() {
            let statement = null;
            const leadingTrivia = this.reader.readLeadingTrivia();
            const startPos = this.reader.offset;
            if (this.reader.readToken("delete")) {
                const unsetStmt = statement = { stmtType: Ast_1.OneAst.StatementType.Unset };
                unsetStmt.expression = this.parseExpression();
            }
            else if (this.reader.readToken("if")) {
                statement = this.parseIf();
            }
            else if (this.reader.readToken("while")) {
                const whileStmt = statement = { stmtType: Ast_1.OneAst.StatementType.While };
                whileStmt.condition = this.parseExpression();
                whileStmt.body = this.parseBlock();
            }
            else if (this.reader.readToken("for")) {
                const foreachStmt = statement = { stmtType: Ast_1.OneAst.StatementType.Foreach };
                foreachStmt.itemVariable = { name: this.reader.expectIdentifier() };
                this.reader.expectToken("in");
                foreachStmt.items = this.parseExpression();
                foreachStmt.body = this.parseBlock();
            }
            else if (this.reader.readToken("return")) {
                const returnStmt = statement = { stmtType: Ast_1.OneAst.StatementType.Return };
                returnStmt.expression = this.reader.readRegex("\\s*(\n|#)") !== null ? null : this.parseExpression();
            }
            else if (this.reader.readToken("raise")) {
                const throwStmt = statement = { stmtType: Ast_1.OneAst.StatementType.Throw };
                throwStmt.expression = this.parseExpression();
            }
            else if (this.reader.readToken("break")) {
                statement = { stmtType: Ast_1.OneAst.StatementType.Break };
            }
            else if (this.reader.readToken("puts")) {
                const callExprStmt = statement = this.parseExprStmtFromString("OneConsole.print()");
                const callExpr = callExprStmt.expression;
                const callArgExpr = this.parseExpression();
                callExpr.arguments.push(callArgExpr);
            }
            else {
                const expr = this.parseExpression();
                statement = { stmtType: Ast_1.OneAst.StatementType.ExpressionStatement, expression: expr };
                if (!(expr.exprKind === Ast_1.OneAst.ExpressionKind.Call ||
                    (expr.exprKind === Ast_1.OneAst.ExpressionKind.Binary && ["=", "+=", "-=", "<<"].includes(expr.operator)) ||
                    (expr.exprKind === Ast_1.OneAst.ExpressionKind.Unary && ["++", "--"].includes(expr.operator))))
                    this.reader.fail("this expression is not allowed as statement");
            }
            if (statement === null)
                this.reader.fail("unknown statement");
            statement.leadingTrivia = leadingTrivia;
            this.nodeManager.addNode(statement, startPos);
            return statement;
        }
        parseBlock() {
            const block = { statements: [] };
            const startPos = this.reader.offset;
            while (!this.reader.readToken("end")) {
                const statement = this.parseStatement();
                block.statements.push(statement);
            }
            this.nodeManager.addNode(block, startPos);
            return block;
        }
        parseExprFromString(expression) {
            const expr = new ExpressionParser_1.ExpressionParser(new Reader_1.Reader(expression)).parse();
            return expr;
        }
        parseExprStmtFromString(expression) {
            const expr = this.parseExprFromString(expression);
            return { stmtType: Ast_1.OneAst.StatementType.ExpressionStatement, expression: expr };
        }
        parseClass() {
            if (!this.reader.readToken("class"))
                return null;
            const clsStart = this.reader.prevTokenOffset;
            const cls = { methods: {}, fields: {}, properties: {}, constructor: null, typeArguments: [], baseInterfaces: [] };
            cls.name = this.reader.expectIdentifier("expected identifier after 'class' keyword");
            this.context.push(`C:${cls.name}`);
            if (this.reader.readToken("<"))
                cls.baseClass = this.reader.expectIdentifier();
            while (!this.reader.readToken("end")) {
                const leadingTrivia = this.reader.readLeadingTrivia();
                const memberStart = this.reader.offset;
                if (this.reader.readToken("def")) {
                    const isStatic = this.reader.readToken("self.");
                    const method = { leadingTrivia, static: isStatic, parameters: [], returns: Ast_1.OneAst.Type.Any };
                    method.name = this.reader.expectIdentifier();
                    cls.methods[method.name] = method;
                    this.context.push(`M:${method.name}`);
                    this.reader.expectToken("(");
                    if (!this.reader.readToken(")")) {
                        do {
                            const param = {};
                            method.parameters.push(param);
                            this.reader.skipWhitespace();
                            const paramStart = this.reader.offset;
                            param.name = this.reader.expectIdentifier();
                            this.context.push(`arg:${param.name}`);
                            this.nodeManager.addNode(param, paramStart);
                            this.context.pop();
                        } while (this.reader.readToken(","));
                        this.reader.expectToken(")");
                    }
                    method.body = this.parseBlock();
                    if (method.body === null)
                        this.reader.fail("method body is missing");
                    this.nodeManager.addNode(method, memberStart);
                    this.context.pop();
                }
                else if (this.reader.readToken("attr_accessor")) {
                    this.reader.expectToken("(:");
                    const field = { leadingTrivia, name: this.reader.expectIdentifier() };
                    this.reader.expectToken(")");
                    cls.fields[field.name] = field;
                    this.nodeManager.addNode(field, memberStart);
                }
                else if (this.reader.readToken("@")) {
                    const field = { leadingTrivia, static: true, name: this.reader.expectIdentifier() };
                    cls.fields[field.name] = field;
                    if (this.reader.readToken("="))
                        field.initializer = this.parseExpression();
                    this.nodeManager.addNode(field, memberStart);
                }
                else if (this.reader.readToken("class << self")) {
                    // TODO: handle attr_accessor the same way
                    while (!this.reader.readToken("end")) {
                        this.reader.expectToken("attr_accessor");
                        do {
                            this.reader.expectToken(":");
                            const fieldName = this.reader.expectIdentifier();
                        } while (this.reader.readToken(","));
                    }
                }
                else {
                    debugger;
                }
            }
            this.nodeManager.addNode(cls, clsStart);
            this.context.pop();
            return cls;
        }
        parseEnum() {
            if (!this.reader.readToken("module"))
                return null;
            const enumStart = this.reader.prevTokenOffset;
            const enumObj = { values: [] };
            enumObj.name = this.reader.expectIdentifier("expected identifier after 'enum' keyword");
            this.context.push(`E:${enumObj.name}`);
            while (!this.reader.readToken("end")) {
                const enumMemberName = this.reader.expectIdentifier();
                const enumMember = { name: enumMemberName };
                this.nodeManager.addNode(enumMember, this.reader.prevTokenOffset);
                enumObj.values.push(enumMember);
                // TODO: generated code compatibility
                this.reader.readRegex("\\s*=\\s*\\d+");
            }
            this.nodeManager.addNode(enumObj, enumStart);
            this.context.pop();
            return enumObj;
        }
        parseSchema() {
            const schema = { classes: {}, enums: {}, globals: {}, interfaces: {}, langData: this.langData, mainBlock: { statements: [] } };
            const usings = [];
            while (this.reader.readToken("require"))
                usings.push(this.parseExpression());
            while (!this.reader.eof) {
                const leadingTrivia = this.reader.readLeadingTrivia();
                if (this.reader.eof)
                    break;
                const cls = this.parseClass();
                if (cls !== null) {
                    cls.leadingTrivia = leadingTrivia;
                    schema.classes[cls.name] = cls;
                    continue;
                }
                const enumObj = this.parseEnum();
                if (enumObj !== null) {
                    enumObj.leadingTrivia = leadingTrivia;
                    schema.enums[enumObj.name] = enumObj;
                    continue;
                }
                const stmt = this.parseStatement();
                if (stmt !== null) {
                    stmt.leadingTrivia = leadingTrivia;
                    schema.mainBlock.statements.push(stmt);
                    continue;
                }
                this.reader.fail("expected 'class', 'enum' or 'interface' or a statement here");
            }
            return schema;
        }
        parse() {
            return this.parseSchema();
        }
        static parseFile(source) {
            return new RubyParser(source).parse();
        }
    }
    exports.RubyParser = RubyParser;
});
//# sourceMappingURL=RubyParser.1.js.map