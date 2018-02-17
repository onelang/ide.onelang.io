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
        constructor(schema, schemaType) {
            this.schema = schema;
            this.schemaType = schemaType;
            this.tiContext = new ResolveIdentifiersTransform_1.Context();
            this.transformer = SchemaTransformer_1.SchemaTransformer.instance;
        }
        log(msg) {
            console.log(`[SchemaContext] ${msg}`);
        }
        ensureTransforms(...transformNames) {
            this.transformer.ensure(this, ...transformNames);
        }
        addDependencySchema(schemaCtx) {
            if (schemaCtx.schemaType === "stdlib") {
                this.stdlib = schemaCtx;
            }
            else if (schemaCtx.schemaType === "overlay") {
                this.overlay = schemaCtx;
            }
            else {
                throw new Error("Only overlay and stdlib schemas are allowed as dependencies!");
            }
            for (const glob of Object.values(schemaCtx.schema.globals))
                this.tiContext.addLocalVar(glob);
            for (const cls of Object.values(schemaCtx.schema.classes)) {
                cls.meta = cls.meta || {};
                cls.meta[schemaCtx.schemaType] = true; // TODO: move this logic to somewhere else?
            }
        }
        getInterfaces(...rootIntfNames) {
            const todo = [...rootIntfNames];
            const seen = {};
            for (const item of rootIntfNames)
                seen[item] = true;
            const result = [];
            while (todo.length > 0) {
                const intfName = todo.shift();
                const intf = this.getClassOrInterface(intfName, intfName !== rootIntfNames[0]);
                if (!intf)
                    continue;
                result.push(intf);
                for (const baseIntfName of intf.baseInterfaces) {
                    if (seen[baseIntfName])
                        continue;
                    seen[baseIntfName] = true;
                    todo.push(baseIntfName);
                }
            }
            return result;
        }
        getFullChain(className) {
            return [...this.getClassChain(className), ...this.getInterfaces(className)];
        }
        getMethod(className, methodName) {
            let intfs = this.getInterfaces(className);
            if (intfs.length === 0)
                intfs = this.getClassChain(className);
            if (!intfs)
                return null;
            for (const intf of intfs) {
                const method = intf.methods[methodName];
                if (method)
                    return method;
            }
            return null;
        }
        getFieldOrProp(className, fieldName) {
            const classChain = this.getClassChain(className);
            if (!classChain)
                return null;
            for (const cls of classChain) {
                const fieldOrProp = cls.fields[fieldName] || cls.properties[fieldName];
                if (fieldOrProp)
                    return fieldOrProp;
            }
            return null;
        }
        findBaseClass(className1, className2) {
            const chain1 = this.getClassChain(className1);
            const chain2 = this.getClassChain(className2);
            if (!chain1 || !chain2)
                return null;
            const intfs1 = this.getInterfaces(...chain1.map(x => x.name)).filter(x => x.type.isInterface);
            const intfs2 = this.getInterfaces(...chain2.map(x => x.name)).filter(x => x.type.isInterface);
            for (const item1 of intfs1)
                if (intfs2.some(item2 => item2.name === item1.name))
                    return item1.type;
            return null;
        }
        getClass(name, required = false) {
            const result = this.schema.classes[name] || (this.overlay && this.overlay.schema.classes[name]) || (this.stdlib && this.stdlib.schema.classes[name]);
            if (required && !result)
                this.log(`Class was not found: ${name}`);
            return result;
        }
        getInterface(intfName, required = false) {
            const result = this.schema.interfaces[intfName] || null;
            if (required && !result)
                this.log(`Interface was not found: ${intfName}`);
            return result;
        }
        getClassOrInterface(className, required = true) {
            const intf = this.getInterface(className);
            if (intf)
                return intf;
            const cls = this.getClass(className);
            if (cls)
                return cls;
            if (required)
                this.log(`Class or interface is not found: ${className}`);
            return null;
        }
        getClassChain(className) {
            const result = [];
            let currClass = className;
            while (currClass) {
                const isOriginal = currClass === className;
                const cls = this.getClass(currClass, isOriginal);
                if (!cls && isOriginal)
                    return null;
                result.push(cls);
                currClass = cls.baseClass;
            }
            return result;
        }
    }
    exports.SchemaContext = SchemaContext;
});
//# sourceMappingURL=SchemaContext.js.map