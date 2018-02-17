(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Ast", "./AstVisitor"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Ast_1 = require("./Ast");
    const AstVisitor_1 = require("./AstVisitor");
    class OverviewGenerator extends AstVisitor_1.AstVisitor {
        constructor() {
            super();
            this.result = "";
            this.pad = "";
            this.padWasAdded = false;
            this.showRefs = false;
            this.lastLineWasNewLine = true;
        }
        addLine(line) {
            this.add(`${line}\n`);
            this.padWasAdded = false;
            this.lastLineWasNewLine = false;
        }
        add(data) {
            if (!this.padWasAdded) {
                this.result += this.pad;
                this.padWasAdded = true;
            }
            this.result += data;
        }
        indent(num) {
            if (num === 1)
                this.pad += "  ";
            else
                this.pad = this.pad.substr(0, this.pad.length - 2);
        }
        newLine() {
            if (!this.lastLineWasNewLine)
                this.result += "\n";
            this.lastLineWasNewLine = true;
        }
        visitVariable(stmt) {
            this.addLine(`- Variable: ${stmt.name}${stmt.type ? ` [${stmt.type.repr()}]` : ""}`);
        }
        visitStatement(statement) {
            const addHdr = (line) => {
                this.addLine(line);
            };
            if (statement.leadingTrivia) {
                this.addLine(`Comment: "${statement.leadingTrivia.replace(/\n/g, "\\n")}"`);
                this.add("- ");
            }
            if (statement === null) {
                addHdr("<null>");
            }
            else if (statement.stmtType === Ast_1.OneAst.StatementType.If) {
                const stmt = statement;
                addHdr(`If`);
                this.visitExpression(stmt.condition);
                this.indent(1);
                this.addLine(`Then`);
                this.visitBlock(stmt.then);
                if (stmt.else) {
                    this.addLine(`Else`);
                    this.visitBlock(stmt.else);
                }
                this.indent(-1);
            }
            else if (statement.stmtType === Ast_1.OneAst.StatementType.VariableDeclaration) {
                const stmt = statement;
                addHdr(`Variable: ${stmt.name}${stmt.type ? ` [${stmt.type.repr()}]` : ""}`);
                this.visitExpression(stmt.initializer);
            }
            else if (statement.stmtType === Ast_1.OneAst.StatementType.While) {
                const stmt = statement;
                addHdr(`While`);
                this.indent(1);
                this.visitExpression(stmt.condition);
                this.addLine(`Body`);
                this.visitBlock(stmt.body);
                this.indent(-1);
            }
            else if (statement.stmtType === Ast_1.OneAst.StatementType.Foreach) {
                const stmt = statement;
                addHdr(`Foreach ${stmt.itemVariable.name}: ${stmt.itemVariable.type && stmt.itemVariable.type.repr()}`);
                this.indent(1);
                this.addLine(`Items`);
                this.visitExpression(stmt.items);
                this.addLine(`Body`);
                this.visitBlock(stmt.body);
                this.indent(-1);
            }
            else if (statement.stmtType === Ast_1.OneAst.StatementType.For) {
                const stmt = statement;
                addHdr(`For ("${stmt.itemVariable.name}")`);
                this.indent(1);
                this.addLine(`Var`);
                this.visitVariableDeclaration(stmt.itemVariable, null);
                this.addLine(`Condition`);
                this.visitExpression(stmt.condition);
                this.addLine(`Incrementor`);
                this.visitExpression(stmt.incrementor);
                this.addLine(`Body`);
                this.visitBlock(stmt.body);
                this.indent(-1);
            }
            else if (statement.stmtType === Ast_1.OneAst.StatementType.ExpressionStatement) {
                addHdr(`ExpressionStatement`);
                super.visitStatement(statement, null);
            }
            else if (statement.stmtType === Ast_1.OneAst.StatementType.Break) {
                addHdr(`Break`);
            }
            else if (statement.stmtType === Ast_1.OneAst.StatementType.Unset) {
                const unsetStmt = statement;
                addHdr(`Unset`);
                super.visitExpression(unsetStmt.expression, null);
            }
            else {
                addHdr(`${statement.stmtType}`);
                super.visitStatement(statement, null);
            }
        }
        visitBlock(block) {
            this.indent(1);
            for (const statement of block.statements) {
                this.add("- ");
                this.visitStatement(statement);
            }
            this.indent(-1);
        }
        visitUnknownExpression(expression) {
            super.visitUnknownExpression(expression, null);
            this.addLine(`${expression.exprKind} (unknown!)`);
        }
        visitExpression(expression) {
            this.indent(1);
            this.add("- ");
            const addHdr = (line, postfix = "") => {
                const typeText = !expression ? " [null]" :
                    expression.valueType ? ` [${expression.valueType.repr()}]` : "";
                this.addLine(`${line}${typeText}${postfix}`);
            };
            if (expression === null) {
                addHdr("<null>");
            }
            else if (expression.exprKind === Ast_1.OneAst.ExpressionKind.Binary) {
                const expr = expression;
                addHdr(`Binary: ${expr.operator}`);
                super.visitExpression(expression, null);
            }
            else if (expression.exprKind === Ast_1.OneAst.ExpressionKind.Identifier) {
                const expr = expression;
                addHdr(`Identifier: ${expr.text}`);
            }
            else if (expression.exprKind === Ast_1.OneAst.ExpressionKind.Literal) {
                const expr = expression;
                addHdr(`Literal (${expr.literalType}): ${JSON.stringify(expr.value)}`);
            }
            else if (expression.exprKind === Ast_1.OneAst.ExpressionKind.Unary) {
                const expr = expression;
                addHdr(`Unary (${expr.unaryType}): ${expr.operator}`);
                super.visitExpression(expression, null);
            }
            else if (expression.exprKind === Ast_1.OneAst.ExpressionKind.PropertyAccess) {
                const expr = expression;
                addHdr(`PropertyAccess (.${expr.propertyName})`);
                super.visitExpression(expression, null);
            }
            else if (expression.exprKind === Ast_1.OneAst.ExpressionKind.ClassReference) {
                const expr = expression;
                addHdr(`ClassReference`);
            }
            else if (expression.exprKind === Ast_1.OneAst.ExpressionKind.VariableReference) {
                const expr = expression;
                const instanceField = expr.varType === Ast_1.OneAst.VariableRefType.InstanceField;
                const specType = !instanceField ? null : !expr.thisExpr ? "static" :
                    expr.thisExpr.exprKind === Ast_1.OneAst.ExpressionKind.ThisReference ? "this" : null;
                addHdr(`${expr.varType}${specType ? ` (${specType})` : ""}: ${expr.varRef.name}`, this.showRefs ? ` => ${expr.varRef.metaPath}` : "");
                if (!specType && expr.thisExpr)
                    this.visitExpression(expr.thisExpr);
            }
            else if (expression.exprKind === Ast_1.OneAst.ExpressionKind.MethodReference) {
                const expr = expression;
                const specType = !expr.thisExpr ? "static" :
                    expr.thisExpr.exprKind === Ast_1.OneAst.ExpressionKind.ThisReference ? "this" : null;
                const throws = expr.methodRef && expr.methodRef.throws;
                const addInfo = [specType, throws ? "throws" : null].filter(x => x);
                addHdr(`MethodReference${addInfo.length > 0 ? ` (${addInfo.join(", ")})` : ""}`);
                if (!specType)
                    this.visitExpression(expr.thisExpr);
            }
            else if (expression.exprKind === Ast_1.OneAst.ExpressionKind.ThisReference) {
                const expr = expression;
                addHdr(`ThisRef`);
            }
            else if (expression.exprKind === Ast_1.OneAst.ExpressionKind.New) {
                const expr = expression;
                const className = expr.cls.text || expr.cls.classRef.name;
                const typeArgsText = expr.typeArguments && expr.typeArguments.length > 0 ? `<${expr.typeArguments.join(", ")}>` : "";
                addHdr(`New ${className}${typeArgsText}`);
            }
            else if (expression.exprKind === Ast_1.OneAst.ExpressionKind.Cast) {
                const expr = expression;
                addHdr(`Cast -> ${expr.newType.repr()}`);
                super.visitExpression(expr.expression, null);
            }
            else if (expression.exprKind === Ast_1.OneAst.ExpressionKind.MapLiteral) {
                const expr = expression;
                addHdr(expression.exprKind);
                this.indent(1);
                super.visitExpression(expression, null);
                this.indent(-1);
            }
            else {
                addHdr(expression.exprKind);
                super.visitExpression(expression, null);
            }
            this.indent(-1);
        }
        printProperties(intf) {
            for (const prop of Object.values(intf.properties || {})) {
                this.addLine(`${intf.name}::${prop.name}: ${prop.type && prop.type.repr() || "null"}`);
                this.visitBlock(prop.getter);
            }
            this.newLine();
        }
        printMethods(cls, showEmptyBody = true) {
            for (const method of Object.values(cls.methods)) {
                const argList = method.parameters.map(arg => `${arg.name}: ${arg.type ? arg.type.repr() : "???"}`).join(", ");
                const addInfo = [method.static ? "static" : null, method.throws ? "throws" : null].filter(x => x);
                this.addLine(`${cls.name}::${method.name}(${argList}): ${method.returns ? method.returns.repr() : "???"}`
                    + `${addInfo.length > 0 ? ` [${addInfo.join(", ")}]` : ""}`);
                if (method.body)
                    this.visitBlock(method.body);
                else if (showEmptyBody)
                    this.addLine("  <no body>");
                this.newLine();
            }
        }
        generate(schemaCtx) {
            if (this.result)
                return this.result;
            schemaCtx.ensureTransforms("fillName");
            for (const glob of Object.values(schemaCtx.schema.globals))
                this.addLine(`global ${glob.name}: ${glob.type.repr()}`);
            this.newLine();
            for (const _enum of Object.values(schemaCtx.schema.enums))
                this.addLine(`enum ${_enum.name}: ${_enum.values.map(x => x.name).join(', ')}`);
            this.newLine();
            for (const intf of Object.values(schemaCtx.schema.interfaces)) {
                this.printProperties(intf);
                this.printMethods(intf, false);
            }
            for (const cls of Object.values(schemaCtx.schema.classes)) {
                for (const field of Object.values(cls.fields)) {
                    this.addLine(`${cls.name}::${field.name}: ${field.type && field.type.repr() || "null"}`);
                    if (field.initializer) {
                        this.visitVariableDeclaration(field, null);
                        this.newLine();
                    }
                }
                this.newLine();
                this.printProperties(cls);
                if (cls.constructor) {
                    this.addLine(`${cls.name}::constructor`);
                    this.visitBlock(cls.constructor.body);
                }
                this.newLine();
                this.printMethods(cls);
            }
            if (schemaCtx.schema.mainBlock.statements.length > 0) {
                this.addLine(`main()`);
                this.visitBlock(schemaCtx.schema.mainBlock);
            }
            return this.result;
        }
    }
    exports.OverviewGenerator = OverviewGenerator;
});
//# sourceMappingURL=OverviewGenerator.js.map