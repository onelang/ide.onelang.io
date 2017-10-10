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
    class FillVariableMutability extends AstVisitor_1.AstVisitor {
        constructor(lang) {
            super();
            this.lang = lang;
        }
        visitBinaryExpression(expr, isMutable) {
            this.visitExpression(expr.left, expr.operator === "=");
            this.visitExpression(expr.right, false);
        }
        visitCallExpression(callExpr, isMutable) {
            const methodRef = callExpr.method;
            const metaPath = methodRef.methodRef.metaPath;
            const methodPath = metaPath && metaPath.replace(/\//g, ".");
            const method = this.lang.functions[methodPath];
            this.visitExpression(callExpr.method, method && method.mutates);
            for (const arg of callExpr.arguments)
                this.visitExpression(arg, false);
        }
        visitVariable(stmt) {
            stmt.isMutable = false;
            stmt.isUnused = true;
        }
        visitVariableRef(expr, isMutable) {
            if (expr.thisExpr)
                this.visitExpression(expr.thisExpr, false);
            if (isMutable)
                expr.varRef.isMutable = true;
            expr.varRef.isUnused = false;
        }
        visitUnaryExpression(expr) {
            this.visitExpression(expr.operand, true);
        }
        process(schema) {
            this.visitSchema(schema, false);
        }
    }
    exports.FillVariableMutability = FillVariableMutability;
});
//# sourceMappingURL=FillVariableMutability.js.map