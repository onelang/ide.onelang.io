(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../AstTransformer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const AstTransformer_1 = require("../AstTransformer");
    class RemoveEmptyTemplateStringLiterals extends AstTransformer_1.AstTransformer {
        visitTemplateString(expr) {
            super.visitTemplateString(expr, null);
            expr.parts = expr.parts.filter(x => !x.literal || x.text !== "");
        }
    }
    exports.RemoveEmptyTemplateStringLiterals = RemoveEmptyTemplateStringLiterals;
});
//# sourceMappingURL=RemoveEmptyTemplateStringLiterals.js.map