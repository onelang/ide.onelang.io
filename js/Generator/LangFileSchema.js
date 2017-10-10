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
    var LangFileSchema;
    (function (LangFileSchema) {
        let Casing;
        (function (Casing) {
            Casing["PascalCase"] = "pascal_case";
            Casing["CamelCase"] = "camel_case";
            Casing["SnakeCase"] = "snake_case";
        })(Casing = LangFileSchema.Casing || (LangFileSchema.Casing = {}));
    })(LangFileSchema = exports.LangFileSchema || (exports.LangFileSchema = {}));
});
//# sourceMappingURL=LangFileSchema.js.map