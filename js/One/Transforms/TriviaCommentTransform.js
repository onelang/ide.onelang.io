(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../AstVisitor"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const AstVisitor_1 = require("../AstVisitor");
    class TriviaCommentTransform extends AstVisitor_1.AstVisitor {
        constructor() {
            super(...arguments);
            this.name = "triviaComment";
        }
        visitStatement(stmt) {
            const lines = (stmt.leadingTrivia || "").split("\n");
            let newLines = [];
            let inComment = false;
            for (let line of lines) {
                const test = (r) => {
                    const match = r.test(line);
                    if (match)
                        line = line.replace(r, "");
                    return match;
                };
                if (test(/^\s*\/\//)) {
                    newLines.push(`#${line}`);
                }
                else {
                    inComment = inComment || test(/^\s*\/\*/);
                    if (inComment) {
                        const closesComment = test(/\*\/\s*$/);
                        // do not convert "*/" to "#" (skip line)
                        if (!(closesComment && line === ""))
                            newLines.push("#" + line.replace(/^  /, ""));
                        if (closesComment)
                            inComment = false;
                    }
                    else {
                        newLines.push(line);
                    }
                }
            }
            stmt.leadingTrivia2 = newLines.join("\n");
        }
        transform(schemaCtx) {
            this.visitSchema(schemaCtx.schema, null);
        }
    }
    exports.TriviaCommentTransform = TriviaCommentTransform;
});
//# sourceMappingURL=TriviaCommentTransform.js.map