(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Ast"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Ast_1 = require("./Ast");
    class AstHelper {
        static replaceProperties(dest, src, keep = ["nodeData", "leadingTrivia"]) {
            dest.__proto__ = src.__proto__;
            for (var i in dest)
                if (!keep.includes(i))
                    delete dest[i];
            for (var i of Object.keys(src))
                if (!keep.includes(i))
                    dest[i] = src[i];
            return dest;
        }
        static methodRepr(method) {
            return `${method.classRef.name}::${method.name}(${method.parameters.map(x => x.type.repr()).join(", ")})`;
        }
        static toJson(obj) {
            const json = JSON.stringify(obj, (k, v) => {
                if (k.endsWith("Ref")) {
                    if (!v.metaPath) {
                        //console.log("Clone is not possible as metaPath is missing!");
                    }
                    return { metaPath: v.metaPath, name: v.name };
                }
                else {
                    return v;
                }
            }, 4);
            return json;
        }
        static clone(src) {
            const json = AstHelper.toJson(src);
            const clone = JSON.parse(json, (k, v) => {
                const type = v && v.$objType;
                if (type === "Type") {
                    return Ast_1.OneAst.Type.Load(v);
                }
                else if (type === "VariableRef") {
                    return Ast_1.OneAst.VariableRef.Load(v);
                }
                return v;
            });
            return clone;
        }
        static getMethodFromRef(lang, methodRef) {
            if (methodRef.methodRef.body)
                return methodRef.methodRef;
            const metaPath = methodRef.methodRef.metaPath;
            if (!metaPath)
                return null;
            const methodPathParts = metaPath.split("/");
            const cls = lang.classes[methodPathParts[0]];
            const method = cls && cls.methods && cls.methods[methodPathParts[1]];
            return method;
        }
        static isBinaryOpModifies(expr) {
            return ["=", "+=", "-=", "*=", "/=", "&=", "|=", "^=", "<<=", ">>="].includes(expr.operator);
        }
        static getModifiedExpr(expr) {
            if (expr.exprKind === "Unary")
                return expr.operand;
            else if (expr.exprKind === "Binary") {
                const binaryExpr = expr;
                if (AstHelper.isBinaryOpModifies(binaryExpr))
                    return binaryExpr.left;
            }
            return null;
        }
    }
    exports.AstHelper = AstHelper;
});
//# sourceMappingURL=AstHelper.js.map