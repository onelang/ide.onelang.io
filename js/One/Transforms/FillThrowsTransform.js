(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../AstVisitor", "../AstHelper"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const AstVisitor_1 = require("../AstVisitor");
    const AstHelper_1 = require("../AstHelper");
    class FillThrowsTransform extends AstVisitor_1.AstVisitor {
        constructor(lang) {
            super();
            this.lang = lang;
        }
        visitCallExpression(callExpr) {
            const method = AstHelper_1.AstHelper.getMethodFromRef(this.lang, callExpr.method);
            if (method && method.throws)
                this.throws = true;
            super.visitCallExpression(callExpr, null);
        }
        visitMethodLike(method) {
            this.throws = false;
            super.visitMethodLike(method, null);
            method.throws = this.throws;
        }
        process(schema) {
            this.visitSchema(schema, null);
        }
    }
    exports.FillThrowsTransform = FillThrowsTransform;
});
//# sourceMappingURL=FillThrowsTransform.js.map