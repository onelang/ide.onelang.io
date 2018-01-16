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
    class FillNameTransform {
        constructor() {
            this.name = "fillName";
        }
        transform(schemaCtx) {
            const schema = schemaCtx.schema;
            for (const globName of Object.keys(schema.globals))
                schema.globals[globName].name = globName;
            for (const enumName of Object.keys(schema.enums))
                schema.enums[enumName].name = enumName;
            for (const intfName of Object.keys(schema.interfaces))
                schema.interfaces[intfName].name = intfName;
            for (const className of Object.keys(schema.classes)) {
                const cls = schema.classes[className];
                cls.name = className;
                if (cls.constructor)
                    cls.constructor.name = "constructor";
                for (const propName of Object.keys(cls.properties))
                    cls.properties[propName].name = propName;
                for (const fieldName of Object.keys(cls.fields))
                    cls.fields[fieldName].name = fieldName;
                for (const methodName of Object.keys(cls.methods))
                    cls.methods[methodName].name = methodName;
            }
        }
    }
    exports.FillNameTransform = FillNameTransform;
});
//# sourceMappingURL=FillNameTransform.js.map