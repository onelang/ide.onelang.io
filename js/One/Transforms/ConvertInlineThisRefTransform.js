(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../Ast", "../AstVisitor", "../AstHelper"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Ast_1 = require("../Ast");
    const AstVisitor_1 = require("../AstVisitor");
    const AstHelper_1 = require("../AstHelper");
    /**
     * Converts "<x>._one" to "<x>".
     */
    class ConvertInlineThisRefTransform extends AstVisitor_1.AstVisitor {
        constructor() {
            super(...arguments);
            this.name = "convertInlineThisRef";
            this.dependencies = ["inferTypes"];
        }
        visitVariableRef(expr) {
            if (expr.varType === Ast_1.OneAst.VariableRefType.InstanceField && expr.varRef.name === "_one") {
                AstHelper_1.AstHelper.replaceProperties(expr, expr.thisExpr);
            }
            else {
                super.visitVariableRef(expr, null);
            }
        }
        transform(schemaCtx) {
            this.visitSchema(schemaCtx.schema, null);
        }
    }
    exports.ConvertInlineThisRefTransform = ConvertInlineThisRefTransform;
});
//# sourceMappingURL=ConvertInlineThisRefTransform.js.map