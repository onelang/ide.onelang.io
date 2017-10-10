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
    class ExposedPromise extends Promise {
        constructor(executor = null) {
            let resolve, reject;
            super((_resolve, _reject) => {
                resolve = _resolve;
                reject = _reject;
                if (executor)
                    executor(resolve, reject);
            });
            this.resolve = resolve;
            this.reject = reject;
        }
    }
    exports.ExposedPromise = ExposedPromise;
});
//# sourceMappingURL=ExposedPromise.js.map