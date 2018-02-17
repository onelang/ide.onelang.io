(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./../Ast", "../AstVisitor", "../../Parsers/Common/Reader"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Ast_1 = require("./../Ast");
    const AstVisitor_1 = require("../AstVisitor");
    const Reader_1 = require("../../Parsers/Common/Reader");
    class ProcessTypeHints extends AstVisitor_1.AstVisitor {
        parseType(reader) {
            const typeName = reader.expectIdentifier();
            let type;
            if (typeName === "string") {
                type = Ast_1.OneAst.Type.Class("OneString");
            }
            else if (typeName === "bool") {
                type = Ast_1.OneAst.Type.Class("OneBoolean");
            }
            else if (typeName === "number") {
                type = Ast_1.OneAst.Type.Class("OneNumber");
            }
            else if (typeName === "char") {
                type = Ast_1.OneAst.Type.Class("OneCharacter");
            }
            else if (typeName === "any") {
                type = Ast_1.OneAst.Type.Any;
            }
            else if (typeName === "void") {
                type = Ast_1.OneAst.Type.Void;
            }
            else {
                type = Ast_1.OneAst.Type.Class(typeName);
                if (reader.readToken("<")) {
                    do {
                        const generics = this.parseType(reader);
                        type.typeArguments.push(generics);
                    } while (reader.readToken(","));
                    reader.expectToken(">");
                }
            }
            while (reader.readToken("[]"))
                type = Ast_1.OneAst.Type.Class("OneArray", [type]);
            return type;
        }
        visitMethodLike(method) {
            super.visitMethodLike(method, null);
            if (method.attributes["signature"]) {
                try {
                    const reader = new Reader_1.Reader(method.attributes["signature"]);
                    const origMethodName = reader.expectIdentifier();
                    reader.expectToken("(");
                    for (let i = 0; i < method.parameters.length; i++) {
                        const param = method.parameters[i];
                        const origParamName = reader.expectIdentifier();
                        reader.expectToken(":");
                        param.type = this.parseType(reader);
                        if (i != method.parameters.length - 1)
                            reader.expectToken(",");
                    }
                    reader.expectToken(")");
                    if (reader.readToken(":")) {
                        method.returns = this.parseType(reader);
                    }
                }
                catch (e) {
                    console.error(`Failed to read method signature: ${method.attributes["signature"]}`);
                    // TODO: report parsing error or something...
                }
            }
        }
        transform(schemaCtx) {
            this.visitSchema(schemaCtx.schema, null);
        }
    }
    exports.ProcessTypeHints = ProcessTypeHints;
});
//# sourceMappingURL=ProcessTypeHints.js.map