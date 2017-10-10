(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../AstVisitor"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const AstVisitor_1 = require("../AstVisitor");
    class Context {
        constructor(path = []) {
            this.path = path;
            this.names = {};
        }
        subContext(name, unique) {
            const lastIdx = this.names[name];
            if (unique && lastIdx)
                console.log(`[FillMetaPath::Context] Variable shadowing: ${this.path.join("/")}/${name}`);
            const newIdx = (lastIdx || 0) + 1;
            this.names[name] = newIdx;
            const newName = unique ? name : `${name}(${newIdx})`;
            return new Context(this.path.concat(newName));
        }
    }
    exports.Context = Context;
    class FillMetaPathTransform extends AstVisitor_1.AstVisitor {
        constructor() {
            super(...arguments);
            this.name = "fillMetaPath";
            this.dependencies = ["fillName"];
        }
        subContext(oldContext, item, name) {
            const unique = !name;
            const newContext = oldContext.subContext(unique ? item.name : name, unique);
            if (!unique)
                item.name = newContext.path.last();
            item.metaPath = newContext.path.join("/");
            return newContext;
        }
        visitVariableDeclaration(stmt, context) {
            this.subContext(context, stmt);
        }
        visitIfStatement(stmt, context) {
            const ifContext = this.subContext(context, stmt, "if");
            this.visitExpression(stmt.condition, ifContext);
            this.visitBlock(stmt.then, this.subContext(ifContext, stmt.then, "then"));
            this.visitBlock(stmt.else, this.subContext(ifContext, stmt.then, "else"));
        }
        visitWhileStatement(stmt, context) {
            super.visitWhileStatement(stmt, this.subContext(context, stmt, "while"));
        }
        visitForStatement(stmt, context) {
            super.visitForStatement(stmt, this.subContext(context, stmt, "for"));
        }
        visitForeachStatement(stmt, context) {
            super.visitForeachStatement(stmt, this.subContext(context, stmt, "foreach"));
        }
        visitMethod(method, context) {
            super.visitMethod(method, this.subContext(context, method));
        }
        visitClass(cls, context) {
            super.visitClass(cls, this.subContext(context, cls));
        }
        transform(schemaCtx) {
            this.visitSchema(schemaCtx.schema, new Context());
        }
    }
    exports.FillMetaPathTransform = FillMetaPathTransform;
});
//# sourceMappingURL=FillMetaPathTransform.js.map