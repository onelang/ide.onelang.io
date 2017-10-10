(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../AstVisitor", "../AstHelper"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const AstVisitor_1 = require("../AstVisitor");
    const AstHelper_1 = require("../AstHelper");
    class VariableContext {
        constructor() {
            this.variables = {};
        }
    }
    class TransformPropInfo {
        constructor(propertyName, propValue) {
            this.propertyName = propertyName;
            if (typeof propValue === "string" && propValue.startsWith("$")) {
                this.type = "saveVar";
                this.saveVarName = propValue.substr(1);
            }
            else if (typeof propValue === "object") {
                this.type = "matchObject";
                this.matchObject = new TransformObjectInfo(propValue);
            }
            else {
                this.type = "matchValue";
                this.matchValue = propValue;
            }
        }
        execute(varCtx, value) {
            if (this.type === "saveVar") {
                varCtx.variables[this.saveVarName] = value;
                return true;
            }
            else if (this.type === "matchValue") {
                return this.matchValue === value;
            }
            else if (this.type === "matchObject") {
                return this.matchObject.execute(varCtx, value);
            }
        }
    }
    class TransformObjectInfo {
        constructor(source) {
            this.properties = Object.keys(source).map(x => new TransformPropInfo(x, source[x]));
        }
        execute(varCtx, value) {
            for (const prop of this.properties)
                if (!prop.execute(varCtx, value[prop.propertyName]))
                    return false;
            return true;
        }
    }
    class ValueSetter {
        constructor(value) {
        }
    }
    class GenericTransform {
        constructor(input, output) {
            this.input = new TransformObjectInfo(input);
            this.output = output;
        }
        objectGenerator(template, varCtx) {
            if (Array.isArray(template)) {
                return template.map(x => this.objectGenerator(x, varCtx));
            }
            else if (typeof template === "string" && template.startsWith("$")) {
                return varCtx.variables[template.substr(1)];
            }
            else if (typeof template === "object") {
                const result = {};
                for (const propName of Object.keys(template))
                    result[propName] = this.objectGenerator(template[propName], varCtx);
                return result;
            }
            else {
                return template;
            }
        }
        execute(obj) {
            const varCtx = new VariableContext();
            const match = this.input.execute(varCtx, obj);
            if (match) {
                const newObj = this.objectGenerator(this.output, varCtx);
                AstHelper_1.AstHelper.replaceProperties(obj, newObj);
            }
            return match;
        }
    }
    class GenericTransformer extends AstVisitor_1.AstVisitor {
        constructor(file) {
            super();
            this.transforms = Object.values(file.transforms).map(x => new GenericTransform(x.input, x.output));
        }
        visitExpression(expression) {
            for (const transform of this.transforms)
                if (transform.execute(expression))
                    break;
            super.visitExpression(expression, null);
        }
        process(schema) {
            this.visitSchema(schema, null);
        }
    }
    exports.GenericTransformer = GenericTransformer;
});
//# sourceMappingURL=GenericTransformer.js.map