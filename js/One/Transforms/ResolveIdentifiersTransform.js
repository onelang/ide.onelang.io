(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../Ast", "../AstVisitor", "../VariableContext", "./InferTypesTransform", "../AstHelper"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Ast_1 = require("../Ast");
    const AstVisitor_1 = require("../AstVisitor");
    const VariableContext_1 = require("../VariableContext");
    const InferTypesTransform_1 = require("./InferTypesTransform");
    const AstHelper_1 = require("../AstHelper");
    class Context {
        constructor(parent = null) {
            this.variables = null;
            this.classes = null;
            this.variables = parent === null ? new VariableContext_1.VariableContext() : parent.variables.inherit();
            this.classes = parent === null ? new InferTypesTransform_1.ClassRepository() : parent.classes;
        }
        addLocalVar(variable) {
            this.variables.add(variable.name, Ast_1.OneAst.VariableRef.MethodVariable(variable));
        }
        inherit() {
            return new Context(this);
        }
    }
    exports.Context = Context;
    class ResolveIdentifiersTransform extends AstVisitor_1.AstVisitor {
        constructor() {
            super(...arguments);
            this.name = "resolveIdentifiers";
            this.dependencies = ["fillName"];
        }
        visitIdentifier(id, context) {
            const variable = context.variables.get(id.text);
            if (variable) {
                AstHelper_1.AstHelper.replaceProperties(id, variable);
            }
            else {
                const cls = context.classes.getClass(id.text);
                if (cls) {
                    AstHelper_1.AstHelper.replaceProperties(id, new Ast_1.OneAst.ClassReference(cls));
                }
                else {
                    this.log(`Could not find identifier: ${id.text}`);
                }
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
        transform(schemaCtx) {
            const globalContext = schemaCtx.tiContext.inherit();
            const classes = Object.values(schemaCtx.schema.classes);
            for (const cls of classes)
                globalContext.classes.addClass(cls);
            for (const cls of classes) {
                const classContext = globalContext.inherit();
                classContext.variables.add("this", new Ast_1.OneAst.ThisReference());
                for (const prop of Object.values(cls.properties)) {
                    this.visitBlock(prop.getter, classContext);
                }
                for (const method of Object.values(cls.methods)) {
                    const methodContext = classContext.inherit();
                    for (const param of method.parameters)
                        methodContext.variables.add(param.name, Ast_1.OneAst.VariableRef.MethodArgument(param));
                    if (method.body)
                        this.visitBlock(method.body, methodContext);
                }
            }
        }
    }
    exports.ResolveIdentifiersTransform = ResolveIdentifiersTransform;
});
//# sourceMappingURL=ResolveIdentifiersTransform.js.map