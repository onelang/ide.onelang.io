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
    function readFile(fn) {
        const fs = require("fs");
        return fs.readFileSync(fn, "utf8");
    }
    exports.readFile = readFile;
    function writeFile(fn, data) {
        const fs = require("fs");
        const mkdirp = require('mkdirp');
        const path = require('path');
        mkdirp.sync(path.dirname(fn));
        fs.writeFileSync(fn, data);
    }
    exports.writeFile = writeFile;
    function jsonRequest(url, body) {
        return new Promise((resolve, reject) => {
            const request = require('request');
            request({ url, method: "POST", json: true, body }, function (error, response, body) {
                if (error)
                    reject(error);
                else
                    resolve(body);
            });
        });
    }
    exports.jsonRequest = jsonRequest;
});
//# sourceMappingURL=NodeUtils.js.map