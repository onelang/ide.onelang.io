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
    class FillParentTransform extends AstVisitor_1.AstVisitor {
        constructor() {
            super(...arguments);
            this.name = "fillParent";
        }
        visitExpression(expression, parent) {
            expression.parentRef = parent;
            super.visitExpression(expression, expression);
        }
        visitStatement(statement, parent) {
            statement.parentRef = parent;
            super.visitStatement(statement, statement);
        }
        visitBlock(block, parent) {
            block.parentRef = parent;
            super.visitBlock(block, block);
        }
        visitMethodLike(method, parent) {
            method.classRef = parent;
            super.visitMethodLike(method, method);
        }
        visitField(field, parent) {
            field.classRef = parent;
            super.visitField(field, parent);
        }
        visitProperty(prop, parent) {
            prop.classRef = parent;
            super.visitProperty(prop, parent);
        }
        visitInterface(intf, parent) {
            intf.schemaRef = parent;
            super.visitInterface(intf, intf);
        }
        visitClass(cls, parent) {
            cls.schemaRef = parent;
            super.visitClass(cls, cls);
        }
        transform(schemaCtx) {
            const schema = schemaCtx.schema;
            this.visitSchema(schema, schema);
        }
    }
    exports.FillParentTransform = FillParentTransform;
});
//# sourceMappingURL=FillParentTransform.js.map