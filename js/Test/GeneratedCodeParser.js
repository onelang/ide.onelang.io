(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../Parsers/TypeScriptParser2", "../Parsers/CSharpParser", "../Utils/NodeUtils", "../One/AstHelper", "../OneCompiler", "../Parsers/RubyParser"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const TypeScriptParser2_1 = require("../Parsers/TypeScriptParser2");
    const CSharpParser_1 = require("../Parsers/CSharpParser");
    const NodeUtils_1 = require("../Utils/NodeUtils");
    const AstHelper_1 = require("../One/AstHelper");
    const OneCompiler_1 = require("../OneCompiler");
    const RubyParser_1 = require("../Parsers/RubyParser");
    require("../Utils/Extensions.js");
    const fs = require("fs");
    global["YAML"] = require('yamljs');
    let prgNames = fs.readdirSync("generated").filter(x => !x.startsWith("."));
    let prgExcludeList = ["stdlib", "overlay", "TemplateTests", "LICENSE"];
    prgNames = prgNames.filter(x => !prgExcludeList.includes(x));
    const stdlibCode = NodeUtils_1.readFile(`langs/StdLibs/stdlib.d.ts`);
    const genericTransforms = NodeUtils_1.readFile(`langs/NativeResolvers/GenericTransforms.yaml`);
    const langs = {
        typescript: { ext: "ts", parse: src => TypeScriptParser2_1.TypeScriptParser2.parseFile(src) },
        csharp: { ext: "cs", parse: src => CSharpParser_1.CSharpParser.parseFile(src) },
        ruby: { ext: "rb", parse: src => RubyParser_1.RubyParser.parseFile(src) },
    };
    let langsToTest = Object.keys(langs);
    langsToTest = ["ruby"];
    //prgNames = ["HelloWorld"];
    //prgExcludeList = [...prgExcludeList, "OneLang2", "StrReplaceTest"]
    for (const langName of langsToTest) {
        const langData = langs[langName];
        const overlayCode = NodeUtils_1.readFile(`langs/NativeResolvers/${langName}.ts`);
        for (const prgName of prgNames) {
            const fn = `generated/${prgName}/results/${prgName}.${langData.ext}`;
            console.log(`Parsing '${fn}'...`);
            let content = NodeUtils_1.readFile(fn);
            const schema = langData.parse(content);
            NodeUtils_1.writeFile(`generated/${prgName}/regen/0_Original_${langData.ext}.json`, AstHelper_1.AstHelper.toJson(schema));
            const compiler = new OneCompiler_1.OneCompiler();
            compiler.saveSchemaStateCallback = (type, schemaType, name, data) => {
                if (schemaType !== "program")
                    return;
                NodeUtils_1.writeFile(`generated/${prgName}/regen/schemaStates_${langName}/${name}.${type === "overviewText" ? "txt" : "json"}`, data);
            };
            compiler.parse(langName, content, overlayCode, stdlibCode, genericTransforms);
        }
    }
});
//# sourceMappingURL=GeneratedCodeParser.js.map