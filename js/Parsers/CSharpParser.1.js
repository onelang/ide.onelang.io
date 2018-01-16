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
    class CSharpParser {
        constructor(source) {
            this.context = [];
            // TODO: less hacky way of removing test code?
            source = source.split("\npublic class Program")[0];
            this.reader = new Reader_1.Reader(source);
            this.reader.errorCallback = error => {
                throw new Error(`[CSharpParser] ${error.message} at ${error.cursor.line}:${error.cursor.column} (context: ${this.context.join("/")})\n${this.reader.linePreview}`);
            };
            this.nodeManager = new NodeManager_1.NodeManager(this.reader);
            this.expressionParser = this.createExpressionParser(this.reader, this.nodeManager);
        }
        createExpressionParser(reader, nodeManager = null) {
            const expressionParser = new ExpressionParser_1.ExpressionParser(reader, nodeManager);
            expressionParser.unaryPrehook = () => this.parseExpressionToken();
            expressionParser.literalClassNames = { string: "CsString", numeric: "CsNumber" };
            return expressionParser;
        }
        parseType() {
            const typeName = this.reader.expectIdentifier();
            const startPos = this.reader.prevTokenOffset;
            let type;
            if (typeName === "string") {
                type = Ast_1.OneAst.Type.Class("CsString");
            }
            else if (typeName === "boolean") {
                type = Ast_1.OneAst.Type.Class("CsBoolean");
            }
            else if (typeName === "number") {
                type = Ast_1.OneAst.Type.Class("CsNumber");
            }
            else if (typeName === "void") {
                type = Ast_1.OneAst.Type.Void;
            }
            else if (typeName === "object") {
                type = Ast_1.OneAst.Type.Any;
            }
            else {
                type = Ast_1.OneAst.Type.Class(typeName);
                if (this.reader.readToken("<")) {
                    do {
                        const generics = this.parseType();
                        type.typeArguments.push(generics);
                    } while (this.reader.readToken(","));
                    this.reader.expectToken(">");
                }
            }
            this.nodeManager.addNode(type, startPos);
            while (this.reader.readToken("[]")) {
                type = Ast_1.OneAst.Type.Class("CsArray", [type]);
                this.nodeManager.addNode(type, startPos);
            }
            return type;
        }
        parseExpression() {
            return this.expressionParser.parse();
        }
        parseExpressionToken() {
            if (this.reader.readToken("null")) {
                return { exprKind: "Literal", literalType: "null", value: "null" };
            }
            else if (this.reader.readToken("true")) {
                return { exprKind: "Literal", literalType: "boolean", value: true, literalClassName: "TsBoolean" };
            }
            else if (this.reader.readToken("false")) {
                return { exprKind: "Literal", literalType: "boolean", value: false, literalClassName: "TsBoolean" };
            }
            else if (this.reader.readToken("$\"")) {
                const tmplStr = { exprKind: Ast_1.OneAst.ExpressionKind.TemplateString, parts: [] };
                while (true) {
                    const litMatch = this.reader.readRegex('([^{"]|\\{\\{|\\\\")*');
                    tmplStr.parts.push({ literal: true, text: litMatch[0] });
                    if (this.reader.readToken('"'))
                        break;
                    else {
                        this.reader.expectToken("{");
                        const expr = this.parseExpression();
                        tmplStr.parts.push({ literal: false, expr });
                        this.reader.expectToken("}");
                    }
                }
                return tmplStr;
            }
            else if (this.reader.readToken("new")) {
                const isArray = this.reader.readToken("[]");
                const type = isArray ? null : this.parseType();
                if ((isArray || type.className === "List") && this.reader.readToken("{")) {
                    const arrayLiteral = { exprKind: Ast_1.OneAst.ExpressionKind.ArrayLiteral, items: [] };
                    if (!this.reader.readToken("}")) {
                        do {
                            const item = this.parseExpression();
                            arrayLiteral.items.push(item);
                        } while (this.reader.readToken(","));
                        this.reader.expectToken("}");
                    }
                    return arrayLiteral;
                }
                else if (type.className === "Dictionary" && type.typeArguments[0].className === "CsString" && this.reader.readToken("{")) {
                    const mapLiteral = { exprKind: Ast_1.OneAst.ExpressionKind.MapLiteral, properties: [] };
                    if (!this.reader.readToken("}")) {
                        do {
                            this.reader.expectToken("{");
                            const key = this.reader.readString();
                            if (key === null)
                                this.reader.fail("expected string as map key");
                            this.reader.expectToken(",");
                            const value = this.parseExpression();
                            this.reader.expectToken("}");
                            mapLiteral.properties.push({ stmtType: Ast_1.OneAst.StatementType.VariableDeclaration,
                                name: key,
                                initializer: value
                            });
                        } while (this.reader.readToken(","));
                        this.reader.expectToken("}");
                    }
                    return mapLiteral;
                }
                else {
                    const newExpr = { exprKind: Ast_1.OneAst.ExpressionKind.New,
                        // TODO: shouldn't we use just one `type` field instead of `cls` and `typeArguments`?
                        cls: { exprKind: Ast_1.OneAst.ExpressionKind.Identifier, text: type.className },
                        typeArguments: type.typeArguments,
                        arguments: [],
                    };
                    this.reader.expectToken("(");
                    newExpr.arguments = this.expressionParser.parseCallArguments();
                    return newExpr;
                }
            }
            // else if (this.reader.readToken("<")) {
            //     const castExpr = <ast.CastExpression> { exprKind: ast.ExpressionKind.Cast };
            //     castExpr.newType = this.parseType();
            //     this.reader.expectToken(">");
            //     castExpr.expression = this.parseExpression();
            //     return castExpr;
            // }
            return null;
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
        parseStatement() {
            let statement = null;
            const leadingTrivia = this.reader.readLeadingTrivia();
            const startPos = this.reader.offset;
            let requiresClosing = true;
            if (this.reader.readToken("var")) {
                const varDecl = statement = { stmtType: Ast_1.OneAst.StatementType.VariableDeclaration };
                varDecl.name = this.reader.expectIdentifier("expected variable name");
                if (this.reader.readToken("="))
                    varDecl.initializer = this.parseExpression();
            }
            else if (this.reader.readToken("delete")) {
                const unsetStmt = statement = { stmtType: Ast_1.OneAst.StatementType.Unset };
                unsetStmt.expression = this.parseExpression();
            }
            else if (this.reader.readToken("if")) {
                requiresClosing = false;
                const ifStmt = statement = { stmtType: Ast_1.OneAst.StatementType.If };
                this.reader.expectToken("(");
                ifStmt.condition = this.parseExpression();
                this.reader.expectToken(")");
                ifStmt.then = this.parseBlockOrStatement();
                if (this.reader.readToken("else"))
                    ifStmt.else = this.parseBlockOrStatement();
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
                this.reader.expectToken("var");
                foreachStmt.itemVariable = { name: this.reader.expectIdentifier() };
                this.reader.expectToken("in");
                foreachStmt.items = this.parseExpression();
                this.reader.expectToken(")");
                foreachStmt.body = this.parseBlockOrStatement();
            }
            else if (this.reader.readToken("for")) {
                requiresClosing = false;
                const forStmt = statement = { stmtType: Ast_1.OneAst.StatementType.For };
                this.reader.expectToken("(");
                // TODO: make it work without 'var', parse this as a statement?
                this.reader.expectToken("var");
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
            else {
                const expr = this.parseExpression();
                statement = { stmtType: Ast_1.OneAst.StatementType.ExpressionStatement, expression: expr };
                if (!(expr.exprKind === Ast_1.OneAst.ExpressionKind.Call ||
                    (expr.exprKind === Ast_1.OneAst.ExpressionKind.Binary && ["=", "+=", "-="].includes(expr.operator)) ||
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
        parseTypeArguments() {
            const typeArguments = [];
            if (this.reader.readToken("<")) {
                do {
                    const generics = this.reader.expectIdentifier();
                    typeArguments.push(generics);
                } while (this.reader.readToken(","));
                this.reader.expectToken(">");
            }
            return typeArguments;
        }
        parseExprStmtFromString(expression) {
            const expr = this.createExpressionParser(new Reader_1.Reader(expression)).parse();
            return { stmtType: Ast_1.OneAst.StatementType.ExpressionStatement, expression: expr };
        }
        parseClass() {
            const clsModifiers = this.reader.readModifiers(["public"]);
            if (!this.reader.readToken("class"))
                return null;
            const clsStart = this.reader.prevTokenOffset;
            const cls = { methods: {}, fields: {}, properties: {}, constructor: null };
            cls.name = this.reader.expectIdentifier("expected identifier after 'class' keyword");
            this.context.push(`C:${cls.name}`);
            cls.typeArguments = this.parseTypeArguments();
            this.reader.expectToken("{");
            while (!this.reader.readToken("}")) {
                const leadingTrivia = this.reader.readLeadingTrivia();
                const memberStart = this.reader.offset;
                const modifiers = this.reader.readModifiers(["static", "public", "protected", "private"]);
                const isStatic = modifiers.includes("static");
                const visibility = modifiers.includes("private") ? Ast_1.OneAst.Visibility.Private :
                    modifiers.includes("protected") ? Ast_1.OneAst.Visibility.Protected : Ast_1.OneAst.Visibility.Public;
                const memberType = this.parseType();
                const isConstructor = memberType.isClass && memberType.className === cls.name;
                const memberName = isConstructor ? cls.name : this.reader.expectIdentifier();
                const methodTypeArguments = this.parseTypeArguments();
                const isMethod = this.reader.readToken("(");
                // if the class (eg. MyClass) contains a field "public MyClass Child" then we thought it's a constructor, 
                //   so we did not read the field name ("Child") yet
                const fieldName = !isMethod && isConstructor ? this.reader.expectIdentifier() : memberName;
                if (isMethod) {
                    const method = { name: memberName, returns: memberType, static: isStatic, visibility, leadingTrivia, parameters: [], typeArguments: methodTypeArguments };
                    if (isConstructor)
                        cls.constructor = method;
                    else
                        cls.methods[method.name] = method;
                    this.context.push(`M:${method.name}`);
                    if (!this.reader.readToken(")")) {
                        do {
                            const param = {};
                            method.parameters.push(param);
                            this.reader.skipWhitespace();
                            const paramStart = this.reader.offset;
                            param.type = this.parseType();
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
                else if (this.reader.readToken("{")) {
                    this.reader.fail("properties are not implemented yet");
                }
                else {
                    const field = { name: fieldName, type: memberType, static: isStatic, visibility, leadingTrivia };
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
        parseEnum() {
            if (!this.reader.readToken("enum"))
                return null;
            const enumStart = this.reader.prevTokenOffset;
            const enumObj = { values: [] };
            enumObj.name = this.reader.expectIdentifier("expected identifier after 'enum' keyword");
            this.context.push(`E:${enumObj.name}`);
            this.reader.expectToken("{");
            if (!this.reader.readToken("}")) {
                do {
                    if (this.reader.peekToken("}"))
                        break; // eg. "enum { A, B, }" (but multiline)
                    const enumMemberName = this.reader.expectIdentifier();
                    const enumMember = { name: enumMemberName };
                    this.nodeManager.addNode(enumMember, this.reader.prevTokenOffset);
                    enumObj.values.push(enumMember);
                    // TODO: generated code compatibility
                    this.reader.readToken(`= "${enumMemberName}"`);
                } while (this.reader.readToken(","));
                this.reader.expectToken("}");
            }
            this.nodeManager.addNode(enumObj, enumStart);
            this.context.pop();
            return enumObj;
        }
        parseSchema() {
            const schema = { classes: {}, enums: {}, globals: {} };
            const usings = [];
            while (this.reader.readToken("using")) {
                usings.push(this.parseExpression());
                this.reader.expectToken(";");
            }
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
                this.reader.fail("expected 'class' or 'enum' here");
            }
            return schema;
        }
        parse() {
            return this.parseSchema();
        }
        static parseFile(source) {
            return new CSharpParser(source).parse();
        }
    }
    exports.CSharpParser = CSharpParser;
});
//# sourceMappingURL=CSharpParser.1.js.map