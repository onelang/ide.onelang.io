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
    class _ {
        static except(arr1, arr2) {
            return arr1.filter(item => !arr2.includes(item));
        }
        static intersect(arr1, arr2) {
            return arr1.filter(item => arr2.includes(item));
        }
    }
    exports._ = _;
});
//# sourceMappingURL=Underscore.js.map