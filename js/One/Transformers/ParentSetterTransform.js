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
            expression.parent = parent;
            super.visitExpression(expression, expression);
        }
        visitStatement(statement, parent) {
            statement.parent = parent;
            super.visitStatement(statement, statement);
        }
        visitBlock(block, parent) {
            block.parent = parent;
            super.visitBlock(block, block);
        }
        visitMethod(method, parent) {
            method.parent = parent;
            super.visitMethod(method, method);
        }
        visitClass(cls, parent) {
            cls.parent = parent;
            super.visitClass(cls, cls);
        }
        transform(schema) {
            this.visitSchema(schema, schema);
        }
    }
    exports.FillParentTransform = FillParentTransform;
});
//# sourceMappingURL=ParentSetterTransform.js.map