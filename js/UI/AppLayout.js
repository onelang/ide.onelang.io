(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./LayoutManagerV2", "ace/ace"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const LayoutManagerV2_1 = require("./LayoutManagerV2");
    const ace = require("ace/ace");
    class Layout {
        constructor(inputLangs) {
            this.inputLangs = inputLangs;
            this.langs = {};
        }
        init() {
            this.manager = new LayoutManagerV2_1.LayoutManager();
            this.initLangComponents();
        }
        addLang(container, title, langName, aceLang = null) {
            const isInput = this.inputLangs.includes(langName);
            const isTs = langName === "typescript";
            container.addTabs(tabs => {
                const langUi = {};
                tabs.addComponent(title, editorComp => {
                    langUi.editorComponent = editorComp;
                    const parent = $(`
                    <div class="editorDiv">
                        <div class="aceEditor" />
                        <div class="statusBar">status</div>
                    </div>
                `).appendTo(editorComp.element);
                    langUi.statusBar = parent.find('.statusBar');
                    langUi.editor = LayoutHelper.setupEditor(langUi.editorComponent, aceLang || langName, parent.find('.aceEditor').get(0));
                    langUi.changeHandler = new EditorChangeHandler(langUi.editor, 500, (newContent, userChange) => {
                        if (userChange && this.onEditorChange)
                            this.onEditorChange(langName, newContent);
                    });
                    if (!isTs)
                        langUi.generatedHandler = langUi.changeHandler;
                });
                if (isTs) {
                    tabs.addComponent("Generated", c => {
                        const editor = LayoutHelper.setupEditor(c, aceLang || langName);
                        langUi.generatedHandler = new EditorChangeHandler(editor, 500, (newContent, userChange) => {
                        });
                    });
                }
                tabs.addComponent("Generator", c => {
                    const editor = LayoutHelper.setupEditor(c, "yaml");
                    langUi.generatorHandler = new EditorChangeHandler(editor, 500, (newContent, userChange) => {
                    });
                });
                tabs.addComponent("StdLib", c => {
                    const editor = LayoutHelper.setupEditor(c, aceLang || langName);
                    langUi.stdLibHandler = new EditorChangeHandler(editor, 500, (newContent, userChange) => {
                    });
                });
                if (isInput) {
                    tabs.addComponent("Overlay", c => {
                        const editor = LayoutHelper.setupEditor(c, aceLang || langName);
                        langUi.overlayHandler = new EditorChangeHandler(editor, 500, (newContent, userChange) => {
                        });
                    });
                    tabs.addComponent("AST", c => {
                        const editor = LayoutHelper.setupEditor(c, "text");
                        langUi.astHandler = new EditorChangeHandler(editor, 500);
                    });
                    tabs.addComponent("AST (json)", c => {
                        const editor = LayoutHelper.setupEditor(c, "json");
                        langUi.astJsonHandler = new EditorChangeHandler(editor, 500);
                    });
                }
                if (isTs) {
                    // TODO: hack, these should be global tabs... on the other hand, the whole UI should be rethought, so whatever...
                    tabs.addComponent("Transforms", c => {
                        const editor = LayoutHelper.setupEditor(c, "yaml");
                        this.genericTransformsHandler = new EditorChangeHandler(editor, 500, (newContent, userChange) => {
                        });
                    });
                    tabs.addComponent("One StdLib", c => {
                        const editor = LayoutHelper.setupEditor(c, "typescript");
                        this.oneStdLibHandler = new EditorChangeHandler(editor, 500, (newContent, userChange) => {
                        });
                    });
                }
                tabs.setActiveTab(0);
                this.langs[langName] = langUi;
            });
            return container;
        }
        setup(container) {
            const c = container;
            c.addLang = (title, langName, aceLang) => this.addLang(container, title, langName, aceLang);
            return c;
        }
        initLangComponents() {
            this.manager.root
                .addHorizontal(mainCols => mainCols
                .addVertical(rows => this.setup(rows.setConfig({ width: 50 }))
                .addLang("TypeScript", "typescript")
                .addHorizontal(cols => this.setup(cols)
                .addLang("C++", "cpp", "c_cpp")
                .addLang("C#", "csharp"))
                .addHorizontal(cols => this.setup(cols)
                .addLang("Go", "go", "swift")
                .addLang("Java", "java")))
                .addVertical(rows => this.setup(rows.setConfig({ width: 25 }))
                .addLang("Perl", "perl")
                .addLang("PHP", "php")
                .addLang("Python", "python"))
                .addVertical(rows => this.setup(rows.setConfig({ width: 25 }))
                .addLang("Ruby", "ruby")
                .addLang("Swift", "swift")
                .addLang("JavaScript", "javascript")));
            this.manager.root.init();
        }
        onEditorChange(lang, newContent) { }
    }
    exports.Layout = Layout;
    class EditorChangeHandler {
        constructor(editor, delay, changeCallback = null) {
            this.editor = editor;
            this.changeCallback = changeCallback;
            this.editDelay = new Delayed(delay);
            if (this.editor && this.changeCallback)
                this.editor.on("change", () => {
                    const wasInternalChange = this.internalChange;
                    this.editDelay.do(() => this.changeCallback(this.editor.getValue(), !wasInternalChange));
                });
        }
        setContent(newContent, isUserChange = false) {
            if (!this.editor)
                return;
            if (this.editor.getValue() !== newContent) {
                this.internalChange = !isUserChange;
                this.editor.setValue(newContent, -1);
                this.internalChange = false;
            }
        }
        getContent() {
            return this.editor ? this.editor.getValue() : "";
        }
    }
    exports.EditorChangeHandler = EditorChangeHandler;
    class Delayed {
        constructor(delay) {
            this.delay = delay;
        }
        do(func) {
            if (this.timeout)
                clearTimeout(this.timeout);
            this.timeout = setTimeout(function () {
                this.timeout = null;
                func();
            }, this.delay);
        }
    }
    exports.Delayed = Delayed;
    class LayoutHelper {
        static setupEditor(container, lang, element) {
            var editor = ace.edit(element || container.element);
            editor.setTheme("ace/theme/monokai");
            editor.getSession().setMode(`ace/mode/${lang}`);
            editor.$blockScrolling = Infinity; // TODO: remove this line after they fix ACE not to throw warning to the console
            container.container.on("resize", () => editor.resize());
            return editor;
        }
    }
    exports.LayoutHelper = LayoutHelper;
});
//# sourceMappingURL=AppLayout.js.map