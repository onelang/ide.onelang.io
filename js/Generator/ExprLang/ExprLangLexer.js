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
    class Token {
        constructor(kind, value) {
            this.kind = kind;
            this.value = value;
        }
    }
    exports.Token = Token;
    class ExprLangLexerException {
        constructor(tokenizer, message) {
            this.tokenizer = tokenizer;
            this.message = message;
            this.errorOffset = tokenizer.offset;
        }
        get context() { return this.tokenizer.expression.substr(this.errorOffset, 30) + "..."; }
        toString() { return `TokenizerException: ${this.message} at '${this.context}' (offset: ${this.errorOffset})`; }
    }
    exports.ExprLangLexerException = ExprLangLexerException;
    class ExprLangLexer {
        constructor(expression, operators) {
            this.expression = expression;
            this.operators = operators;
            this.offset = 0;
            this.tokens = [];
            if (!this.tryToReadNumber()) {
                this.tryToReadOperator();
                this.tryToReadLiteral();
            }
            while (this.hasMoreToken()) {
                if (!this.tryToReadOperator())
                    this.fail("expected operator here");
                this.tryToReadLiteral();
            }
        }
        hasMoreToken() {
            this.skipWhitespace();
            return !this.eof;
        }
        addIf(kind, value) {
            if (value) {
                this.tokens.push(new Token(kind, value));
                this.offset += value.length;
                return true;
            }
            else {
                return false;
            }
        }
        tryToMatch(pattern) {
            const regex = new RegExp(pattern, "gy");
            regex.lastIndex = this.offset;
            const matches = regex.exec(this.expression);
            return matches && matches[0];
        }
        tryToReadOperator() {
            this.skipWhitespace();
            const op = this.operators.find(op => this.expression.startsWith(op, this.offset));
            return this.addIf("operator", op);
        }
        tryToReadNumber() {
            this.skipWhitespace();
            const number = this.tryToMatch("[+-]?(\\d*\\.\\d+|\\d+\\.\\d+|0x[0-9a-fA-F_]+|0b[01_]+|[0-9_]+)");
            const success = this.addIf("number", number);
            if (success && this.tryToMatch("[0-9a-zA-Z]"))
                this.fail("invalid character in number");
            return success;
        }
        tryToReadIdentifier() {
            this.skipWhitespace();
            const identifier = this.tryToMatch("[a-zA-Z_][a-zA-Z0-9_]*");
            return this.addIf("identifier", identifier);
        }
        tryToReadString() {
            this.skipWhitespace();
            const match = this.tryToMatch("'(\\\\'|[^'])*'") || this.tryToMatch('"(\\\\"|[^"])*"');
            if (!match)
                return false;
            let str = match.substr(1, match.length - 2);
            str = match[0] === "'" ? str.replace("\\'", "'") : str.replace('\\"', '"');
            this.tokens.push(new Token("string", str));
            this.offset += match.length;
            return true;
        }
        get eof() { return this.offset >= this.expression.length; }
        skipWhitespace() {
            while (!this.eof) {
                const c = this.expression[this.offset];
                if (c == ' ' || c == '\n' || c == '\t' || c == '\r')
                    this.offset++;
                else
                    break;
            }
        }
        tryToReadLiteral() {
            const success = this.tryToReadIdentifier() || this.tryToReadNumber() || this.tryToReadString();
            return success;
        }
        fail(message) {
            throw new ExprLangLexerException(this, message);
        }
    }
    exports.ExprLangLexer = ExprLangLexer;
});
//# sourceMappingURL=ExprLangLexer.js.map