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
    class IncludesCollector extends AstVisitor_1.AstVisitor {
        constructor(lang) {
            super();
            this.lang = lang;
            this.includes = new Set(lang.includes || []);
        }
        useInclude(className, methodName) {
            const cls = this.lang.classes[className];
            if (!cls)
                return;
            const includes = (cls.includes || []).concat(cls.methods && methodName ? cls.methods[methodName].includes || [] : []);
            for (const include of includes)
                this.includes.add(include);
        }
        visitExpression(expression) {
            super.visitExpression(expression, null);
            const templateObj = this.lang.expressions[expression.exprKind.lcFirst()];
            if (typeof templateObj === "object" && templateObj.includes)
                for (const include of templateObj.includes)
                    this.includes.add(include);
        }
        visitBinaryExpression(expr) {
            super.visitBinaryExpression(expr, null);
            // TODO: code duplicated from code generator -> unify these logics into one
            const leftType = expr.left.valueType.repr();
            const rightType = expr.right.valueType.repr();
            const opName = `${leftType} ${expr.operator} ${rightType}`;
            const op = this.lang.operators && this.lang.operators[opName];
            if (!op)
                return;
            for (const include of op.includes || [])
                this.includes.add(include);
        }
        visitMethodReference(methodRef) {
            super.visitMethodReference(methodRef, null);
            this.useInclude(methodRef.valueType.classType.className, methodRef.valueType.methodName);
        }
        visitClassReference(classRef) {
            super.visitClassReference(classRef, null);
            this.useInclude(classRef.valueType.className);
        }
        process(schema) {
            this.visitSchema(schema, null);
        }
    }
    exports.IncludesCollector = IncludesCollector;
});
//# sourceMappingURL=IncludesCollector.js.map