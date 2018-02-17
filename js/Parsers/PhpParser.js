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
    class PhpParser {
        constructor(source) {
            this.langData = {
                langId: "php",
                literalClassNames: {
                    string: "PhpString",
                    boolean: "PhpBoolean",
                    numeric: "PhpNumber",
                    character: "PhpCharacter",
                    map: "PhpMap",
                    array: "PhpArray",
                },
                allowImplicitVariableDeclaration: true,
                supportsTemplateStrings: false,
                supportsFor: true,
            };
            this.context = [];
            // TODO: less hacky way of removing test code?
            source = source.split("\ntry {\n    $c = new TestClass")[0];
            source = source.replace(/OneReflect::setupClass(.|\n)*?\n  \]\)\);\n/gm, "");
            this.reader = new Reader_1.Reader(source);
            this.reader.identifierRegex = "\\$?[A-Za-z_][A-Za-z0-9_]*";
            this.reader.errorCallback = error => {
                throw new Error(`[PhpParser] ${error.message} at ${error.cursor.line}:${error.cursor.column} (context: ${this.context.join("/")})\n${this.reader.linePreview}`);
            };
            this.nodeManager = new NodeManager_1.NodeManager(this.reader);
            const exprConf = ExpressionParser_1.ExpressionParser.defaultConfig();
            exprConf.propertyAccessOps = ["->", "::"];
            exprConf.precedenceLevels.find(x => x.name === "sum").operators.push(".");
            exprConf.precedenceLevels.find(x => x.name === "assignment").operators.push(".=");
            this.expressionParser = new ExpressionParser_1.ExpressionParser(this.reader, this.nodeManager, exprConf);
            this.expressionParser.unaryPrehook = () => this.parseExpressionToken();
            this.expressionParser.infixPrehook = (left) => this.parseInfix(left);
        }
        parseExpression() {
            return this.expressionParser.parse();
        }
        parseInfix(left) {
            if (this.reader.readToken("[]")) {
                this.reader.expectToken("=");
                const newItem = this.expressionParser.parse();
                return { exprKind: Ast_1.OneAst.ExpressionKind.Call,
                    method: { exprKind: Ast_1.OneAst.ExpressionKind.PropertyAccess,
                        object: left,
                        propertyName: "add",
                    },
                    arguments: [newItem]
                };
            }
            return null;
        }
        parseExpressionToken() {
            if (this.reader.readToken("null")) {
                return { exprKind: "Literal", literalType: "null", value: "null" };
            }
            else if (this.reader.readToken("true")) {
                return { exprKind: "Literal", literalType: "boolean", value: true };
            }
            else if (this.reader.readToken("false")) {
                return { exprKind: "Literal", literalType: "boolean", value: false };
            }
            else if (this.reader.readToken("$this")) {
                return { exprKind: "Identifier", text: "this" };
                // TODO: template string
                //} else if (this.reader.readToken('"')) {
                //    this.reader.commentDisabled = true;
                //    const tmplStr = <ast.TemplateString> { exprKind: ast.ExpressionKind.TemplateString, parts: [] };
                //    while (true) {
                //        const litMatch = this.reader.readRegex('(\\\\"|\\\\#|[^"#])*');
                //        tmplStr.parts.push(<ast.TemplateStringPart> { literal: true, text: litMatch[0] });
                //        if (this.reader.readToken('"'))
                //            break;
                //        else {
                //            this.reader.expectToken("#{");
                //            this.reader.commentDisabled = false;
                //            const expr = this.parseExpression();
                //            tmplStr.parts.push(<ast.TemplateStringPart> { literal: false, expr });
                //            this.reader.commentDisabled = true;
                //            this.reader.expectToken("}");
                //        }
                //    }
                //    this.reader.commentDisabled = false;
                //
                //    if (tmplStr.parts.length === 1)
                //        return <ast.Literal> { exprKind: "Literal", literalType: "string", value: tmplStr.parts[0].text };
                //
                //    return tmplStr;
            }
            else if (this.reader.readToken("array")) {
                const arrayTypePeeker = this.reader.clone();
                if (!arrayTypePeeker.readToken("("))
                    return { exprKind: "Identifier", text: "array" };
                const isMap = arrayTypePeeker.readString() && arrayTypePeeker.readToken("=>");
                if (isMap) {
                    const mapLiteral = this.expressionParser.parseMapLiteral("=>", "(", ")");
                    return mapLiteral;
                }
                else {
                    const arrayLiteral = this.expressionParser.parseArrayLiteral("(", ")");
                    return arrayLiteral;
                }
            }
            else if (this.reader.readToken("new")) {
                const className = this.reader.expectIdentifier();
                const newExpr = { exprKind: Ast_1.OneAst.ExpressionKind.New,
                    // TODO: shouldn't we use just one `type` field instead of `cls` and `typeArguments`?
                    cls: { exprKind: Ast_1.OneAst.ExpressionKind.Identifier, text: className },
                    typeArguments: [],
                };
                this.reader.expectToken("(");
                newExpr.arguments = this.expressionParser.parseCallArguments();
                return newExpr;
            }
            const arrayLiteral = this.expressionParser.parseArrayLiteral();
            if (arrayLiteral != null)
                return arrayLiteral;
            return null;
        }
        parseIf() {
            const ifStmt = { stmtType: Ast_1.OneAst.StatementType.If, then: { statements: [] } };
            this.reader.expectToken("(");
            ifStmt.condition = this.parseExpression();
            this.reader.expectToken(")");
            ifStmt.then = this.parseBlockOrStatement();
            if (this.reader.readToken("elseif")) {
                ifStmt.else = { statements: [this.parseIf()] };
            }
            else if (this.reader.readToken("else")) {
                ifStmt.else = this.parseBlockOrStatement();
            }
            return ifStmt;
        }
        parseStatement() {
            let statement = null;
            const leadingTrivia = this.reader.readLeadingTrivia();
            const startPos = this.reader.offset;
            let requiresClosing = true;
            if (this.reader.readToken("unset")) {
                const unsetStmt = statement = { stmtType: Ast_1.OneAst.StatementType.Unset };
                unsetStmt.expression = this.parseExpression();
            }
            else if (this.reader.readToken("if")) {
                requiresClosing = false;
                const ifStmt = statement = this.parseIf();
            }
            else if (this.reader.readToken("while")) {
                requiresClosing = false;
                const whileStmt = statement = { stmtType: Ast_1.OneAst.StatementType.While };
                this.reader.expectToken("(");
                whileStmt.condition = this.parseExpression();
                this.reader.expectToken(")");
                whileStmt.body = this.parseBlockOrStatement();
            }
            else if (this.reader.readToken("foreach")) {
                requiresClosing = false;
                const foreachStmt = statement = { stmtType: Ast_1.OneAst.StatementType.Foreach };
                this.reader.expectToken("(");
                foreachStmt.items = this.parseExpression();
                this.reader.expectToken("as");
                foreachStmt.itemVariable = { name: this.reader.expectIdentifier() };
                this.reader.expectToken(")");
                foreachStmt.body = this.parseBlockOrStatement();
            }
            else if (this.reader.readToken("for")) {
                requiresClosing = false;
                const forStmt = statement = { stmtType: Ast_1.OneAst.StatementType.For };
                this.reader.expectToken("(");
                forStmt.itemVariable = { name: this.reader.expectIdentifier() };
                if (this.reader.readToken("="))
                    forStmt.itemVariable.initializer = this.parseExpression();
                this.reader.expectToken(";");
                forStmt.condition = this.parseExpression();
                this.reader.expectToken(";");
                forStmt.incrementor = this.parseExpression();
                this.reader.expectToken(")");
                forStmt.body = this.parseBlockOrStatement();
            }
            else if (this.reader.readToken("return")) {
                const returnStmt = statement = { stmtType: Ast_1.OneAst.StatementType.Return };
                returnStmt.expression = this.reader.peekToken(";") ? null : this.parseExpression();
            }
            else if (this.reader.readToken("throw")) {
                const throwStmt = statement = { stmtType: Ast_1.OneAst.StatementType.Throw };
                throwStmt.expression = this.parseExpression();
            }
            else if (this.reader.readToken("break")) {
                statement = { stmtType: Ast_1.OneAst.StatementType.Break };
            }
            else if (this.reader.readToken("print")) {
                // TODO hack: we shouldn't probably support unset statement if we don't support print statement
                const callExprStmt = statement = this.parseExprStmtFromString("OneConsole.print()");
                const callExpr = callExprStmt.expression;
                let callArgExpr = this.parseExpression();
                // TODO hack: print($value . "\n")   =>   print($value)
                if (callArgExpr.exprKind === "Parenthesized")
                    callArgExpr = callArgExpr.expression;
                if (callArgExpr.exprKind === "Binary") {
                    const binaryExpr = callArgExpr;
                    if (binaryExpr.operator === "." && binaryExpr.right.exprKind === "Literal" && binaryExpr.right.value === "\n")
                        callArgExpr = binaryExpr.left;
                }
                if (callArgExpr.exprKind === "Parenthesized")
                    callArgExpr = callArgExpr.expression;
                callExpr.arguments.push(callArgExpr);
            }
            else {
                const expr = this.parseExpression();
                statement = { stmtType: Ast_1.OneAst.StatementType.ExpressionStatement, expression: expr };
                if (!(expr.exprKind === Ast_1.OneAst.ExpressionKind.Call ||
                    (expr.exprKind === Ast_1.OneAst.ExpressionKind.Binary && ["=", "+=", "-=", ".="].includes(expr.operator)) ||
                    (expr.exprKind === Ast_1.OneAst.ExpressionKind.Unary && ["++", "--"].includes(expr.operator))))
                    this.reader.fail("this expression is not allowed as statement");
            }
            if (statement === null)
                this.reader.fail("unknown statement");
            statement.leadingTrivia = leadingTrivia;
            this.nodeManager.addNode(statement, startPos);
            const statementLastLine = this.reader.wsLineCounter;
            if (!this.reader.readToken(";") && requiresClosing && this.reader.wsLineCounter === statementLastLine)
                this.reader.fail("statement is not closed");
            return statement;
        }
        parseBlock() {
            if (!this.reader.readToken("{"))
                return null;
            const startPos = this.reader.prevTokenOffset;
            const block = { statements: [] };
            if (this.reader.readToken("}"))
                return block;
            do {
                const statement = this.parseStatement();
                block.statements.push(statement);
            } while (!this.reader.readToken("}"));
            this.nodeManager.addNode(block, startPos);
            return block;
        }
        parseBlockOrStatement() {
            const block = this.parseBlock();
            if (block !== null)
                return block;
            const stmt = this.parseStatement();
            if (stmt === null)
                this.reader.fail("expected block or statement");
            return { statements: [stmt] };
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
            if (this.reader.readToken("extends"))
                cls.baseClass = this.reader.expectIdentifier();
            while (this.reader.readToken("implements"))
                cls.baseInterfaces.push(this.reader.expectIdentifier());
            this.reader.expectToken("{");
            while (!this.reader.readToken("}")) {
                const leadingTrivia = this.reader.readLeadingTrivia();
                const memberStart = this.reader.offset;
                const modifiers = this.reader.readModifiers(["static", "public", "protected", "private", "const"]);
                const isStatic = modifiers.includes("static");
                const visibility = modifiers.includes("private") ? Ast_1.OneAst.Visibility.Private :
                    modifiers.includes("protected") ? Ast_1.OneAst.Visibility.Protected : Ast_1.OneAst.Visibility.Public;
                if (this.reader.readToken("function")) {
                    const method = { leadingTrivia, static: isStatic, visibility, parameters: [], returns: Ast_1.OneAst.Type.Any };
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
                else {
                    const fieldName = this.reader.readIdentifier();
                    const field = { name: fieldName, static: isStatic, visibility, leadingTrivia };
                    cls.fields[field.name] = field;
                    this.context.push(`F:${field.name}`);
                    if (this.reader.readToken("="))
                        field.initializer = this.parseExpression();
                    this.reader.expectToken(";");
                    this.nodeManager.addNode(field, memberStart);
                    this.context.pop();
                }
            }
            this.nodeManager.addNode(cls, clsStart);
            this.context.pop();
            return cls;
        }
        parseSchema() {
            const schema = { classes: {}, enums: {}, globals: {}, interfaces: {}, langData: this.langData, mainBlock: { statements: [] } };
            this.reader.readRegex("<\\?php\\s*");
            const usings = [];
            while (this.reader.readToken("require"))
                usings.push(this.parseExpression());
            while (true) {
                const leadingTrivia = this.reader.readLeadingTrivia();
                if (this.reader.eof)
                    break;
                const cls = this.parseClass();
                if (cls !== null) {
                    cls.leadingTrivia = leadingTrivia;
                    schema.classes[cls.name] = cls;
                    continue;
                }
                break;
            }
            while (true) {
                const leadingTrivia = this.reader.readLeadingTrivia();
                if (this.reader.eof)
                    break;
                const stmt = this.parseStatement();
                if (stmt === null)
                    this.reader.fail("expected 'class', 'enum' or 'interface' or a statement here");
                stmt.leadingTrivia = leadingTrivia;
                schema.mainBlock.statements.push(stmt);
            }
            return schema;
        }
        parse() {
            return this.parseSchema();
        }
        static parseFile(source) {
            return new PhpParser(source).parse();
        }
    }
    exports.PhpParser = PhpParser;
});
//# sourceMappingURL=PhpParser.js.map