(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../StdLib/one", "../../Generator/Utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const one = require("../../StdLib/one");
    const Utils_1 = require("../../Generator/Utils");
    class Cursor {
        constructor(offset, line, column, lineStart, lineEnd) {
            this.offset = offset;
            this.line = line;
            this.column = column;
            this.lineStart = lineStart;
            this.lineEnd = lineEnd;
        }
    }
    exports.Cursor = Cursor;
    class ParseError {
        constructor(message, cursor = null, reader = null) {
            this.message = message;
            this.cursor = cursor;
            this.reader = reader;
        }
    }
    exports.ParseError = ParseError;
    class Reader {
        constructor(input) {
            this.input = input;
            this.wsOffset = 0;
            this.offset = 0;
            this.lineComment = "//";
            this.supportsBlockComment = true;
            this.blockCommentStart = "/*";
            this.blockCommentEnd = "*/";
            this.commentDisabled = false;
            this.identifierRegex = "[A-Za-z_][A-Za-z0-9_]*";
            this.numberRegex = "[+-]?(\\d*\\.\\d+|\\d+\\.\\d+|0x[0-9a-fA-F_]+|0b[01_]+|[0-9_]+)";
            this.errors = [];
            this.errorCallback = null;
            this.wsLineCounter = 0;
            this.moveWsOffset = true;
            this.prevTokenOffset = -1;
            this.cursorSearch = new CursorPositionSearch(input);
        }
        get eof() { return this.offset >= this.input.length; }
        get cursor() { return this.cursorSearch.getCursorForOffset(this.offset); }
        get linePreview() {
            const cursor = this.cursor;
            const line = this.input.substring(cursor.lineStart, cursor.lineEnd);
            return line + " ".repeat(cursor.column - 1) + "^^^";
        }
        get preview() {
            let preview = this.input.substr(this.offset, 20).replace(/\n/g, "\\n");
            if (preview.length === 20)
                preview += "...";
            return preview;
        }
        fail(message) {
            const error = new ParseError(message, this.cursor, this);
            this.errors.push(error);
            if (this.errorCallback)
                this.errorCallback(error);
            else
                throw new Error(`${message} at ${error.cursor.line}:${error.cursor.column}\n${this.linePreview}`);
        }
        skipWhitespace() {
            for (; this.offset < this.input.length; this.offset++) {
                const c = this.input[this.offset];
                if (c === '\n')
                    this.wsLineCounter++;
                if (!(c === '\n' || c === '\r' || c === '\t' || c === ' '))
                    break;
            }
        }
        skipUntil(token) {
            const index = this.input.indexOf(token, this.offset);
            if (index === -1)
                return false;
            this.offset = index + token.length;
            if (this.moveWsOffset)
                this.wsOffset = this.offset;
            return true;
        }
        skipLine() {
            if (!this.skipUntil("\n"))
                this.offset = this.input.length;
        }
        isAlphaNum(c) {
            return ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || ('0' <= c && c <= '9') || c === '_';
        }
        peekToken(token) {
            this.skipWhitespaceAndComment();
            if (this.input.startsWith(token, this.offset)) {
                // TODO: hackish way to make sure space comes after word tokens
                if (this.isAlphaNum(token[token.length - 1]) && this.isAlphaNum(this.input[this.offset + token.length]))
                    return false;
                return true;
            }
            else {
                return false;
            }
        }
        readToken(token) {
            if (this.peekToken(token)) {
                this.prevTokenOffset = this.offset;
                this.wsOffset = this.offset = this.offset + token.length;
                return true;
            }
            return false;
        }
        readAnyOf(tokens) {
            for (const token of tokens)
                if (this.readToken(token))
                    return token;
            return null;
        }
        expectToken(token, errorMsg = null) {
            if (!this.readToken(token))
                this.fail(errorMsg || `expected token '${token}'`);
        }
        expectOneOf(tokens) {
            const result = this.readAnyOf(tokens);
            if (result === null)
                this.fail(`expected one of ${tokens.map(x => `'${x}'`).join(", ")}`);
            return result;
        }
        readRegex(pattern) {
            const matches = one.Regex.matchFromIndex(pattern, this.input, this.offset);
            if (matches !== null) {
                this.prevTokenOffset = this.offset;
                this.wsOffset = this.offset = this.offset + matches[0].length;
            }
            return matches;
        }
        skipWhitespaceAndComment() {
            if (this.commentDisabled)
                return;
            this.moveWsOffset = false;
            while (true) {
                this.skipWhitespace();
                if (this.input.startsWith(this.lineComment, this.offset)) {
                    this.skipLine();
                }
                else if (this.supportsBlockComment && this.input.startsWith(this.blockCommentStart, this.offset)) {
                    if (!this.skipUntil(this.blockCommentEnd))
                        this.fail(`block comment end ("${this.blockCommentEnd}") was not found`);
                }
                else {
                    break;
                }
            }
            this.moveWsOffset = true;
        }
        readLeadingTrivia() {
            this.skipWhitespaceAndComment();
            const thisLineStart = this.input.lastIndexOf("\n", this.offset);
            if (thisLineStart <= this.wsOffset)
                return "";
            let result = this.input.substring(this.wsOffset, thisLineStart + 1);
            result = Utils_1.deindent(result);
            this.wsOffset = thisLineStart;
            return result;
        }
        readIdentifier() {
            this.skipWhitespace();
            const idMatch = this.readRegex(this.identifierRegex);
            if (idMatch === null)
                return null;
            return idMatch[0];
        }
        readNumber() {
            this.skipWhitespace();
            const numMatch = this.readRegex(this.numberRegex);
            if (numMatch === null)
                return null;
            if (this.readRegex("[0-9a-zA-Z]") !== null)
                this.fail("invalid character in number");
            return numMatch[0];
        }
        readString() {
            this.skipWhitespace();
            const strMatch = this.readRegex("'(\\\\'|[^'])*'") || this.readRegex('"(\\\\"|[^"])*"');
            if (!strMatch)
                return null;
            let str = strMatch[0].substr(1, strMatch[0].length - 2);
            str = strMatch[0] === "'" ? str.replace("\\'", "'") : str.replace('\\"', '"');
            // TODO: hack: this logic is langauge-dependent
            str = str.replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\r/g, "\r").replace(/\\\\/g, "\\");
            return str;
        }
        expectIdentifier(errorMsg = null) {
            const id = this.readIdentifier();
            if (id === null)
                this.fail(errorMsg || "expected identifier");
            return id;
        }
        readModifiers(modifiers) {
            const result = [];
            while (true) {
                let success = false;
                for (const modifier of modifiers) {
                    if (this.readToken(modifier)) {
                        result.push(modifier);
                        success = true;
                    }
                }
                if (!success)
                    break;
            }
            return result;
        }
    }
    exports.Reader = Reader;
    class CursorPositionSearch {
        constructor(input) {
            this.input = input;
            this.lineOffsets = [0];
            for (let i = 0; i < input.length; i++)
                if (input[i] === '\n')
                    this.lineOffsets.push(i + 1);
            this.lineOffsets.push(input.length);
        }
        getLineIdxForOffset(offset) {
            let low = 0, high = this.lineOffsets.length - 1;
            while (low <= high) {
                const middle = Math.floor((low + high) / 2);
                const middleOffset = this.lineOffsets[middle];
                if (offset == middleOffset)
                    return middle;
                else if (offset <= middleOffset)
                    high = middle - 1;
                else
                    low = middle + 1;
            }
            return low - 1;
        }
        getCursorForOffset(offset) {
            const lineIdx = this.getLineIdxForOffset(offset);
            const lineStart = this.lineOffsets[lineIdx];
            const lineEnd = this.lineOffsets[lineIdx + 1];
            const column = offset - lineStart + 1;
            if (column < 1)
                debugger;
            return new Cursor(offset, lineIdx + 1, offset - lineStart + 1, lineStart, lineEnd);
        }
    }
});
//# sourceMappingURL=Reader.js.map