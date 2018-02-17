(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./../Ast", "../AstVisitor"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Ast_1 = require("./../Ast");
    const AstVisitor_1 = require("../AstVisitor");
    class InferCharacterTypes extends AstVisitor_1.AstVisitor {
        constructor() {
            super(...arguments);
            this.name = "inferCharacterTypes";
        }
        tryConvertLiteral(expr) {
            const litExpr = expr;
            if (expr.exprKind === Ast_1.OneAst.ExpressionKind.Literal && litExpr.literalType === "string" && litExpr.value.length === 1) {
                expr.valueType = Ast_1.OneAst.Type.Class("OneCharacter");
                litExpr.literalType = "character";
            }
        }
        visitBinaryExpression(expr) {
            super.visitBinaryExpression(expr, null);
            if (["==", "<=", ">="].includes(expr.operator)) {
                if (expr.left.valueType.isCharacter)
                    this.tryConvertLiteral(expr.right);
                else if (expr.right.valueType.isCharacter)
                    this.tryConvertLiteral(expr.left);
            }
        }
        transform(schemaCtx) {
            this.visitSchema(schemaCtx.schema, null);
        }
    }
    exports.InferCharacterTypes = InferCharacterTypes;
});
//# sourceMappingURL=UseTemplateStrings.js.map