(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../Utils/NodeUtils", "./ObjectComparer", "../Generator/OneTemplate/TemplateAstPrinter", "../Generator/ExprLang/ExprLangLexer", "../Generator/ExprLang/ExprLangParser", "../Generator/ExprLang/ExprLangAstPrinter", "../Generator/ExprLang/ExprLangVM", "../Generator/OneTemplate/TemplateParser", "../Generator/OneTemplate/TemplateGenerator"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const NodeUtils_1 = require("../Utils/NodeUtils");
    const ObjectComparer_1 = require("./ObjectComparer");
    const TemplateAstPrinter_1 = require("../Generator/OneTemplate/TemplateAstPrinter");
    const ExprLangLexer_1 = require("../Generator/ExprLang/ExprLangLexer");
    const ExprLangParser_1 = require("../Generator/ExprLang/ExprLangParser");
    const ExprLangAstPrinter_1 = require("../Generator/ExprLang/ExprLangAstPrinter");
    const ExprLangVM_1 = require("../Generator/ExprLang/ExprLangVM");
    const TemplateParser_1 = require("../Generator/OneTemplate/TemplateParser");
    const TemplateGenerator_1 = require("../Generator/OneTemplate/TemplateGenerator");
    const YAML = require('yamljs');
    const testFile = YAML.parse(NodeUtils_1.readFile("src/Test/TemplateTest.yaml"));
    function printTemplateAst(name, tmplAst) {
        const tmplAstJson = JSON.stringify(tmplAst, null, 4);
        NodeUtils_1.writeFile(`generated/TemplateTests/${name}.json`, tmplAstJson);
        const tmplSummary = new TemplateAstPrinter_1.TemplateAstPrinter().print(tmplAst);
        NodeUtils_1.writeFile(`generated/TemplateTests/${name}.txt`, tmplSummary);
    }
    class TestRunner {
        constructor(testFile) {
            this.testFile = testFile;
            this.failedTests = [];
        }
        runTests(tests, callback) {
            if (!tests)
                return;
            for (const name of Object.keys(tests)) {
                const test = tests[name];
                try {
                    if (!callback(name, test))
                        this.failedTests.push(name);
                }
                catch (e) {
                    console.log(`${name}: ERROR: ${e}`);
                    this.failedTests.push(name);
                }
            }
        }
        runTokenizerTests() {
            console.log('\n============== Tokenizer tests ==============');
            this.runTests(testFile.tokenizerTests, (expr, expectedDesc) => {
                const expected = Array.isArray(expectedDesc) ? expectedDesc.map(x => x.op ? new ExprLangLexer_1.Token("operator", x.op) :
                    x.i ? new ExprLangLexer_1.Token("identifier", x.i) :
                        x.n ? new ExprLangLexer_1.Token("number", x.n) :
                            x.s ? new ExprLangLexer_1.Token("string", x.s) :
                                "UNKNOWN") : expectedDesc;
                const summary = ObjectComparer_1.ObjectComparer.getFullSummary(expected, () => {
                    try {
                        return new ExprLangLexer_1.ExprLangLexer(expr, ExprLangParser_1.operators).tokens;
                    }
                    catch (e) {
                        if (e instanceof ExprLangLexer_1.ExprLangLexerException)
                            return { errorOffset: e.errorOffset, message: e.message };
                        else
                            throw e;
                    }
                });
                console.log(`${expr}: ${summary}`);
                return summary === "OK";
            });
        }
        runExpressionTests() {
            console.log('\n============== Expression tests ==============');
            this.runTests(testFile.expressionTests, (expr, expected) => {
                const parsed = ExprLangParser_1.ExprLangParser.parse(expr);
                const repr = ExprLangAstPrinter_1.ExprLangAstPrinter.removeOuterParen(ExprLangAstPrinter_1.ExprLangAstPrinter.print(parsed));
                if (repr.replace(/\s*/g, "") === expected.replace(/\s*/g, "")) {
                    console.log(`${expr}: OK`);
                    return true;
                }
                else {
                    console.log(`${expr}:`);
                    console.log(`  expected: ${expected}`);
                    console.log(`  got:      ${repr}`);
                }
            });
        }
        runExpressionAstTests() {
            console.log('\n============== Expression AST tests ==============');
            this.runTests(testFile.expressionAstTests, (expr, expected) => {
                const summary = ObjectComparer_1.ObjectComparer.getFullSummary(expected, () => ExprLangParser_1.ExprLangParser.parse(expr));
                console.log(`${expr}: ${summary}`);
                return summary === "OK";
            });
        }
        runVmTests() {
            console.log('\n============== Expression VM tests ==============');
            const model = {
                sum(a, b) { return a + b; },
                obj: {
                    a: 5,
                    b: 6,
                    method(c) { return this.a + this.b + c; }
                }
            };
            const vm = new ExprLangVM_1.ExprLangVM();
            vm.methodHandler = new ExprLangVM_1.JSMethodHandler();
            this.runTests(testFile.vmTests, (exprStr, test) => {
                const expr = ExprLangParser_1.ExprLangParser.parse(exprStr);
                const varContext = new ExprLangVM_1.VariableContext([
                    ExprLangVM_1.VariableSource.fromObject(model, "test runner model"),
                    ExprLangVM_1.VariableSource.fromObject(test.model, "test model")
                ]);
                const result = vm.evaluate(expr, varContext);
                const ok = result === test.expected;
                console.log(`${exprStr}: ${ok ? "OK" : "FAIL"} (${ok ? result : `got: ${result}, expected: ${test.expected}`})`);
                return ok;
            });
        }
        runTemplateTests() {
            console.log('\n============== Template tests ==============');
            this.runTests(testFile.templateTests, (name, test) => {
                const model = {
                    hasKey(obj, key) { return typeof obj[key] !== "undefined"; },
                };
                const tmplAst = TemplateParser_1.TemplateParser.parse(test.tmpl);
                printTemplateAst(name, tmplAst);
                const varContext = new ExprLangVM_1.VariableContext([
                    ExprLangVM_1.VariableSource.fromObject(model, "test runner model"),
                    ExprLangVM_1.VariableSource.fromObject(test.model, "test model")
                ]);
                const tmplGen = new TemplateGenerator_1.TemplateGenerator(varContext);
                for (const signature of Object.keys(test.methods || [])) {
                    const method = TemplateGenerator_1.TemplateMethod.fromSignature(signature, test.methods[signature]);
                    tmplGen.addMethod(method);
                    printTemplateAst(`${name}_${method.name}`, method.body);
                }
                const result = tmplGen.generate(tmplAst);
                const expected = (test.expected || "").replace(/\\n/g, "\n");
                const ok = result === expected;
                if (result.includes("\n") || expected.includes("\n")) {
                    if (ok) {
                        console.log(`${name}: OK ('${result.replace(/\n/g, "\\n")}')`);
                    }
                    else {
                        console.log(`${name}: FAIL\n  Got:\n    ${result.replace(/\n/g, "\n    ")}\n  Expected:\n    ${expected.replace(/\n/g, "\n    ")}`);
                    }
                }
                else {
                    console.log(`${name}: ${ok ? "OK" : "FAIL"} (${ok ? `'${result}'` : `got: '${result}', expected: '${expected}'`})`);
                }
                return ok;
            });
        }
    }
    const testRunner = new TestRunner(testFile);
    testRunner.runTokenizerTests();
    testRunner.runExpressionAstTests();
    testRunner.runExpressionTests();
    testRunner.runVmTests();
    testRunner.runTemplateTests();
    console.log(`\nTest summary: ${testRunner.failedTests.length === 0 ? "ALL SUCCESS" :
        `FAIL (${testRunner.failedTests.join(", ")})`}`);
});
//# sourceMappingURL=TemplateTest.js.map