(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./TemplateAst", "../ExprLang/ExprLangAstPrinter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const TemplateAst_1 = require("./TemplateAst");
    const ExprLangAstPrinter_1 = require("../ExprLang/ExprLangAstPrinter");
    // Node types: Block, Line, ForNode, IfNode, TextNode, TemplateNode
    // Block: BlockItem[]
    // BlockItem: Line | For | If
    // For: Body & Else can be Block (line-mode) or Line (inline-mode)
    // If: Item Body & Else can be Block (line-mode) or Line (inline-mode)
    class TemplateAstPrinter {
        constructor() {
            this.result = "";
            this.indent = -1;
        }
        addLine(line) {
            this.result += `${"  ".repeat(this.indent)}${line}\n`;
        }
        processNode(node) {
            this.indent++;
            if (node instanceof TemplateAst_1.TemplateAst.Block) {
                for (let iLine = 0; iLine < node.lines.length; iLine++) {
                    const line = node.lines[iLine];
                    const indentText = line instanceof TemplateAst_1.TemplateAst.Line ? ` [indent=${line.indentLen}]` : "";
                    this.addLine(`Line #${iLine + 1}${indentText}:`);
                    this.processNode(line);
                }
            }
            else if (node instanceof TemplateAst_1.TemplateAst.Line) {
                for (let iItem = 0; iItem < node.items.length; iItem++) {
                    const item = node.items[iItem];
                    let inlineValue = null;
                    if (item instanceof TemplateAst_1.TemplateAst.TextNode) {
                        inlineValue = `"${item.value.replace(/\n/g, "\\n")}"`;
                    }
                    else if (item instanceof TemplateAst_1.TemplateAst.TemplateNode) {
                        const exprText = ExprLangAstPrinter_1.ExprLangAstPrinter.print(item.expr);
                        inlineValue = `"${exprText}"`;
                    }
                    this.addLine(`Item #${iItem + 1}: ${inlineValue || ""}`);
                    if (!inlineValue)
                        this.processNode(item);
                }
            }
            else if (node instanceof TemplateAst_1.TemplateAst.ForNode) {
                const arrayExprText = ExprLangAstPrinter_1.ExprLangAstPrinter.print(node.arrayExpr);
                this.addLine(`For ${node.itemName} in ${arrayExprText}:${node.inline ? " [inline]" : ""}`);
                this.processNode(node.body);
                if (node.else) {
                    this.addLine(`Else:`);
                    this.processNode(node.else);
                }
            }
            else if (node instanceof TemplateAst_1.TemplateAst.IfNode) {
                let first = true;
                for (const item of node.items) {
                    const condText = ExprLangAstPrinter_1.ExprLangAstPrinter.print(item.condition);
                    this.addLine(`${first ? "If" : "Elif"} (${condText}):${node.inline ? " [inline]" : ""}`);
                    this.processNode(item.body);
                    first = false;
                }
                if (node.else) {
                    this.addLine(`else:`);
                    this.processNode(node.else);
                }
            }
            else {
                throw new Error("Unknown node");
            }
            this.indent--;
        }
        print(node) {
            this.processNode(node);
            return this.result;
        }
    }
    exports.TemplateAstPrinter = TemplateAstPrinter;
});
//# sourceMappingURL=TemplateAstPrinter.js.map