(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./SchemaTransformer", "./Transforms/ResolveIdentifiersTransform"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const SchemaTransformer_1 = require("./SchemaTransformer");
    const ResolveIdentifiersTransform_1 = require("./Transforms/ResolveIdentifiersTransform");
    class SchemaContext {
        constructor(schema) {
            this.schema = schema;
            this.tiContext = new ResolveIdentifiersTransform_1.Context();
            this.transformer = SchemaTransformer_1.SchemaTransformer.instance;
        }
        ensureTransforms(...transformNames) {
            this.transformer.ensure(this, ...transformNames);
        }
        addDependencySchema(schema, type) {
            for (const glob of Object.values(schema.globals))
                this.tiContext.addLocalVar(glob);
            for (const cls of Object.values(schema.classes)) {
                cls.meta = cls.meta || {};
                cls.meta[type] = true;
                this.tiContext.classes.addClass(cls);
            }
        }
        getClass(name) {
            return this.schema.classes[name] || this.tiContext.classes.classes[name];
        }
    }
    exports.SchemaContext = SchemaContext;
});
//# sourceMappingURL=SchemaContext.js.map