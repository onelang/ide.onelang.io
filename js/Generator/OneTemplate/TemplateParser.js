(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./TemplateAst", "../ExprLang/ExprLangParser"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const TemplateAst_1 = require("./TemplateAst");
    const ExprLangParser_1 = require("../ExprLang/ExprLangParser");
    class TemplatePart {
        constructor(value, isText) {
            this.value = value;
            this.params = {};
            this.isWhitespace = false;
            let match;
            if (isText) {
                this.type = "text";
                this.textValue = value;
                this.isWhitespace = !!value.match(/^\s*$/);
            }
            else {
                const paramsOffs = value.lastIndexOf("|");
                const valueWoParams = paramsOffs === -1 || value[paramsOffs - 1] === "|" ? value : value.substr(0, paramsOffs).trim();
                this.params = paramsOffs === -1 ? {} : new ParamParser(value.substr(paramsOffs + 1).trim()).parse();
                if (match = /^for ([a-zA-Z]+) in (.*)/.exec(valueWoParams)) {
                    this.type = "for";
                    this.for = { itemName: match[1], array: ExprLangParser_1.ExprLangParser.parse(match[2]) };
                }
                else if (match = /^if (.*)/.exec(valueWoParams)) {
                    this.type = "if";
                    this.if = { condition: ExprLangParser_1.ExprLangParser.parse(match[1]) };
                }
                else if (match = /^elif (.*)/.exec(valueWoParams)) {
                    this.type = "elif";
                    this.elif = { condition: ExprLangParser_1.ExprLangParser.parse(match[1]) };
                }
                else if (match = /^\/(for|if)$/.exec(valueWoParams)) {
                    this.type = match[1] === "if" ? "endif" : "endfor";
                }
                else if (match = /^else$/.exec(valueWoParams)) {
                    this.type = "else";
                }
                else {
                    this.type = "template";
                    this.template = { expr: ExprLangParser_1.ExprLangParser.parse(valueWoParams) };
                }
            }
        }
        repr() {
            return `${this.type}: "${this.value.replace(/\n/g, "\\n")}"`;
        }
    }
    class ParamParser {
        constructor(str) {
            this.str = str;
            this.pos = 0;
            this.params = {};
        }
        readToken(...tokens) {
            for (const token of tokens)
                if (this.str.startsWith(token, this.pos)) {
                    this.pos += token.length;
                    return token;
                }
            return null;
        }
        readUntil(...tokens) {
            const startPos = this.pos;
            let token = null;
            for (; this.pos < this.str.length; this.pos++)
                if (token = this.readToken(...tokens))
                    break;
            const value = this.str.substring(startPos, this.pos - (token || "").length);
            return { value, token };
        }
        parse() {
            while (this.pos < this.str.length) {
                const key = this.readUntil("=", " ");
                if (key.token !== "=")
                    this.params[key.value] = true;
                else {
                    const quote = this.readToken("'", "\"");
                    const value = this.readUntil(quote || " ").value;
                    this.params[key.value] = value.replace(/\\n/g, "\n");
                }
            }
            return this.params;
        }
    }
    class LineInfo {
        constructor(line, lineIdx) {
            this.line = line;
            this.lineIdx = lineIdx;
            this.indentLen = 0;
            this.parts = this.line.split(/\{\{([^{}]*?)\}\}/).map((x, i) => new TemplatePart(x, i % 2 === 0))
                .filter(x => !(x.type === "text" && x.textValue.length === 0));
            const nonWs = this.parts.filter(x => !x.isWhitespace);
            this.controlPart = nonWs.length === 1 && (nonWs[0].type !== "text"
                && nonWs[0].type !== "template") ? nonWs[0] : null;
            for (const c of line)
                if (c === " ")
                    this.indentLen++;
                else
                    break;
        }
        match(...types) {
            return this.controlPart && types.includes(this.controlPart.type);
        }
        fail(msg) {
            throw new Error(`${msg} (lineIdx: ${this.lineIdx}, line: '${this.line}'`);
        }
        get inline() { return this.controlPart && !!this.controlPart.params["inline"]; }
        get sep() {
            return !this.controlPart ? null :
                "sep" in this.controlPart.params ? this.controlPart.params["sep"] :
                    (this.inline ? "" : "\n");
        }
    }
    class TemplateLineParser {
        constructor(line) {
            this.line = line;
            this.partIdx = -1;
            this.parts = line.parts;
            this.root = this.readBlock();
        }
        get currPart() { return this.parts[this.partIdx]; }
        readIf() {
            const ifNode = new TemplateAst_1.TemplateAst.IfNode();
            ifNode.inline = !!this.currPart.params["inline"];
            const ifItem = new TemplateAst_1.TemplateAst.IfItem(this.currPart.if.condition);
            ifItem.body = this.readBlock();
            ifNode.items.push(ifItem);
            while (true) {
                const currPart = this.currPart;
                if (currPart.type === "elif") {
                    const elifBlock = this.readBlock();
                    const newItem = new TemplateAst_1.TemplateAst.IfItem(currPart.elif.condition, elifBlock);
                    ifNode.items.push(newItem);
                }
                else if (currPart.type === "else") {
                    ifNode.else = this.readBlock();
                }
                else if (currPart.type === "endif") {
                    break;
                }
                else {
                    this.line.fail(`Expected 'elif', 'else' or 'endif', got '${currPart.type}'.`);
                }
            }
            return ifNode;
        }
        readBlock() {
            this.partIdx++;
            const line = new TemplateAst_1.TemplateAst.Line();
            for (; this.partIdx < this.parts.length; this.partIdx++) {
                let node;
                const part = this.currPart;
                if (part.type === "text") {
                    node = new TemplateAst_1.TemplateAst.TextNode(part.textValue);
                }
                else if (part.type === "template") {
                    node = new TemplateAst_1.TemplateAst.TemplateNode(part.template.expr);
                }
                else if (part.type === "if") {
                    node = this.readIf();
                }
                else {
                    break;
                }
                line.items.push(node);
            }
            return line;
        }
    }
    class TemplateParser {
        constructor(template) {
            this.template = template;
            this.levelIndent = 2;
            this.lineIdx = -1;
            this.indentLen = -this.levelIndent;
            this.lines = template.split("\n").map((line, lineIdx) => new LineInfo(line, lineIdx));
            this.root = this.readBlock(true);
        }
        get currLine() { return this.lines[this.lineIdx]; }
        match(...types) {
            const line = this.lines[this.lineIdx];
            return line.controlPart && types.includes(line.controlPart.type);
        }
        readIf() {
            const ifNode = new TemplateAst_1.TemplateAst.IfNode();
            ifNode.inline = this.currLine.inline;
            const ifItem = new TemplateAst_1.TemplateAst.IfItem(this.currLine.controlPart.if.condition, this.readBlock());
            ifNode.items.push(ifItem);
            while (true) {
                const currLine = this.currLine;
                if (currLine.match("elif")) {
                    const newItem = new TemplateAst_1.TemplateAst.IfItem(currLine.controlPart.elif.condition, this.readBlock());
                    ifNode.items.push(newItem);
                }
                else if (currLine.match("else")) {
                    ifNode.else = this.readBlock();
                }
                else if (currLine.match("endif")) {
                    break;
                }
                else {
                    currLine.fail("Expected 'elif', 'else' or 'endif'.");
                }
            }
            return ifNode;
        }
        readFor() {
            const part = this.currLine.controlPart;
            const forNode = new TemplateAst_1.TemplateAst.ForNode(part.for.itemName, part.for.array, this.currLine.inline, this.currLine.sep);
            forNode.body = this.readBlock();
            if (this.currLine.match("else")) {
                forNode.else = this.readBlock();
            }
            else if (!this.currLine.match("endfor")) {
                this.currLine.fail("Expected 'else' or 'endfor'.");
            }
            return forNode;
        }
        getIndentLen(str) {
            let len = 0;
            for (const c of str)
                if (c === " ")
                    len++;
                else
                    break;
            return len;
        }
        deindentLine() {
            if (this.currLine.parts.length === 0 || this.indentLen === 0)
                return;
            if (this.currLine.indentLen < this.indentLen)
                this.currLine.fail(`Expected at least ${this.indentLen} indentation`);
            const part0 = this.currLine.parts[0];
            part0.textValue = part0.textValue.substr(this.indentLen);
        }
        readBlock(rootBlock = false) {
            // whitespace DOES NOT matter before *inline* "if"s / "for"s
            // but whitespace DOES matter before non-inline "if"s / "for"s
            const prevIndent = this.indentLen;
            this.indentLen = (this.currLine && this.currLine.inline ? this.currLine.indentLen : this.indentLen) + this.levelIndent;
            const lineNodes = [];
            this.lineIdx++;
            for (; this.lineIdx < this.lines.length; this.lineIdx++) {
                let blockItem;
                const line = this.currLine;
                if (line.match("if")) {
                    blockItem = this.readIf();
                }
                else if (line.match("for")) {
                    blockItem = this.readFor();
                }
                else if (!line.controlPart) {
                    this.deindentLine();
                    const lineNode = new TemplateLineParser(this.currLine).root;
                    const part0 = lineNode.items[0];
                    lineNode.indentLen = part0 instanceof TemplateAst_1.TemplateAst.TextNode ? this.getIndentLen(part0.value) : 0;
                    // if the whole line is a standalone "inline if" (eg "{{if cond}}something{{/if}}"),
                    //   then it converts it to a "control if" (newline only added if generates code)
                    if (lineNode.items.length === 1 && lineNode.items[0] instanceof TemplateAst_1.TemplateAst.IfNode)
                        blockItem = lineNode.items[0];
                    else
                        blockItem = lineNode;
                }
                else {
                    break;
                }
                lineNodes.push(blockItem);
            }
            // concat lines together if one of them is an inline line
            const block = new TemplateAst_1.TemplateAst.Block();
            let prevLine = null;
            for (let i = 0; i < lineNodes.length; i++) {
                const lineNode = lineNodes[i];
                const canInline = prevLine !== null && (!(lineNode instanceof TemplateAst_1.TemplateAst.Line) || lineNode.indentLen >= prevLine.indentLen);
                if (canInline && (lineNode.inline || lineNodes[i - 1].inline)) {
                    if (lineNode instanceof TemplateAst_1.TemplateAst.Line) {
                        if (prevLine.indentLen > 0) {
                            const firstItem = lineNode.items[0];
                            firstItem.value = firstItem.value.substr(prevLine.indentLen);
                        }
                        prevLine.items.push(...lineNode.items);
                    }
                    else
                        prevLine.items.push(lineNode);
                }
                else {
                    block.lines.push(lineNode);
                    if (lineNode instanceof TemplateAst_1.TemplateAst.Line) {
                        prevLine = lineNode;
                        const firstItem = prevLine.items[0];
                        if (firstItem instanceof TemplateAst_1.TemplateAst.TextNode)
                            prevLine.indentLen = this.getIndentLen(firstItem.value);
                    }
                }
            }
            for (const line of block.lines)
                delete line.inline;
            for (const line of block.lines) {
                if (line instanceof TemplateAst_1.TemplateAst.Line) {
                    const firstItem = line.items[0];
                    if (firstItem instanceof TemplateAst_1.TemplateAst.TextNode) {
                        line.indentLen = this.getIndentLen(firstItem.value);
                        firstItem.value = firstItem.value.substr(line.indentLen);
                        if (firstItem.value === "")
                            line.items.shift();
                    }
                }
            }
            this.indentLen = prevIndent;
            return block;
        }
        static parse(template) {
            return new TemplateParser(template).root;
        }
    }
    exports.TemplateParser = TemplateParser;
});
//# sourceMappingURL=TemplateParser.js.map