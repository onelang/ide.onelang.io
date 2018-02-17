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
    class ExtractCommentAttributes extends AstTransformer_1.AstTransformer {
        processTrivia(trivia) {
            const result = {};
            if (trivia !== "") {
                const matches = /(?:\n|^)\s*(?:\/\/|#)\s*@([a-z0-9_.-]+)(?: ([^\n]+)|$|\n)/g.matches(trivia);
                for (const match of matches)
                    result[match[1]] = match[2] || true;
            }
            return result;
        }
        visitMethodLike(method) {
            method.attributes = this.processTrivia(method.leadingTrivia);
            super.visitMethodLike(method, null);
        }
        visitClass(cls) {
            cls.attributes = this.processTrivia(cls.leadingTrivia);
            super.visitClass(cls, null);
        }
        visitInterface(intf) {
            intf.attributes = this.processTrivia(intf.leadingTrivia);
            super.visitInterface(intf, null);
        }
    }
    exports.ExtractCommentAttributes = ExtractCommentAttributes;
});
//# sourceMappingURL=ExtractCommentAttributes.js.map