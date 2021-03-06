(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "goldenlayout"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const GoldenLayout = require("goldenlayout");
    class LayoutItem {
        constructor(parent, contentItem) {
            this.parent = parent;
            this.contentItem = contentItem;
        }
        init() { }
    }
    exports.LayoutItem = LayoutItem;
    class Component extends LayoutItem {
        get component() { return (this.contentItem.isComponent ? this.contentItem : this.contentItem.contentItems[0]); }
        get container() { return this.component.container; }
        get element() { return this.container.getElement().get(0); }
        get title() { return this.component.config.title; }
        set title(newTitle) { this.component.setTitle(newTitle); }
        init() {
            var config = this.component && this.component.config;
            if (config && (typeof config.width === "number" || typeof config.height === "number"))
                this.container.setSize(config.width, config.height);
        }
    }
    exports.Component = Component;
    class ClosableComponent {
        constructor(parent, generator, show) {
            this.parent = parent;
            this.generator = generator;
            this.component = null;
            if (show)
                this.show();
        }
        get visible() { return this.component !== null; }
        set visible(show) {
            if (show === this.visible)
                return;
            if (show)
                this.show();
            else
                this.hide();
        }
        show() {
            this.component = this.generator(this.parent);
            if (this.lastHeight || this.lastWidth)
                this.component.container.setSize(this.lastWidth, this.lastHeight);
            this.component.container.on("resize", () => {
                var element = this.component.contentItem.element;
                this.lastHeight = element.outerHeight();
                this.lastWidth = element.outerWidth();
            });
            for (var event of ["destroy", "close"])
                this.component.container.on(event, () => {
                    this.component = null;
                    console.log("set");
                });
        }
        hide() {
            if (this.component)
                this.component.component.remove();
        }
    }
    exports.ClosableComponent = ClosableComponent;
    const fakeComponentName = "fakeComponent";
    class Container extends LayoutItem {
        constructor() {
            super(...arguments);
            this.children = [];
        }
        addChild(creator, props, cb) {
            this.contentItem.addChild(Object.assign({ isClosable: false, children: [] }, props));
            var newItem = new creator(this, this.contentItem.contentItems.last());
            newItem.init();
            this.children.push(newItem);
            if (cb)
                cb(newItem);
            return typeof (cb) === "undefined" ? newItem : this;
        }
        addContainer(type, cb) {
            return this.addChild(Container, { type: type }, cb);
        }
        addHorizontal(cb) { return this.addContainer("row", cb); }
        addVertical(cb) { return this.addContainer("column", cb); }
        addTabs(cb) { return this.addContainer("stack", cb); }
        remove(item) {
            this.children.remove(item);
            this.contentItem.removeChild(item.contentItem);
        }
        addComponent(title, cbOrProps, cb) {
            var props = typeof cbOrProps === "object" ? cbOrProps : null;
            cb = cb || (typeof cbOrProps === "function" ? cbOrProps : undefined);
            return this.addChild(Component, Object.assign({ type: "component", componentName: fakeComponentName, title: title }, props), cb);
        }
        addClosableComponent(generator, show, cb) {
            cb(new ClosableComponent(this, generator, show));
            return this;
        }
        setActiveTab(tabIndex) {
            this.contentItem.setActiveContentItem(this.contentItem.contentItems[tabIndex]);
            return this;
        }
        init() {
            for (var child of this.children)
                child.init();
        }
        setConfig(config) {
            Object.assign(this.contentItem.config, config);
            return this;
        }
    }
    exports.Container = Container;
    class LayoutManager {
        constructor(container = null) {
            console.log("container", container);
            this.goldenLayout = new GoldenLayout({ settings: { showCloseIcon: false, showPopoutIcon: false }, content: [] }, container);
            this.goldenLayout.registerComponent(fakeComponentName, function () { });
            this.goldenLayout.init();
            window.addEventListener("resize", () => this.goldenLayout.updateSize());
            this.root = new Container(null, this.goldenLayout.root);
        }
    }
    exports.LayoutManager = LayoutManager;
});
//# sourceMappingURL=LayoutManagerV2.js.map