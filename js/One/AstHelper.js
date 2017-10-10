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
        static replaceProperties(dest, src) {
            dest.__proto__ = src.__proto__;
            for (var i in dest)
                delete dest[i];
            for (var i of Object.keys(src))
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
    }
    exports.AstHelper = AstHelper;
});
//# sourceMappingURL=AstHelper.js.map