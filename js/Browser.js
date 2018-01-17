(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./UI/AppLayout", "./Generator/LangConfigs", "./Utils/ExposedPromise", "./OneCompiler", "./One/OverviewGenerator", "./One/AstHelper"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const AppLayout_1 = require("./UI/AppLayout");
    const LangConfigs_1 = require("./Generator/LangConfigs");
    const ExposedPromise_1 = require("./Utils/ExposedPromise");
    const OneCompiler_1 = require("./OneCompiler");
    const OverviewGenerator_1 = require("./One/OverviewGenerator");
    const AstHelper_1 = require("./One/AstHelper");
    const testPrgName = "InheritanceTest";
    const qs = {};
    location.search.substr(1).split('&').map(x => x.split('=')).forEach(x => qs[x[0]] = x[1]);
    const localhost = location.hostname === "127.0.0.1" || location.hostname === "localhost";
    const serverhost = "server" in qs ? qs["server"] : (localhost && "127.0.0.1");
    const httpsMode = serverhost && serverhost.startsWith("https://");
    async function downloadTextFile(url) {
        const response = await (await fetch(url)).text();
        return response;
    }
    async function runLang(langConfig, code) {
        if (code) {
            langConfig.request.code = code;
            langConfig.request.stdlibCode = layout.langs[langConfig.name].stdLibHandler.getContent();
        }
        const endpoint = httpsMode ? `${serverhost}/${langConfig.httpsEndpoint || "compile"}` :
            `http://${serverhost}:${langConfig.port}/compile`;
        const response = await fetch(endpoint, {
            method: 'post',
            mode: 'cors',
            body: JSON.stringify(langConfig.request)
        });
        const responseJson = await response.json();
        console.log(langConfig.name, responseJson);
        if (responseJson.exceptionText)
            console.log(langConfig.name, "Exception", responseJson.exceptionText);
        return responseJson;
    }
    const layout = new AppLayout_1.Layout(["typescript" /*, "csharp"*/]);
    function escapeHtml(unsafe) {
        return unsafe.toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    function html(parts, ...args) {
        return function (obj) {
            let html = parts[0];
            for (let i = 0; i < args.length; i++)
                html += escapeHtml(args[i]) + parts[i + 1];
            obj.html(html);
            return obj;
        };
    }
    class CompileHelper {
        constructor(langConfigs) {
            this.langConfigs = langConfigs;
        }
        async setContent(handler, url) {
            const content = await downloadTextFile(url);
            handler.setContent(content);
        }
        async init() {
            const tasks = [];
            for (const lang of layout.inputLangs)
                tasks.push(this.setContent(layout.langs[lang].overlayHandler, `langs/NativeResolvers/${lang}.ts`));
            tasks.push(this.setContent(layout.oneStdLibHandler, `langs/StdLibs/stdlib.d.ts`));
            tasks.push(this.setContent(layout.genericTransformsHandler, `langs/NativeResolvers/GenericTransforms.yaml`));
            for (const lang of Object.values(this.langConfigs)) {
                tasks.push(this.setContent(layout.langs[lang.name].generatorHandler, `langs/${lang.name}.yaml`));
                tasks.push(this.setContent(layout.langs[lang.name].stdLibHandler, `langs/StdLibs/${lang.stdlibFn}`));
            }
            await Promise.all(tasks);
        }
        setProgram(programCode, langName) {
            this.compiler = new OneCompiler_1.OneCompiler();
            const overlayContent = layout.langs[langName].overlayHandler.getContent();
            const oneStdLibContent = layout.oneStdLibHandler.getContent();
            const genericTransforms = layout.genericTransformsHandler.getContent();
            this.compiler.parse(langName, programCode, overlayContent, oneStdLibContent, genericTransforms);
            this.astOverview = new OverviewGenerator_1.OverviewGenerator().generate(this.compiler.schemaCtx);
            this.astJsonOverview = AstHelper_1.AstHelper.toJson(this.compiler.schemaCtx.schema);
        }
        compile(langName) {
            const lang = this.langConfigs[langName];
            const schemaYaml = layout.langs[langName].generatorHandler.getContent();
            const code = this.compiler.compile(schemaYaml, langName, true);
            return code;
        }
    }
    const compileHelper = new CompileHelper(LangConfigs_1.langConfigs);
    async function runLangUi(langName, codeCallback) {
        const langUi = layout.langs[langName];
        langUi.statusBar.text("loading...");
        try {
            const langConfig = LangConfigs_1.langConfigs[langName];
            const code = codeCallback();
            if (!serverhost) {
                html `<span class="label error">error</span><a class="compilerMissing" href="https://github.com/koczkatamas/onelang/wiki/Compiler-backend" target="_blank">Compiler backend is missing!</a>`(langUi.statusBar);
                return;
            }
            const respJson = await runLang(langConfig, code);
            if (respJson.exceptionText) {
                langUi.statusBar.attr("title", respJson.exceptionText);
                html `<span class="label error">error</span>${respJson.exceptionText}`(langUi.statusBar);
            }
            else {
                let result = respJson.result;
                result = result === null ? "<null>" : result.toString();
                if (result.endsWith("\n"))
                    result = result.substr(0, result.length - 1);
                langUi.statusBar.attr("title", result);
                html `<span class="label success">${respJson.elapsedMs}ms</span><span class="result">${result || "<no result>"}</span>`(langUi.statusBar);
                return result;
            }
        }
        catch (e) {
            html `<span class="label error">error</span>${e}`(langUi.statusBar);
            //langUi.changeHandler.setContent(`${e}`);
        }
    }
    let AceRange = require("ace/range").Range;
    class MarkerManager {
        constructor() {
            this.markerRemovalCallbacks = [];
        }
        addMarker(editor, start, end, focus) {
            const session = editor.getSession();
            const document = session.getDocument();
            const startPos = document.indexToPosition(start, 0);
            const endPos = document.indexToPosition(end, 0);
            const range = new AceRange(startPos.row, startPos.column, endPos.row, endPos.column);
            const markerId = session.addMarker(range, startPos.row !== endPos.row ? "ace_step_multiline" : "ace_step", "text", false);
            this.markerRemovalCallbacks.push(() => session.removeMarker(markerId));
            if (focus) {
                editor.renderer.scrollCursorIntoView({ row: endPos.row, column: endPos.column + 3 }, 0.5);
                editor.renderer.scrollCursorIntoView({ row: startPos.row, column: startPos.column - 3 }, 0.5);
            }
        }
        removeMarkers() {
            for (const cb of this.markerRemovalCallbacks)
                cb();
        }
        getFileOffset(editor) {
            return editor.getSession().getDocument().positionToIndex(editor.getCursorPosition(), 0);
        }
    }
    let markerManager = new MarkerManager();
    function initLayout() {
        layout.init();
        layout.onEditorChange = async (sourceLang, newContent) => {
            console.log("editor change", sourceLang, newContent);
            markerManager.removeMarkers();
            if (layout.inputLangs.includes(sourceLang)) {
                compileHelper.setProgram(newContent, sourceLang);
                const sourceLangPromise = new ExposedPromise_1.ExposedPromise();
                await Promise.all(Object.keys(layout.langs).map(async (langName) => {
                    const langUi = layout.langs[langName];
                    const isSourceLang = langName === sourceLang;
                    const result = await runLangUi(langName, () => {
                        const code = compileHelper.compile(langName);
                        (isSourceLang ? langUi.generatedHandler : langUi.changeHandler).setContent(code);
                        if (isSourceLang) {
                            langUi.astHandler.setContent(compileHelper.astOverview);
                            langUi.astJsonHandler.setContent(compileHelper.astJsonOverview);
                        }
                        return code;
                    });
                    if (isSourceLang)
                        sourceLangPromise.resolve(result);
                    const sourceLangResult = await sourceLangPromise;
                    const isMatch = result === sourceLangResult;
                    langUi.statusBar.find(".label").removeClass("success").addClass(isMatch ? "success" : "error");
                }));
            }
            else {
                runLangUi(sourceLang, () => newContent);
            }
        };
        window["layout"] = layout;
        for (const inputLang_ of layout.inputLangs) {
            const inputLang = inputLang_;
            const inputEditor = layout.langs[inputLang].changeHandler.editor;
            inputEditor.getSelection().on('changeCursor', () => {
                if (!compileHelper.compiler || compileHelper.compiler.langName !== inputLang)
                    return;
                markerManager.removeMarkers();
                const index = markerManager.getFileOffset(inputEditor);
                const node = compileHelper.compiler.parser.nodeManager.getNodeAtOffset(index);
                if (!node)
                    return;
                console.log(index, node);
                markerManager.addMarker(inputEditor, node.nodeData.sourceRange.start, node.nodeData.sourceRange.end, false);
                for (const langName of Object.keys(node.nodeData.destRanges)) {
                    const dstRange = node.nodeData.destRanges[langName];
                    markerManager.addMarker(layout.langs[langName].generatedHandler.editor, dstRange.start, dstRange.end, true);
                }
            });
        }
    }
    async function setupTestProgram() {
        const testPrg = await downloadTextFile(`input/${testPrgName}.ts`);
        layout.langs["typescript"].changeHandler.setContent(testPrg.replace(/\r\n/g, '\n'), true);
    }
    async function main() {
        initLayout();
        await compileHelper.init();
        await setupTestProgram();
    }
    main();
});
//# sourceMappingURL=Browser.js.map