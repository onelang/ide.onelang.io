(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "typescript", "ts-simple-ast", "ts-simple-ast", "../One/Ast", "../Generator/Utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ts = require("typescript");
    const SimpleAst = require("ts-simple-ast");
    const ts_simple_ast_1 = require("ts-simple-ast");
    const Ast_1 = require("../One/Ast");
    const Utils_1 = require("../Generator/Utils");
    function flattenArray(arrays) {
        return [].concat.apply([], arrays);
    }
    class TypeScriptParser {
        constructor(sourceCode, filePath) {
            this.sourceCode = sourceCode;
            this.ast = new ts_simple_ast_1.default();
            this.ast.addSourceFileFromText(filePath || "main.ts", sourceCode);
            this.ast.addSourceFileFromText("/node_modules/typescript/lib/lib.d.ts", "");
            this.sourceFile = this.ast.getSourceFiles()[0];
        }
        static parseFile(sourceCode, filePath) {
            const parser = new TypeScriptParser(sourceCode, filePath);
            const schema = parser.generate();
            return schema;
        }
        logNodeError(message, node) {
            console.warn(`[TypeScriptParser] ${message}${node ? ` (nodeType: ${ts.SyntaxKind[node.kind]})` : ""}`, node || "");
        }
        convertTsType(tsType) {
            let result;
            if (!tsType) {
                result = Ast_1.OneAst.Type.Void;
            }
            else if (tsType.kind === ts.SyntaxKind.StringKeyword) {
                result = Ast_1.OneAst.Type.String;
            }
            else if (tsType.kind === ts.SyntaxKind.BooleanKeyword) {
                result = Ast_1.OneAst.Type.Boolean;
            }
            else if (tsType.kind === ts.SyntaxKind.NumberKeyword) {
                result = Ast_1.OneAst.Type.Number;
            }
            else if (tsType.kind === ts.SyntaxKind.AnyKeyword) {
                result = Ast_1.OneAst.Type.Any;
            }
            else if (tsType.kind === ts.SyntaxKind.TypeReference) {
                const typeRef = tsType;
                const typeText = typeRef.typeName.getText();
                if (this.currClass.typeArguments.includes(typeText) || this.currMethod.typeArguments.includes(typeText)) {
                    result = Ast_1.OneAst.Type.Generics(typeText);
                }
                else {
                    const typeArgs = typeRef.typeArguments;
                    result = Ast_1.OneAst.Type.Class(typeText, typeArgs.map(x => this.convertTsType(x)));
                }
            }
            else {
                this.logNodeError(`Unknown type node`, tsType);
            }
            return result || Ast_1.OneAst.Type.Any;
        }
        convertParameter(tsParam) {
            return {
                name: tsParam.getName(),
                type: this.convertTsType(tsParam.compilerNode.type)
            };
        }
        convertExpression(tsExpr) {
            if (typeof tsExpr === "undefined")
                return undefined;
            if (tsExpr.kind === ts.SyntaxKind.CallExpression) {
                const callExpr = tsExpr;
                return {
                    exprKind: Ast_1.OneAst.ExpressionKind.Call,
                    method: this.convertExpression(callExpr.expression),
                    arguments: callExpr.arguments.map(arg => this.convertExpression(arg))
                };
            }
            else if (tsExpr.kind === ts.SyntaxKind.BinaryExpression) {
                const binaryExpr = tsExpr;
                return {
                    exprKind: Ast_1.OneAst.ExpressionKind.Binary,
                    left: this.convertExpression(binaryExpr.left),
                    right: this.convertExpression(binaryExpr.right),
                    operator: binaryExpr.operatorToken.getText()
                };
            }
            else if (tsExpr.kind === ts.SyntaxKind.PropertyAccessExpression) {
                const propAccessExpr = tsExpr;
                return {
                    exprKind: Ast_1.OneAst.ExpressionKind.PropertyAccess,
                    object: this.convertExpression(propAccessExpr.expression),
                    propertyName: propAccessExpr.name.text,
                };
            }
            else if (tsExpr.kind === ts.SyntaxKind.ElementAccessExpression) {
                const elementAccessExpr = tsExpr;
                return {
                    exprKind: Ast_1.OneAst.ExpressionKind.ElementAccess,
                    object: this.convertExpression(elementAccessExpr.expression),
                    elementExpr: this.convertExpression(elementAccessExpr.argumentExpression)
                };
            }
            else if (tsExpr.kind === ts.SyntaxKind.Identifier) {
                const identifier = tsExpr;
                return {
                    exprKind: Ast_1.OneAst.ExpressionKind.Identifier,
                    text: identifier.text
                };
            }
            else if (tsExpr.kind === ts.SyntaxKind.NewExpression) {
                const newExpr = tsExpr;
                if (newExpr.expression.kind !== ts.SyntaxKind.Identifier)
                    this.logNodeError(`Only Identifier can be used as "new" class.`, newExpr.expression);
                const classIdentifier = newExpr.expression;
                return {
                    exprKind: Ast_1.OneAst.ExpressionKind.New,
                    cls: this.convertExpression(classIdentifier),
                    typeArguments: newExpr.typeArguments.map(arg => arg.getText()),
                    arguments: newExpr.arguments.map(arg => this.convertExpression(arg))
                };
            }
            else if (tsExpr.kind === ts.SyntaxKind.ConditionalExpression) {
                const condExpr = tsExpr;
                return {
                    exprKind: Ast_1.OneAst.ExpressionKind.Conditional,
                    condition: this.convertExpression(condExpr.condition),
                    whenTrue: this.convertExpression(condExpr.whenTrue),
                    whenFalse: this.convertExpression(condExpr.whenFalse),
                };
            }
            else if (tsExpr.kind === ts.SyntaxKind.StringLiteral) {
                const literalExpr = tsExpr;
                return {
                    exprKind: Ast_1.OneAst.ExpressionKind.Literal,
                    literalType: "string",
                    value: literalExpr.text
                };
            }
            else if (tsExpr.kind === ts.SyntaxKind.NumericLiteral) {
                const literalExpr = tsExpr;
                return {
                    exprKind: Ast_1.OneAst.ExpressionKind.Literal,
                    literalType: "numeric",
                    value: literalExpr.text
                };
            }
            else if (tsExpr.kind === ts.SyntaxKind.FalseKeyword || tsExpr.kind === ts.SyntaxKind.TrueKeyword) {
                return {
                    exprKind: Ast_1.OneAst.ExpressionKind.Literal,
                    literalType: "boolean",
                    value: tsExpr.kind === ts.SyntaxKind.TrueKeyword
                };
            }
            else if (tsExpr.kind === ts.SyntaxKind.NullKeyword) {
                return {
                    exprKind: Ast_1.OneAst.ExpressionKind.Literal,
                    literalType: "null",
                    value: "null"
                };
            }
            else if (tsExpr.kind === ts.SyntaxKind.ParenthesizedExpression) {
                const parenExpr = tsExpr;
                return {
                    exprKind: Ast_1.OneAst.ExpressionKind.Parenthesized,
                    expression: this.convertExpression(parenExpr.expression)
                };
            }
            else if (tsExpr.kind === ts.SyntaxKind.PostfixUnaryExpression) {
                const unaryExpr = tsExpr;
                return {
                    exprKind: Ast_1.OneAst.ExpressionKind.Unary,
                    unaryType: "postfix",
                    operator: unaryExpr.operator === ts.SyntaxKind.PlusPlusToken ? "++" :
                        unaryExpr.operator === ts.SyntaxKind.MinusMinusToken ? "--" : null,
                    operand: this.convertExpression(unaryExpr.operand)
                };
            }
            else if (tsExpr.kind === ts.SyntaxKind.PrefixUnaryExpression) {
                const unaryExpr = tsExpr;
                return {
                    exprKind: Ast_1.OneAst.ExpressionKind.Unary,
                    unaryType: "prefix",
                    operator: unaryExpr.operator === ts.SyntaxKind.PlusPlusToken ? "++" :
                        unaryExpr.operator === ts.SyntaxKind.MinusMinusToken ? "--" :
                            unaryExpr.operator === ts.SyntaxKind.PlusToken ? "+" :
                                unaryExpr.operator === ts.SyntaxKind.MinusToken ? "-" :
                                    unaryExpr.operator === ts.SyntaxKind.TildeToken ? "~" :
                                        unaryExpr.operator === ts.SyntaxKind.ExclamationToken ? "!" : null,
                    operand: this.convertExpression(unaryExpr.operand)
                };
            }
            else if (tsExpr.kind === ts.SyntaxKind.ArrayLiteralExpression) {
                const expr = tsExpr;
                return {
                    exprKind: Ast_1.OneAst.ExpressionKind.ArrayLiteral,
                    items: expr.elements.map(x => this.convertExpression(x))
                };
            }
            else if (tsExpr.kind === ts.SyntaxKind.ObjectLiteralExpression) {
                const expr = tsExpr;
                return {
                    exprKind: Ast_1.OneAst.ExpressionKind.MapLiteral,
                    properties: expr.properties.map((x) => this.convertVariableDeclaration(x))
                };
            }
            else if (tsExpr.kind === ts.SyntaxKind.DeleteExpression) {
                const expr = tsExpr;
                const objToDelete = this.convertExpression(expr.expression);
                if (objToDelete.exprKind !== Ast_1.OneAst.ExpressionKind.ElementAccess) {
                    this.logNodeError(`Delete is not supported for this kind of expression: ${ts.SyntaxKind[objToDelete.exprKind]}`, expr);
                    return null;
                }
                return {
                    exprKind: Ast_1.OneAst.ExpressionKind.Call,
                    method: {
                        exprKind: Ast_1.OneAst.ExpressionKind.PropertyAccess,
                        object: objToDelete.object,
                        propertyName: "delete"
                    },
                    arguments: [objToDelete.elementExpr]
                };
            }
            else {
                const kindName = ts.SyntaxKind[tsExpr.kind];
                const knownKeywords = ["this", "super"];
                const keyword = knownKeywords.find(x => kindName.toLowerCase() === `${x}keyword`);
                if (keyword) {
                    return {
                        exprKind: Ast_1.OneAst.ExpressionKind.Identifier,
                        text: keyword
                    };
                }
                else {
                    this.logNodeError(`Unexpected expression kind.`, tsExpr);
                    return null;
                }
            }
        }
        convertVariableDeclaration(varDecl) {
            return {
                stmtType: Ast_1.OneAst.StatementType.VariableDeclaration,
                name: varDecl.name.getText(),
                initializer: this.convertExpression(varDecl.initializer)
            };
        }
        convertInitializer(initializer) {
            let itemVariable;
            if (initializer.kind === ts.SyntaxKind.VariableDeclarationList) {
                const varDeclList = initializer;
                if (varDeclList.declarations.length !== 1)
                    this.logNodeError(`Multiple declarations are not supported as for of initializers.`, varDeclList);
                itemVariable = this.convertVariableDeclaration(varDeclList.declarations[0]);
            }
            else
                this.logNodeError(`${ts.SyntaxKind[initializer.kind]} is not supported yet as for of initializer.`);
            return itemVariable;
        }
        convertStatement(tsStatement) {
            if (typeof tsStatement === "undefined")
                return undefined;
            let oneStmt = null;
            let oneStmts = null;
            if (tsStatement.kind === ts.SyntaxKind.IfStatement) {
                const ifStatement = tsStatement;
                oneStmt = {
                    stmtType: Ast_1.OneAst.StatementType.If,
                    condition: this.convertExpression(ifStatement.expression),
                    then: this.convertBlock(ifStatement.thenStatement),
                    else: this.convertBlock(ifStatement.elseStatement),
                };
            }
            else if (tsStatement.kind === ts.SyntaxKind.ReturnStatement) {
                const returnStatement = tsStatement;
                oneStmt = {
                    stmtType: Ast_1.OneAst.StatementType.Return,
                    expression: this.convertExpression(returnStatement.expression),
                };
            }
            else if (tsStatement.kind === ts.SyntaxKind.ThrowStatement) {
                const throwStatement = tsStatement;
                oneStmt = {
                    stmtType: Ast_1.OneAst.StatementType.Throw,
                    expression: this.convertExpression(throwStatement.expression),
                };
            }
            else if (tsStatement.kind === ts.SyntaxKind.ExpressionStatement) {
                const expressionStatement = tsStatement;
                oneStmt = {
                    stmtType: Ast_1.OneAst.StatementType.ExpressionStatement,
                    expression: this.convertExpression(expressionStatement.expression),
                };
            }
            else if (tsStatement.kind === ts.SyntaxKind.VariableStatement) {
                const variableStatement = tsStatement;
                oneStmts = variableStatement.declarationList.declarations.map(x => this.convertVariableDeclaration(x));
            }
            else if (tsStatement.kind === ts.SyntaxKind.WhileStatement) {
                const whileStatement = tsStatement;
                oneStmt = {
                    stmtType: Ast_1.OneAst.StatementType.While,
                    condition: this.convertExpression(whileStatement.expression),
                    body: this.convertBlock(whileStatement.statement),
                };
            }
            else if (tsStatement.kind === ts.SyntaxKind.ForOfStatement) {
                const stmt = tsStatement;
                oneStmt = {
                    stmtType: Ast_1.OneAst.StatementType.Foreach,
                    itemVariable: this.convertInitializer(stmt.initializer),
                    items: this.convertExpression(stmt.expression),
                    body: this.convertBlock(stmt.statement)
                };
            }
            else if (tsStatement.kind === ts.SyntaxKind.ForStatement) {
                const stmt = tsStatement;
                oneStmt = {
                    stmtType: Ast_1.OneAst.StatementType.For,
                    itemVariable: this.convertInitializer(stmt.initializer),
                    condition: this.convertExpression(stmt.condition),
                    incrementor: this.convertExpression(stmt.incrementor),
                    body: this.convertBlock(stmt.statement)
                };
            }
            else
                this.logNodeError(`Unexpected statement kind.`, tsStatement);
            oneStmts = oneStmts || (oneStmt ? [oneStmt] : []);
            if (oneStmts.length > 0) {
                const triviaStart = tsStatement.pos;
                const triviaEnd = tsStatement.getStart();
                const realEnd = this.sourceCode.lastIndexOf("\n", triviaEnd) + 1;
                if (realEnd > triviaStart) {
                    const trivia = this.sourceCode.substring(triviaStart, realEnd);
                    oneStmts[0].leadingTrivia = Utils_1.deindent(trivia);
                }
            }
            return oneStmts;
        }
        convertBlock(tsBlock) {
            if (typeof tsBlock === "undefined")
                return undefined;
            if ("statements" in tsBlock)
                return { statements: flattenArray(tsBlock.statements.map(x => this.convertStatement(x))) };
            else
                return { statements: this.convertStatement(tsBlock) };
        }
        convertVisibility(node) {
            const scope = node.getScope();
            const visibility = scope === "public" ? Ast_1.OneAst.Visibility.Public :
                scope === "protected" ? Ast_1.OneAst.Visibility.Protected :
                    scope === "private" ? Ast_1.OneAst.Visibility.Private : null;
            if (!visibility)
                this.logNodeError(`Unknown scope / visibility value: ${scope}`, node.compilerNode);
            return visibility;
        }
        generate() {
            const schema = { globals: {}, enums: {}, classes: {} };
            for (const varDecl of this.sourceFile.getVariableDeclarations()) {
                const oneVarDecl = this.convertVariableDeclaration(varDecl.compilerNode);
                oneVarDecl.type = this.convertTsType(varDecl.compilerNode.type);
                schema.globals[varDecl.getName()] = oneVarDecl;
            }
            for (const tsEnum of this.sourceFile.getEnums()) {
                schema.enums[tsEnum.getName()] = {
                    values: tsEnum.getMembers().map(tsEnumMember => ({ name: tsEnumMember.getName() }))
                };
            }
            for (const tsClass of this.sourceFile.getClasses()) {
                const classSchema = schema.classes[tsClass.getName()] = { fields: {}, methods: {}, properties: {} };
                this.currClass = classSchema;
                classSchema.typeArguments = tsClass.getTypeParameters().map(x => x.compilerNode.name.text);
                for (const tsProp of tsClass.getInstanceProperties()) {
                    if (tsProp instanceof SimpleAst.PropertyDeclaration || tsProp instanceof SimpleAst.ParameterDeclaration) {
                        const fieldSchema = classSchema.fields[tsProp.getName()] = {
                            type: this.convertTsType(tsProp.compilerNode.type),
                            visibility: this.convertVisibility(tsProp)
                        };
                        const initializer = tsProp.getInitializer();
                        if (initializer)
                            fieldSchema.defaultValue = initializer.getText();
                    }
                    else if (tsProp instanceof SimpleAst.GetAccessorDeclaration) {
                        const propSchema = classSchema.properties[tsProp.getName()] = {
                            type: this.convertTsType(tsProp.compilerNode.type),
                            visibility: this.convertVisibility(tsProp),
                            getter: this.convertBlock(tsProp.compilerNode.body),
                        };
                    }
                    else {
                        this.logNodeError(`Unknown property type`, tsProp.compilerNode);
                    }
                }
                const tsMethods = tsClass.getAllMembers().filter(x => x instanceof SimpleAst.MethodDeclaration);
                for (const tsMethod of tsMethods) {
                    const methodSchema = classSchema.methods[tsMethod.getName()] = {};
                    this.currMethod = methodSchema;
                    methodSchema.typeArguments = tsMethod.getTypeParameters().map(x => x.compilerNode.name.text);
                    methodSchema.static = tsMethod.isStatic();
                    methodSchema.returns = this.convertTsType(tsMethod.compilerNode.type);
                    methodSchema.parameters = tsMethod.getParameters().map(tsParam => this.convertParameter(tsParam));
                    const tsBody = tsMethod.getBody();
                    methodSchema.body = tsBody && this.convertBlock(tsBody.compilerNode);
                }
                const constructors = tsClass.getConstructors();
                if (constructors.length > 0)
                    classSchema.constructor = {
                        parameters: constructors[0].getParameters().map(tsParam => this.convertParameter(tsParam)),
                        body: this.convertBlock(constructors[0].getBody().compilerNode),
                    };
            }
            return this.schema = schema;
        }
    }
    exports.TypeScriptParser = TypeScriptParser;
});
//# sourceMappingURL=TypeScriptParser.js.map