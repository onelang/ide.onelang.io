(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "typescript", "ts-simple-ast", "./KSLangSchema"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ts = require("typescript");
    const SimpleAst = require("ts-simple-ast");
    const KSLangSchema_1 = require("./KSLangSchema");
    function flattenArray(arrays) {
        return [].concat.apply([], arrays);
    }
    class TypeScriptParser {
        constructor() {
            this.ast = new (SimpleAst.TsSimpleAst || SimpleAst["default"])();
        }
        static parseFile(sourceCode, filePath) {
            const parser = new TypeScriptParser();
            parser.ast.addSourceFileFromText(filePath || "main.ts", sourceCode);
            parser.ast.addSourceFileFromText("/node_modules/typescript/lib/lib.d.ts", "");
            const sourceFile = parser.ast.getSourceFiles()[0];
            const schema = parser.createSchemaFromSourceFile(sourceFile);
            return schema;
        }
        logNodeError(message, node) {
            console.warn(message, node);
        }
        nameToKS(name, node) {
            let result = "";
            for (let c of name) {
                if ("A" <= c && c <= "Z")
                    result += (result === "" ? "" : "_") + c.toLowerCase();
                else if ("a" <= c && c <= "z" || c === "_" || "0" <= c && c <= "9")
                    result += c;
                else
                    this.logNodeError(`Invalid character ('${c}') in name: ${name}.`, node);
            }
            return result;
        }
        convertTsType(tsType) {
            const result = new KSLangSchema_1.KSLangSchema.Type();
            const typeText = tsType.intrinsicName || tsType.symbol.name;
            if (typeText === "number")
                result.typeKind = KSLangSchema_1.KSLangSchema.TypeKind.Number;
            else if (typeText === "string")
                result.typeKind = KSLangSchema_1.KSLangSchema.TypeKind.String;
            else if (typeText === "boolean")
                result.typeKind = KSLangSchema_1.KSLangSchema.TypeKind.Boolean;
            else if (typeText === "void")
                result.typeKind = KSLangSchema_1.KSLangSchema.TypeKind.Void;
            else {
                const isArray = typeText === "Array";
                result.typeKind = isArray ? KSLangSchema_1.KSLangSchema.TypeKind.Array :
                    KSLangSchema_1.KSLangSchema.TypeKind.Class;
                if (!isArray)
                    result.className = this.nameToKS(typeText);
                const typeArgs = tsType.typeArguments;
                if (typeArgs)
                    result.typeArguments = typeArgs.map(x => this.convertTsType(x));
            }
            return result;
        }
        convertParameter(tsParam) {
            return {
                name: this.nameToKS(tsParam.getName()),
                type: this.convertTsType(tsParam.getType().compilerType)
            };
        }
        convertExpression(tsExpr) {
            if (typeof tsExpr === "undefined")
                return undefined;
            if (tsExpr.kind === ts.SyntaxKind.CallExpression) {
                const callExpr = tsExpr;
                return {
                    exprKind: KSLangSchema_1.KSLangSchema.ExpressionKind.Call,
                    method: this.convertExpression(callExpr.expression),
                    arguments: callExpr.arguments.map(arg => this.convertExpression(arg))
                };
            }
            else if (tsExpr.kind === ts.SyntaxKind.BinaryExpression) {
                const binaryExpr = tsExpr;
                return {
                    exprKind: KSLangSchema_1.KSLangSchema.ExpressionKind.Binary,
                    left: this.convertExpression(binaryExpr.left),
                    right: this.convertExpression(binaryExpr.right),
                    operator: binaryExpr.operatorToken.getText()
                };
            }
            else if (tsExpr.kind === ts.SyntaxKind.PropertyAccessExpression) {
                const propAccessExpr = tsExpr;
                return {
                    exprKind: KSLangSchema_1.KSLangSchema.ExpressionKind.PropertyAccess,
                    object: this.convertExpression(propAccessExpr.expression),
                    propertyName: propAccessExpr.name.text,
                };
            }
            else if (tsExpr.kind === ts.SyntaxKind.ElementAccessExpression) {
                const elementAccessExpr = tsExpr;
                return {
                    exprKind: KSLangSchema_1.KSLangSchema.ExpressionKind.ElementAccess,
                    object: this.convertExpression(elementAccessExpr.expression),
                    elementExpr: this.convertExpression(elementAccessExpr.argumentExpression)
                };
            }
            else if (tsExpr.kind === ts.SyntaxKind.Identifier) {
                const identifier = tsExpr;
                return {
                    exprKind: KSLangSchema_1.KSLangSchema.ExpressionKind.Identifier,
                    text: identifier.text
                };
            }
            else if (tsExpr.kind === ts.SyntaxKind.NewExpression) {
                const newExpr = tsExpr;
                return {
                    exprKind: KSLangSchema_1.KSLangSchema.ExpressionKind.New,
                    class: this.convertExpression(newExpr.expression),
                    arguments: newExpr.arguments.map(arg => this.convertExpression(arg))
                };
            }
            else if (tsExpr.kind === ts.SyntaxKind.ConditionalExpression) {
                const condExpr = tsExpr;
                return {
                    exprKind: KSLangSchema_1.KSLangSchema.ExpressionKind.Conditional,
                    condition: this.convertExpression(condExpr.condition),
                    whenTrue: this.convertExpression(condExpr.whenTrue),
                    whenFalse: this.convertExpression(condExpr.whenFalse),
                };
            }
            else if (tsExpr.kind === ts.SyntaxKind.StringLiteral) {
                const literalExpr = tsExpr;
                return {
                    exprKind: KSLangSchema_1.KSLangSchema.ExpressionKind.Literal,
                    literalType: "string",
                    value: literalExpr.text
                };
            }
            else if (tsExpr.kind === ts.SyntaxKind.NumericLiteral) {
                const literalExpr = tsExpr;
                return {
                    exprKind: KSLangSchema_1.KSLangSchema.ExpressionKind.Literal,
                    literalType: "numeric",
                    value: literalExpr.text
                };
            }
            else if (tsExpr.kind === ts.SyntaxKind.FalseKeyword || tsExpr.kind === ts.SyntaxKind.TrueKeyword) {
                return {
                    exprKind: KSLangSchema_1.KSLangSchema.ExpressionKind.Literal,
                    literalType: "boolean",
                    value: tsExpr.getText()
                };
            }
            else if (tsExpr.kind === ts.SyntaxKind.NullKeyword) {
                return {
                    exprKind: KSLangSchema_1.KSLangSchema.ExpressionKind.Literal,
                    literalType: "null",
                    value: "null"
                };
            }
            else if (tsExpr.kind === ts.SyntaxKind.ParenthesizedExpression) {
                const parenExpr = tsExpr;
                return {
                    exprKind: KSLangSchema_1.KSLangSchema.ExpressionKind.Parenthesized,
                    expression: this.convertExpression(parenExpr.expression)
                };
            }
            else if (tsExpr.kind === ts.SyntaxKind.PostfixUnaryExpression) {
                const unaryExpr = tsExpr;
                return {
                    exprKind: KSLangSchema_1.KSLangSchema.ExpressionKind.Unary,
                    unaryType: "postfix",
                    operator: unaryExpr.operator === ts.SyntaxKind.PlusPlusToken ? "++" :
                        unaryExpr.operator === ts.SyntaxKind.MinusMinusToken ? "--" : null,
                    operand: this.convertExpression(unaryExpr.operand)
                };
            }
            else if (tsExpr.kind === ts.SyntaxKind.PrefixUnaryExpression) {
                const unaryExpr = tsExpr;
                return {
                    exprKind: KSLangSchema_1.KSLangSchema.ExpressionKind.Unary,
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
                    exprKind: KSLangSchema_1.KSLangSchema.ExpressionKind.ArrayLiteral,
                    items: expr.elements.map(x => this.convertExpression(x))
                };
            }
            else {
                const kindName = ts.SyntaxKind[tsExpr.kind];
                const knownKeywords = ["this", "super"];
                const keyword = knownKeywords.find(x => kindName.toLowerCase() === `${x}keyword`);
                if (keyword) {
                    return {
                        exprKind: KSLangSchema_1.KSLangSchema.ExpressionKind.Identifier,
                        text: keyword
                    };
                }
                else {
                    this.logNodeError(`Unexpected expression kind "${ts.SyntaxKind[tsExpr.kind]}".`);
                    return null;
                }
            }
        }
        convertVariableDeclaration(varDecl) {
            return {
                stmtType: KSLangSchema_1.KSLangSchema.StatementType.Variable,
                variableName: varDecl.name.getText(),
                initializer: this.convertExpression(varDecl.initializer)
            };
        }
        convertInitializer(initializer) {
            let itemVariable;
            if (initializer.kind === ts.SyntaxKind.VariableDeclarationList) {
                const varDeclList = initializer;
                if (varDeclList.declarations.length !== 1)
                    this.logNodeError(`Multiple declarations are not supported as for of initializers.`);
                itemVariable = this.convertVariableDeclaration(varDeclList.declarations[0]);
            }
            else
                this.logNodeError(`${ts.SyntaxKind[initializer.kind]} is not supported yet as for of initializer.`);
            return itemVariable;
        }
        convertStatement(tsStatement) {
            if (typeof tsStatement === "undefined")
                return undefined;
            let ksStmt = null;
            let ksStmts = null;
            if (tsStatement.kind === ts.SyntaxKind.IfStatement) {
                const ifStatement = tsStatement;
                ksStmt = {
                    stmtType: KSLangSchema_1.KSLangSchema.StatementType.If,
                    condition: this.convertExpression(ifStatement.expression),
                    then: this.convertBlock(ifStatement.thenStatement),
                    else: this.convertBlock(ifStatement.elseStatement),
                };
            }
            else if (tsStatement.kind === ts.SyntaxKind.ReturnStatement) {
                const returnStatement = tsStatement;
                ksStmt = {
                    stmtType: KSLangSchema_1.KSLangSchema.StatementType.Return,
                    expression: this.convertExpression(returnStatement.expression),
                };
            }
            else if (tsStatement.kind === ts.SyntaxKind.ThrowStatement) {
                const throwStatement = tsStatement;
                ksStmt = {
                    stmtType: KSLangSchema_1.KSLangSchema.StatementType.Throw,
                    expression: this.convertExpression(throwStatement.expression),
                };
            }
            else if (tsStatement.kind === ts.SyntaxKind.ExpressionStatement) {
                const expressionStatement = tsStatement;
                ksStmt = {
                    stmtType: KSLangSchema_1.KSLangSchema.StatementType.Expression,
                    expression: this.convertExpression(expressionStatement.expression),
                };
            }
            else if (tsStatement.kind === ts.SyntaxKind.VariableStatement) {
                const variableStatement = tsStatement;
                ksStmts = variableStatement.declarationList.declarations.map(x => this.convertVariableDeclaration(x));
            }
            else if (tsStatement.kind === ts.SyntaxKind.WhileStatement) {
                const whileStatement = tsStatement;
                ksStmt = {
                    stmtType: KSLangSchema_1.KSLangSchema.StatementType.While,
                    condition: this.convertExpression(whileStatement.expression),
                    body: this.convertBlock(whileStatement.statement),
                };
            }
            else if (tsStatement.kind === ts.SyntaxKind.ForOfStatement) {
                const stmt = tsStatement;
                ksStmt = {
                    stmtType: KSLangSchema_1.KSLangSchema.StatementType.Foreach,
                    itemVariable: this.convertInitializer(stmt.initializer),
                    items: this.convertExpression(stmt.expression),
                    body: this.convertBlock(stmt.statement)
                };
            }
            else if (tsStatement.kind === ts.SyntaxKind.ForStatement) {
                const stmt = tsStatement;
                ksStmt = {
                    stmtType: KSLangSchema_1.KSLangSchema.StatementType.For,
                    itemVariable: this.convertInitializer(stmt.initializer),
                    condition: this.convertExpression(stmt.condition),
                    incrementor: this.convertExpression(stmt.incrementor),
                    body: this.convertBlock(stmt.statement)
                };
            }
            else
                this.logNodeError(`Unexpected statement kind "${ts.SyntaxKind[tsStatement.kind]}".`);
            return ksStmts || (ksStmt ? [ksStmt] : []);
        }
        convertBlock(tsBlock) {
            if (typeof tsBlock === "undefined")
                return undefined;
            if ("statements" in tsBlock)
                return { statements: flattenArray(tsBlock.statements.map(x => this.convertStatement(x))) };
            else
                return { statements: this.convertStatement(tsBlock) };
        }
        createSchemaFromSourceFile(typeInfo) {
            const schema = { enums: {}, classes: {} };
            for (const tsEnum of typeInfo.getEnums()) {
                schema.enums[this.nameToKS(tsEnum.getName())] = {
                    values: tsEnum.getMembers().map(tsEnumMember => ({ name: this.nameToKS(tsEnumMember.getName()) }))
                };
            }
            for (const tsClass of typeInfo.getClasses()) {
                const classSchema = schema.classes[this.nameToKS(tsClass.getName())] = { fields: {}, methods: {} };
                for (const tsProp of tsClass.getInstanceProperties()) {
                    if (!(tsProp instanceof SimpleAst.PropertyDeclaration) && !(tsProp instanceof SimpleAst.ParameterDeclaration))
                        continue;
                    const fieldSchema = classSchema.fields[this.nameToKS(tsProp.getName())] = {
                        type: this.convertTsType(tsProp.getType().compilerType),
                        visibility: tsProp.getScope() === "public" ? KSLangSchema_1.KSLangSchema.Visibility.Public :
                            tsProp.getScope() === "protected" ? KSLangSchema_1.KSLangSchema.Visibility.Protected :
                                KSLangSchema_1.KSLangSchema.Visibility.Private,
                    };
                    const initializer = tsProp.getInitializer();
                    if (initializer)
                        fieldSchema.defaultValue = initializer.getText();
                }
                for (const tsMethod of tsClass.getInstanceMethods()) {
                    const methodSchema = classSchema.methods[this.nameToKS(tsMethod.getName())] = {};
                    methodSchema.returns = this.convertTsType(tsMethod.getReturnType().compilerType);
                    methodSchema.parameters = tsMethod.getParameters().map(tsParam => this.convertParameter(tsParam));
                    methodSchema.body = this.convertBlock(tsMethod.getBody().compilerNode);
                }
                const constructors = tsClass.getConstructors();
                if (constructors.length > 0)
                    classSchema.constructor = {
                        parameters: constructors[0].getParameters().map(tsParam => this.convertParameter(tsParam)),
                        body: this.convertBlock(constructors[0].getBody().compilerNode),
                    };
            }
            return schema;
        }
    }
    exports.TypeScriptParser = TypeScriptParser;
});
//# sourceMappingURL=TypeScriptParser.js.map