(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ExprLangAstPrinter {
        static removeOuterParen(repr) {
            return repr.startsWith("(") && repr.endsWith(")") ? repr.substr(1, repr.length - 2) : repr;
        }
        static print(expr) {
            if (expr.kind === "literal") {
                const litExpr = expr;
                return litExpr.type === "string" ? `"${litExpr.value.replace(/"/g, '\\"')}"` : `${litExpr.value}`;
            }
            else if (expr.kind === "identifier") {
                return expr.text;
            }
            else if (expr.kind === "unary") {
                const unaryExpr = expr;
                const exprRepr = this.print(unaryExpr.expr);
                return `(${unaryExpr.op}${exprRepr})`;
            }
            else if (expr.kind === "binary") {
                const binaryExpr = expr;
                const leftRepr = this.print(binaryExpr.left);
                const rightRepr = this.print(binaryExpr.right);
                return `(${leftRepr} ${binaryExpr.op} ${rightRepr})`;
            }
            else if (expr.kind === "parenthesized") {
                const parenExpr = expr;
                const exprRepr = this.print(parenExpr.expr);
                return `(${this.removeOuterParen(exprRepr)})`;
            }
            else if (expr.kind === "conditional") {
                const condExpr = expr;
                const condRepr = this.print(condExpr.condition);
                const thenRepr = this.print(condExpr.whenTrue);
                const elseRepr = this.print(condExpr.whenFalse);
                return `(${condRepr} ? ${thenRepr} : ${elseRepr})`;
            }
            else if (expr.kind === "call") {
                const callExpr = expr;
                const methodRepr = this.print(callExpr.method);
                const argReprs = callExpr.arguments.map(arg => this.print(arg));
                return `(${methodRepr}(${argReprs.join(", ")}))`;
            }
            else if (expr.kind === "propertyAccess") {
                const propAccExpr = expr;
                const objectRepr = this.print(propAccExpr.object);
                return `(${objectRepr}.${propAccExpr.propertyName})`;
            }
            else if (expr.kind === "elementAccess") {
                const elemAccExpr = expr;
                const objectRepr = this.print(elemAccExpr.object);
                const elementRepr = this.print(elemAccExpr.elementExpr);
                return `(${objectRepr}[${elementRepr}])`;
            }
            else {
                throw new Error(`[AstPrinter] Unknown expression kind: '${expr.kind}'`);
            }
        }
    }
    exports.ExprLangAstPrinter = ExprLangAstPrinter;
});
//# sourceMappingURL=ExprLangAstPrinter.js.map