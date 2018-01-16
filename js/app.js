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
    const NodeUtils_1 = require("./Utils/NodeUtils");
    const OneCompiler_1 = require("./OneCompiler");
    const LangConfigs_1 = require("./Generator/LangConfigs");
    const fs = require("fs");
    global["YAML"] = require('yamljs');
    global["debugOn"] = false;
    let prgNames = ["all"];
    const runPrg = false;
    const langFilter = "";
    const compileAll = prgNames[0] === "all";
    if (compileAll)
        prgNames = fs.readdirSync("input").filter(x => x.endsWith(".ts")).map(x => x.replace(".ts", ""));
    for (const prgName of prgNames) {
        const compiler = new OneCompiler_1.OneCompiler();
        compiler.saveSchemaStateCallback = (type, schemaType, name, data) => {
            NodeUtils_1.writeFile(`generated/${schemaType === "program" ? prgName : schemaType}/schemaStates/${name}.${type === "overviewText" ? "txt" : "json"}`, data);
        };
        const programCode = NodeUtils_1.readFile(`input/${prgName}.ts`).replace(/\r\n/g, '\n');
        const overlayCode = NodeUtils_1.readFile(`langs/NativeResolvers/typescript.ts`);
        const stdlibCode = NodeUtils_1.readFile(`langs/StdLibs/stdlib.d.ts`);
        const genericTransforms = NodeUtils_1.readFile(`langs/NativeResolvers/GenericTransforms.yaml`);
        compiler.parse("typescript", programCode, overlayCode, stdlibCode, genericTransforms);
        //const csharpLang = <LangFileSchema.LangFile> YAML.parse(readFile(`langs/csharp.yaml`));
        //const template = new Template(csharpLang.expressions["templateString"]);
        //const compiled = template.templateToJS(template.treeRoot, ["testValue"]);
        const langs = Object.values(LangConfigs_1.langConfigs);
        for (const lang of langs) {
            if (langFilter && lang.name !== langFilter)
                continue;
            console.log(`converting program '${prgName}' to ${lang.name}...`);
            //try {
            const langYaml = NodeUtils_1.readFile(`langs/${lang.name}.yaml`);
            const codeGen = compiler.getCodeGenerator(langYaml, lang.name);
            lang.request.code = codeGen.generate(true);
            NodeUtils_1.writeFile(`generated/${prgName}/results/${prgName}.${codeGen.lang.extension}`, codeGen.generatedCode);
            //} catch(e) {
            //    console.error(e);
            //}
        }
        // run compiled codes
        async function executeCodes() {
            console.log(" === START === ");
            var promises = langs.map(async (lang) => {
                if (langFilter && lang.name !== langFilter)
                    return true;
                const result = await NodeUtils_1.jsonRequest(`http://127.0.0.1:${lang.port}/compile`, lang.request);
                console.log(`${lang.name}: ${JSON.stringify(result.result || result.exceptionText || "?")}`);
                return true;
            });
            const results = await Promise.all(promises);
            console.log(" === DONE === ", results.every(x => x));
        }
        if (runPrg && !compileAll)
            executeCodes();
    }
});
//# sourceMappingURL=app.js.map