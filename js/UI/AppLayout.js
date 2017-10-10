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
        constructor() {
            this.langs = {};
        }
        init() {
            this.manager = new LayoutManagerV2_1.LayoutManager();
            this.initLangComponents();
        }
        initLangComponents() {
            this.manager.root
                .addHorizontal(mainCols => mainCols
                .addVertical(rows => rows.setConfig({ width: 50 })
                .addComponent("TypeScript", c => this.initLang(c, "typescript"))
                .addHorizontal(cols => cols
                .addComponent("C++", c => this.initLang(c, "cpp", "c_cpp"))
                .addComponent("C#", c => this.initLang(c, "csharp")))
                .addHorizontal(cols => cols
                .addComponent("Go", c => this.initLang(c, "go", "swift"))
                .addComponent("Java", c => this.initLang(c, "java"))))
                .addVertical(rows => rows.setConfig({ width: 25 })
                .addComponent("Perl", c => this.initLang(c, "perl"))
                .addComponent("PHP", c => this.initLang(c, "php"))
                .addComponent("Python", c => this.initLang(c, "python")))
                .addVertical(rows => rows.setConfig({ width: 25 })
                .addComponent("Ruby", c => this.initLang(c, "ruby"))
                .addComponent("Swift", c => this.initLang(c, "swift"))
                .addComponent("JavaScript", c => this.initLang(c, "javascript"))));
            this.manager.root.init();
        }
        onEditorChange(lang, newContent) { }
        initLang(component, name, aceLang = null) {
            const parent = $(`
            <div class="editorDiv">
                <div class="aceEditor" />
                <div class="statusBar">status</div>
            </div>
            `).appendTo(component.element);
            const statusBar = parent.find('.statusBar');
            const editor = LayoutHelper.setupEditor(component, aceLang || name, parent.find('.aceEditor').get(0));
            const changeHandler = new EditorChangeHandler(editor, 500, (newContent, userChange) => {
                if (userChange)
                    this.onEditorChange(name, newContent);
            });
            this.langs[name] = { component, editor, changeHandler, statusBar };
        }
    }
    exports.Layout = Layout;
    class EditorChangeHandler {
        constructor(editor, delay, changeCallback) {
            this.editor = editor;
            this.changeCallback = changeCallback;
            this.editDelay = new Delayed(delay);
            if (this.editor)
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