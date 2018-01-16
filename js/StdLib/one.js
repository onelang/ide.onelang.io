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
    class Regex {
        static matchFromIndex(pattern, input, offset) {
            const regex = new RegExp(pattern, "gy");
            regex.lastIndex = offset;
            const matches = regex.exec(input);
            return matches === null ? null : Array.from(matches);
        }
    }
    exports.Regex = Regex;
    class Reflect {
        static getClass(obj) { return this.classes[obj.constructor.name.toLowerCase()]; }
        static getClassByName(name) { return this.classes[name.toLowerCase()]; }
        static setupClass(cls) { this.classes[cls.name.toLowerCase()] = cls; }
    }
    Reflect.classes = {};
    exports.Reflect = Reflect;
    class Class {
        constructor(typeObj, fields, methods) {
            this.typeObj = typeObj;
            this.fields = {};
            this.methods = {};
            this.name = typeObj.name;
            for (const field of fields) {
                field.cls = this;
                this.fields[field.name.toLowerCase()] = field;
            }
            for (const method of methods) {
                method.cls = this;
                this.methods[method.name.toLowerCase()] = method;
            }
        }
        getField(name) { return this.fields[name.toLowerCase()]; }
        getMethod(name) { return this.methods[name.toLowerCase()]; }
        getFields() { return Object.values(this.fields); }
        getMethods() { return Object.values(this.methods); }
    }
    exports.Class = Class;
    class Field {
        constructor(name, isStatic, type) {
            this.name = name;
            this.isStatic = isStatic;
            this.type = type;
        }
        getValue(obj) {
            const realObj = this.isStatic ? this.cls.typeObj : obj;
            return realObj[this.name];
        }
        setValue(obj, value) {
            const realObj = this.isStatic ? this.cls.typeObj : obj;
            realObj[this.name] = value;
        }
    }
    exports.Field = Field;
    class Method {
        constructor(name, isStatic, returnType, args) {
            this.name = name;
            this.isStatic = isStatic;
            this.returnType = returnType;
            this.args = args;
        }
        call(obj, args) {
            if (args.length !== this.args.length)
                throw new Error(`Expected ${this.args.length} arguments, but got ${args.length} in ${this.cls.name}::${this.name} call!`);
            const realObj = this.isStatic ? this.cls.typeObj : obj;
            const method = realObj[this.name];
            return method.apply(obj, args);
        }
    }
    exports.Method = Method;
    class MethodArgument {
        constructor(name, type) {
            this.name = name;
            this.type = type;
        }
    }
    exports.MethodArgument = MethodArgument;
});
//# sourceMappingURL=one.js.map