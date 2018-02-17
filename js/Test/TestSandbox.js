(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../OneCompiler", "../Utils/NodeUtils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const OneCompiler_1 = require("../OneCompiler");
    const NodeUtils_1 = require("../Utils/NodeUtils");
    require("../Utils/Extensions.js");
    global["YAML"] = require('yamljs');
    const programCode = `
<?php

class Calculator {
    // @signature calc(n: number): number
    function calc($n, $i) {
        if ($n <= 1) {
            return 1;
        } else {
            return $this->calc($n - 1, $i) * $n - $i;
        }
    }
}

$calc = new Calculator();
print("result = " . $calc->calc(10, 5) . "\n");
`.trim();
    const compiler = new OneCompiler_1.OneCompiler();
    compiler.saveSchemaStateCallback = (type, schemaType, name, data) => {
        if (type === "schemaJson" && schemaType === "program" && name === "0_Original")
            NodeUtils_1.writeFile("tmp/debug.json", data);
    };
    const overlayCode = NodeUtils_1.readFile(`langs/NativeResolvers/php.ts`);
    const stdlibCode = NodeUtils_1.readFile(`langs/StdLibs/stdlib.d.ts`);
    const genericTransforms = NodeUtils_1.readFile(`langs/NativeResolvers/GenericTransforms.yaml`);
    const tsYaml = NodeUtils_1.readFile(`langs/typescript.yaml`);
    const phpYaml = NodeUtils_1.readFile(`langs/php.yaml`);
    const csharpYaml = NodeUtils_1.readFile(`langs/csharp.yaml`);
    const rubyYaml = NodeUtils_1.readFile(`langs/ruby.yaml`);
    compiler.parse("php", programCode, overlayCode, stdlibCode, genericTransforms);
    const result = compiler.compile(rubyYaml, "ruby", true);
    console.log(result);
});
//# sourceMappingURL=TestSandbox.js.map