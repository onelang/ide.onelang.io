(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../Utils/Underscore"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Underscore_1 = require("../Utils/Underscore");
    class ObjectComparer {
        constructor(expected, value) {
            this.issues = [];
            this.compare([], expected, value);
        }
        addIssue(path, text) {
            this.issues.push(`/${path.join('/')}: ${text}`);
        }
        compare(path, expected, value) {
            if (typeof value !== typeof expected) {
                this.addIssue(path, `expected type '${typeof expected}', got '${typeof value}'`);
            }
            else if (typeof expected === "object" && Array.isArray(expected)) {
                const expectedArr = expected;
                const valueArr = value;
                if (expectedArr.length !== valueArr.length)
                    this.addIssue(path, `expected array with '${expectedArr.length}' items, got '${valueArr.length}'`);
                else {
                    for (let i = 0; i < expectedArr.length; i++)
                        this.compare([...path, `${i}`], expectedArr[i], valueArr[i]);
                }
            }
            else if (typeof expected === "object" && expected !== null && value !== null) {
                const expectedKeys = Object.keys(expected);
                const valueKeys = Object.keys(value);
                const unexpectedKeys = Underscore_1._.except(valueKeys, expectedKeys);
                if (unexpectedKeys.length > 0)
                    this.addIssue(path, `the following keys are not expected: ${unexpectedKeys.join(', ')}`);
                const missingKeys = Underscore_1._.except(expectedKeys, valueKeys);
                if (missingKeys.length > 0)
                    this.addIssue(path, `the following keys missing: ${missingKeys.join(', ')}`);
                for (const key of Underscore_1._.intersect(expectedKeys, valueKeys))
                    this.compare([...path, key], expected[key], value[key]);
            }
            else if (value !== expected) {
                this.addIssue(path, `expected value '${expected}', got '${value}'`);
            }
            else if (value === expected) {
            }
            else {
                this.addIssue(path, `unknown issue (should not happen)`);
            }
        }
        generateSummary() {
            return this.issues.length === 0 ? 'equals' :
                "issues:\n" + this.issues.map(x => ` - ${x}`).join("\n");
        }
        static getFullSummary(expected, valueGetter) {
            try {
                const value = valueGetter();
                const summary = new ObjectComparer(expected, value).generateSummary();
                if (summary === "equals")
                    return `OK`;
                else
                    return `${summary}\n  Expected: ${JSON.stringify(expected)}\n  Got:      ${JSON.stringify(value)}`;
            }
            catch (e) {
                return `Exception: ${e}`;
            }
        }
    }
    exports.ObjectComparer = ObjectComparer;
});
//# sourceMappingURL=ObjectComparer.js.map