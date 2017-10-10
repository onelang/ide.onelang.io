(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Utils/NodeUtils", "./OneCompiler", "./Generator/LangConfigs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    require("./Utils/Extensions.js");
    global["YAML"] = require('yamljs');
    const fs = require("fs");
    const NodeUtils_1 = require("./Utils/NodeUtils");
    const OneCompiler_1 = require("./OneCompiler");
    const LangConfigs_1 = require("./Generator/LangConfigs");
    const prgName = "Test";
    const compiler = new OneCompiler_1.OneCompiler();
    compiler.saveSchemaStateCallback = (type, schemaType, name, data) => {
        NodeUtils_1.writeFile(`tmp/${schemaType === "program" ? prgName : schemaType}_${name}.${type === "overviewText" ? "txt" : "json"}`, data);
    };
    const programCode = NodeUtils_1.readFile(`input/${prgName}.ts`);
    const overlayCode = NodeUtils_1.readFile(`langs/NativeResolvers/typescript.ts`);
    const stdlibCode = NodeUtils_1.readFile(`langs/StdLibs/stdlib.d.ts`);
    const genericTransforms = NodeUtils_1.readFile(`langs/NativeResolvers/GenericTransforms.yaml`);
    compiler.parseFromTS(programCode, overlayCode, stdlibCode, genericTransforms);
    const langs = Object.values(LangConfigs_1.langConfigs);
    for (const lang of langs) {
        //if (lang.name !== "go") continue;
        const langYaml = NodeUtils_1.readFile(`langs/${lang.name}.yaml`);
        const codeGen = compiler.getCodeGenerator(langYaml, lang.name);
        lang.request.code = codeGen.generate(true);
        NodeUtils_1.writeFile(`tmp/${prgName}.${codeGen.lang.extension}`, codeGen.generatedCode);
        NodeUtils_1.writeFile(`tmp/TemplateGenerators_${lang.name}.js`, codeGen.templateObjectCode);
    }
    // run compiled codes
    async function executeCodes() {
        await Promise.all(langs.map(async (lang) => {
            const result = await NodeUtils_1.jsonRequest(`http://127.0.0.1:${lang.port}/compile`, lang.request);
            console.log(lang.name, result);
        }));
    }
});
//executeCodes(); 
//# sourceMappingURL=app.js.map