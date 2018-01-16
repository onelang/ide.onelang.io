(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../Ast", "../VariableContext", "../AstHelper", "../AstTransformer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Ast_1 = require("../Ast");
    const VariableContext_1 = require("../VariableContext");
    const AstHelper_1 = require("../AstHelper");
    const AstTransformer_1 = require("../AstTransformer");
    class Context {
        constructor(parent = null) {
            this.variables = null;
            this.variables = parent === null ? new VariableContext_1.VariableContext() : parent.variables.inherit();
        }
        addLocalVar(variable) {
            this.variables.add(variable.name, Ast_1.OneAst.VariableRef.MethodVariable(variable));
        }
        inherit() {
            return new Context(this);
        }
    }
    exports.Context = Context;
    class ResolveIdentifiersTransform extends AstTransformer_1.AstTransformer {
        constructor(schemaCtx) {
            super();
            this.schemaCtx = schemaCtx;
        }
        visitIdentifier(id, context) {
            const variable = context.variables.get(id.text);
            const cls = this.schemaCtx.getClass(id.text);
            const enum_ = this.schemaCtx.schema.enums[id.text];
            if (variable) {
                AstHelper_1.AstHelper.replaceProperties(id, variable);
            }
            else if (cls) {
                AstHelper_1.AstHelper.replaceProperties(id, new Ast_1.OneAst.ClassReference(cls));
            }
            else if (enum_) {
                AstHelper_1.AstHelper.replaceProperties(id, new Ast_1.OneAst.EnumReference(enum_));
            }
            else {
                this.log(`Could not find identifier: ${id.text}`);
            }
        }
        visitVariable(stmt, context) {
            super.visitVariable(stmt, context);
            context.addLocalVar(stmt);
        }
        visitForStatement(stmt, context) {
            this.visitExpression(stmt.itemVariable.initializer, context);
            const newContext = context.inherit();
            newContext.addLocalVar(stmt.itemVariable);
            this.visitExpression(stmt.condition, newContext);
            this.visitExpression(stmt.incrementor, newContext);
            this.visitBlock(stmt.body, newContext);
        }
        visitForeachStatement(stmt, context) {
            this.visitExpression(stmt.items, context);
            const newContext = context.inherit();
            newContext.addLocalVar(stmt.itemVariable);
            this.visitBlock(stmt.body, newContext);
        }
        tryToConvertImplicitVarDecl(stmt, context) {
            if (stmt.expression.exprKind !== Ast_1.OneAst.ExpressionKind.Binary)
                return false;
            const expr = stmt.expression;
            if (expr.operator !== "=" || expr.left.exprKind !== Ast_1.OneAst.ExpressionKind.Identifier)
                return false;
            const name = expr.left.text;
            if (context.variables.get(name) !== null)
                return false;
            const varDecl = AstHelper_1.AstHelper.replaceProperties(stmt, {
                stmtType: Ast_1.OneAst.StatementType.VariableDeclaration,
                name,
                initializer: expr.right,
            });
            this.visitVariableDeclaration(varDecl, context);
            return true;
        }
        visitExpressionStatement(stmt, context) {
            if (this.schemaCtx.schema.langData.allowImplicitVariableDeclaration && this.tryToConvertImplicitVarDecl(stmt, context))
                return;
            this.visitExpression(stmt.expression, context);
        }
        visitMethodLike(method, classContext) {
            const methodContext = classContext.inherit();
            for (const param of method.parameters)
                methodContext.variables.add(param.name, Ast_1.OneAst.VariableRef.MethodArgument(param));
            if (method.body)
                this.visitBlock(method.body, methodContext);
        }
        visitClass(cls, globalContext) {
            const classContext = globalContext.inherit();
            classContext.variables.add("this", new Ast_1.OneAst.ThisReference());
            super.visitClass(cls, classContext);
        }
        static transform(schemaCtx) {
            const globalContext = schemaCtx.tiContext.inherit();
            const trans = new ResolveIdentifiersTransform(schemaCtx);
            trans.visitSchema(schemaCtx.schema, globalContext);
        }
    }
    exports.ResolveIdentifiersTransform = ResolveIdentifiersTransform;
});
//# sourceMappingURL=ResolveIdentifiersTransform.js.map