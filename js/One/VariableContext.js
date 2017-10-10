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
    class VariableContext {
        constructor(parentContext = null) {
            this.parentContext = parentContext;
            this.variables = {};
        }
        log(data) {
            console.log(`[VariableContext] ${data}`);
        }
        inherit() {
            return new VariableContext(this);
        }
        add(name, value) {
            if (name in this.variables)
                this.log(`Variable shadowing detected: ${name}`);
            this.variables[name] = value;
        }
        get(name) {
            let currContext = this;
            while (currContext !== null) {
                const result = currContext.variables[name];
                if (result)
                    return result;
                currContext = currContext.parentContext;
            }
            return null;
        }
    }
    exports.VariableContext = VariableContext;
});
//# sourceMappingURL=VariableContext.js.map