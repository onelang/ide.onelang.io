(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../AstVisitor", "../../Generator/LangFileSchema"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const AstVisitor_1 = require("../AstVisitor");
    const LangFileSchema_1 = require("../../Generator/LangFileSchema");
    class CaseConverter extends AstVisitor_1.AstVisitor {
        constructor(casing) {
            super();
            this.casing = casing;
        }
        toSnakeCase(name) {
            let result = "";
            for (let c of name) {
                if ("A" <= c && c <= "Z")
                    result += (result === "" ? "" : "_") + c.toLowerCase();
                else if ("a" <= c && c <= "z" || c === "_" || "0" <= c && c <= "9")
                    result += c;
                else
                    this.log(`Invalid character ('${c}') in name: ${name}.`);
            }
            return result;
        }
        getName(name, type) {
            const snakeCase = this.toSnakeCase(name);
            const casing = this.casing[type];
            if (!casing)
                return snakeCase; // TODO
            const parts = snakeCase.split("_").map(x => x.toLowerCase());
            if (casing === LangFileSchema_1.LangFileSchema.Casing.CamelCase)
                return parts[0] + parts.splice(1).map(x => x.ucFirst()).join("");
            else if (casing === LangFileSchema_1.LangFileSchema.Casing.PascalCase)
                return parts.map(x => x.ucFirst()).join("");
            else if (casing === LangFileSchema_1.LangFileSchema.Casing.SnakeCase)
                return parts.join("_");
            else
                this.log(`Unknown casing: ${casing}`);
        }
        visitMethod(method) {
            method.name = this.getName(method.name, "method");
            super.visitMethod(method, null);
        }
        visitField(field) {
            field.name = this.getName(field.name, "field");
            super.visitField(field, null);
        }
        visitProperty(prop) {
            prop.name = this.getName(prop.name, "property");
            super.visitProperty(prop, null);
        }
        visitClass(cls) {
            cls.name = this.getName(cls.name, "class");
            super.visitClass(cls, null);
        }
        visitVariableDeclaration(stmt) {
            stmt.name = this.getName(stmt.name, "variable");
            super.visitVariableDeclaration(stmt, null);
        }
        process(schema) {
            this.visitSchema(schema, null);
        }
    }
    exports.CaseConverter = CaseConverter;
});
//# sourceMappingURL=CaseConverter.js.map