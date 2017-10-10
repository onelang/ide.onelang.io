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
    class SchemaTransformHandler {
        constructor(schema) {
            this.schema = schema;
            this.transformers = {};
        }
        log(data) {
            console.log(`[SchemaTransformHandler] ${data}`);
        }
        addTransformer(trans) {
            this.transformers[trans.name] = trans;
        }
        ensureTransform(transformName) {
            if (this.schema.meta.transforms[transformName])
                return;
            const transformer = this.transformers[transformName];
            if (!transformer)
                this.log(`Transformer "${transformName}" not found!`);
            transformer.transform(this.schema);
            this.schema.meta.transforms[transformName] = true;
        }
    }
});
//# sourceMappingURL=SchemaHandler.js.map