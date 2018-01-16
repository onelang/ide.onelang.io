(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../Utils/NodeUtils", "../Parsers/TypeScriptParser2"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    require("../Utils/Extensions.js");
    const fs = require("fs");
    const NodeUtils_1 = require("../Utils/NodeUtils");
    const TypeScriptParser2_1 = require("../Parsers/TypeScriptParser2");
    //const expr = new ExpressionParser(new Reader("3 * 2 === 6")).parse();
    //console.log(JSON.stringify(expr, null, 4));
    let prgNames = fs.readdirSync("input").filter(x => x.endsWith(".ts")).map(x => x.replace(".ts", ""));
    //prgNames = ["OneLang"];
    for (const prgName of prgNames) {
        console.log(`parsing ${prgName}...`);
        const sourceCode = NodeUtils_1.readFile(`input/${prgName}.ts`);
        TypeScriptParser2_1.TypeScriptParser2.parseFile(sourceCode);
    }
    console.log(`parsing StdLib...`);
    TypeScriptParser2_1.TypeScriptParser2.parseFile(NodeUtils_1.readFile(`langs/StdLibs/stdlib.d.ts`));
    console.log(`parsing NativeResolver...`);
    TypeScriptParser2_1.TypeScriptParser2.parseFile(NodeUtils_1.readFile(`langs/NativeResolvers/typescript.ts`));
});
//# sourceMappingURL=ParserTest.js.map