(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./AstVisitor"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const AstVisitor_1 = require("./AstVisitor");
    class AstTransformer extends AstVisitor_1.AstVisitor {
        visitMethod(method, context) {
            this.currentMethod = method;
            super.visitMethod(method, context);
            this.currentMethod = null;
        }
        visitClass(cls, context) {
            this.currentClass = cls;
            super.visitClass(cls, context);
            this.currentClass = null;
        }
        visitSchema(schema, context) {
            this.schema = schema;
            super.visitSchema(schema, context);
            this.schema = null;
        }
        process(schema) {
            this.visitSchema(schema, null);
        }
    }
    exports.AstTransformer = AstTransformer;
});
//# sourceMappingURL=AstTransformer.js.map