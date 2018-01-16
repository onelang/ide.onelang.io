(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../Ast", "../AstVisitor", "../AstHelper", "../../Utils/Helpers"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Ast_1 = require("../Ast");
    const AstVisitor_1 = require("../AstVisitor");
    const AstHelper_1 = require("../AstHelper");
    const Helpers_1 = require("../../Utils/Helpers");
    class VariableReplacer extends AstVisitor_1.AstVisitor {
        constructor() {
            super(...arguments);
            this.replacements = {};
        }
        visitThisReference(expr) {
            if (this.thisReplacement)
                AstHelper_1.AstHelper.replaceProperties(expr, this.thisReplacement);
        }
        visitVariableRef(expr) {
            if (expr.thisExpr)
                this.visitExpression(expr.thisExpr, null);
            const changeTo = this.replacements[expr.varRef.metaPath];
            if (changeTo)
                AstHelper_1.AstHelper.replaceProperties(expr, changeTo);
        }
        visitStatements(statements) {
            for (const statement of statements)
                this.visitStatement(statement, null);
        }
    }
    exports.VariableReplacer = VariableReplacer;
    /**
     * Replaces call expressions which call into overlay methods to their statements inlined.
     * It also replaces overlay InstanceField references.
     */
    class ReplaceReferences extends AstVisitor_1.AstVisitor {
        constructor(schemaCtx) {
            super();
            this.schemaCtx = schemaCtx;
        }
        overlayMethod(expr, method, thisExpr, args) {
            const cls = method.classRef;
            if (!(cls.meta && cls.meta.overlay))
                return;
            if (method.parameters.length != args.length) {
                this.log(`Called overlay method ${AstHelper_1.AstHelper.methodRepr(method)} ` +
                    `with parameters (${args.map(x => x.valueType.repr()).join(", ")})`);
                return;
            }
            const statements = AstHelper_1.AstHelper.clone(method.body.statements);
            const varReplacer = new VariableReplacer();
            varReplacer.thisReplacement = thisExpr;
            for (var i = 0; i < method.parameters.length; i++)
                varReplacer.replacements[method.parameters[i].metaPath] = args[i];
            // TODO: 
            //  - resolve variable declaration conflicts
            varReplacer.visitStatements(statements);
            if (statements.length !== 1 || (statements[0].stmtType !== Ast_1.OneAst.StatementType.ExpressionStatement
                && statements[0].stmtType !== Ast_1.OneAst.StatementType.Return)) {
                this.log("Expected Expression or Return statement");
                return;
            }
            const newCallExpr = statements[0].expression;
            if (newCallExpr.exprKind !== Ast_1.OneAst.ExpressionKind.Call) {
                this.log("Expected CallExpression");
                return;
            }
            AstHelper_1.AstHelper.replaceProperties(expr, newCallExpr);
        }
        visitCallExpression(expr) {
            super.visitCallExpression(expr, null);
            if (expr.method.exprKind !== Ast_1.OneAst.ExpressionKind.MethodReference)
                return;
            const methodRef = expr.method;
            this.overlayMethod(expr, methodRef.methodRef, methodRef.thisExpr, expr.arguments);
        }
        visitBinaryExpression(expr) {
            for (const operand of [expr.left, expr.right]) {
                const className = `${(operand.valueType.className || operand.valueType.typeKind).ucFirst()}Operators`;
                const cls = this.schemaCtx.getClass(className);
                if (!cls)
                    continue;
                const method = cls.methods[`op_${expr.operator}`];
                if (!method || !Helpers_1.arrayEq(method.parameters.map(x => x.name), ["left", "right"]))
                    continue;
                this.overlayMethod(expr, method, null, [expr.left, expr.right]);
                return;
            }
            super.visitBinaryExpression(expr, null);
        }
        visitVariableRef(expr) {
            if (expr.varType !== Ast_1.OneAst.VariableRefType.InstanceField)
                return;
            const prop = expr.varRef;
            if (!(prop.classRef && prop.classRef.meta && prop.classRef.meta.overlay))
                return;
            const stmts = prop.getter.statements;
            if (!(stmts.length === 1 && stmts[0].stmtType === Ast_1.OneAst.StatementType.Return)) {
                this.log("Overlay field should contain exactly one return statement!");
                return;
            }
            const statements = AstHelper_1.AstHelper.clone(stmts);
            const varReplacer = new VariableReplacer();
            varReplacer.thisReplacement = expr.thisExpr;
            varReplacer.visitStatements(statements);
            const retStmt = statements[0];
            AstHelper_1.AstHelper.replaceProperties(expr, retStmt.expression);
        }
        visitExpressionStatement(stmt) {
            return this.visitExpression(stmt.expression, null);
        }
        /**
         * Goes through all statements in a block. One such statement can be converted
         * to more statements.
         */
        visitBlock(block) {
            const newStatements = [];
            for (const statement of block.statements) {
                const newValue = this.visitStatement(statement, null);
                if (Array.isArray(newValue))
                    newStatements.push(...newValue);
                else
                    newStatements.push(statement);
            }
            block.statements = newStatements;
        }
        process() {
            this.visitSchema(this.schemaCtx.schema, null);
        }
    }
    class ReplaceVariables extends AstVisitor_1.AstVisitor {
        constructor(schemaCtx) {
            super();
            this.schemaCtx = schemaCtx;
        }
        convertType(type) {
            if (!type)
                return;
            const cls = type.className && this.schemaCtx.getClass(type.className);
            if (cls && cls.meta && cls.meta.overlay)
                type.className = cls.fields["_one"].type.className;
            for (const typeArg of type.typeArguments || [])
                this.convertType(typeArg);
        }
        visitCastExpression(expr) {
            super.visitCastExpression(expr, null);
            this.convertType(expr.newType);
        }
        visitExpression(expr) {
            super.visitExpression(expr, null);
            this.convertType(expr.valueType);
        }
        visitVariable(stmt) {
            super.visitVariable(stmt, null);
            this.convertType(stmt.type);
        }
        visitMethod(method) {
            super.visitMethod(method, null);
            this.convertType(method.returns);
        }
        process() {
            this.visitSchema(this.schemaCtx.schema, null);
        }
    }
    class InlineOverlayTypesTransform {
        constructor() {
            this.name = "inlineOverlayTypes";
            this.dependencies = [];
        }
        transform(schemaCtx) {
            new ReplaceReferences(schemaCtx).process();
            new ReplaceVariables(schemaCtx).process();
        }
    }
    exports.InlineOverlayTypesTransform = InlineOverlayTypesTransform;
});
//# sourceMappingURL=InlineOverlayTypesTransform.js.map