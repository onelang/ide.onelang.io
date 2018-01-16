(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../Ast", "../AstTransformer", "../AstHelper"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Ast_1 = require("../Ast");
    const AstTransformer_1 = require("../AstTransformer");
    const AstHelper_1 = require("../AstHelper");
    class FixGenericAndEnumTypes extends AstTransformer_1.AstTransformer {
        visitType(type) {
            super.visitType(type, null);
            if (!type || !type.isClassOrInterface)
                return;
            if ((this.currentClass && this.currentClass.typeArguments.includes(type.className)) ||
                (this.currentMethod && this.currentMethod.typeArguments.includes(type.className))) {
                AstHelper_1.AstHelper.replaceProperties(type, Ast_1.OneAst.Type.Generics(type.className));
            }
            else if (type.className in this.schema.enums) {
                AstHelper_1.AstHelper.replaceProperties(type, Ast_1.OneAst.Type.Enum(type.className));
            }
        }
    }
    exports.FixGenericAndEnumTypes = FixGenericAndEnumTypes;
});
//# sourceMappingURL=FixGenericAndEnumTypes.js.map