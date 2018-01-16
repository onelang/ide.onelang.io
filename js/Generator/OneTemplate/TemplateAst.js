(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TemplateAst;
    (function (TemplateAst) {
        class Block {
            constructor() {
                this.kind = "block";
                this.lines = [];
            }
        }
        TemplateAst.Block = Block;
        class Line {
            constructor() {
                this.kind = "line";
                this.inline = false;
                this.indentLen = 0;
                this.items = [];
            }
        }
        TemplateAst.Line = Line;
        class TextNode {
            constructor(value) {
                this.value = value;
                this.kind = "text";
            }
        }
        TemplateAst.TextNode = TextNode;
        class TemplateNode {
            constructor(expr) {
                this.expr = expr;
                this.kind = "template";
            }
        }
        TemplateAst.TemplateNode = TemplateNode;
        class ForNode {
            constructor(itemName, arrayExpr, inline, separator = "") {
                this.itemName = itemName;
                this.arrayExpr = arrayExpr;
                this.inline = inline;
                this.separator = separator;
                this.kind = "for";
            }
        }
        TemplateAst.ForNode = ForNode;
        class IfItem {
            constructor(condition, body) {
                this.condition = condition;
                this.body = body;
            }
        }
        TemplateAst.IfItem = IfItem;
        class IfNode {
            constructor() {
                this.kind = "if";
                this.items = [];
            }
        }
        TemplateAst.IfNode = IfNode;
    })(TemplateAst = exports.TemplateAst || (exports.TemplateAst = {}));
});
//# sourceMappingURL=TemplateAst.js.map