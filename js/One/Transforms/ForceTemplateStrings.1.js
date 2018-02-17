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
    class ForceTemplateStrings extends AstVisitor_1.AstVisitor {
        infixCollect(expr, result) {
            if (expr.operator === "+") {
                for (const child of [expr.left, expr.right]) {
                    if (child.exprKind === "Binary") {
                        this.infixCollect(child, result);
                    }
                    else {
                        result.push(child);
                    }
                }
            }
            else {
                result.push(expr);
            }
        }
        visitBinaryExpression(expr) {
            if (expr.operator === "+" && expr.left.valueType.isString) {
                const exprList = [];
                this.infixCollect(expr, exprList);
                const parts = exprList.map(x => {
                    if (x.exprKind === "Literal" && x.literalType === "string")
                        return { literal: true, text: x.value };
                    else
                        return { literal: false, expr: x };
                });
                const tmplStr = { exprKind: "TemplateString", parts };
                AstHelper_1.AstHelper.replaceProperties(expr, tmplStr);
            }
            else {
                super.visitBinaryExpression(expr, null);
            }
        }
        transform(schemaCtx) {
            this.visitSchema(schemaCtx.schema, null);
        }
    }
    exports.ForceTemplateStrings = ForceTemplateStrings;
});
//# sourceMappingURL=ForceTemplateStrings.1.js.map