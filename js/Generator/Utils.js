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
    function deindent(str) {
        function getPadLen(line) {
            for (let i = 0; i < line.length; i++)
                if (line[i] !== ' ')
                    return i;
            return -1; // whitespace line => pad === 0
        }
        const lines = str.split("\n");
        if (lines.length === 1)
            return str;
        if (getPadLen(lines[0]) === -1)
            lines.shift();
        const minPadLen = Math.min.apply(null, lines.map(getPadLen).filter(x => x !== -1));
        const newStr = lines.map(x => x.length !== 0 ? x.substr(minPadLen) : x).join("\n");
        return newStr;
    }
    exports.deindent = deindent;
});
//# sourceMappingURL=Utils.js.map