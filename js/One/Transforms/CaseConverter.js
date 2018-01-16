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
    class CaseConverter {
        static splitName(name, error) {
            let parts = [];
            let currPart = "";
            for (let c of name) {
                if (("A" <= c && c <= "Z") || c === "_") {
                    if (currPart !== "") {
                        parts.push(currPart);
                        currPart = "";
                    }
                    if (c !== "_")
                        currPart += c.toLowerCase();
                }
                else if ("a" <= c && c <= "z" || "0" <= c && c <= "9") {
                    currPart += c;
                }
                else {
                    error && error(`Invalid character ('${c}') in name: ${name}.`);
                }
            }
            if (currPart !== "")
                parts.push(currPart);
            let prefixLen = 0, postfixLen = 0;
            for (; prefixLen < name.length && name[prefixLen] === '_'; prefixLen++) { }
            for (; postfixLen < name.length && name[name.length - postfixLen - 1] === '_'; postfixLen++) { }
            if (prefixLen > 0)
                parts[0] = "_".repeat(prefixLen) + parts[0];
            if (postfixLen > 0)
                parts[parts.length - 1] = parts[parts.length - 1] + "_".repeat(postfixLen);
            return parts;
        }
        static convert(name, newCasing, error) {
            const parts = CaseConverter.splitName(name);
            if (newCasing === "camel")
                return parts[0] + parts.splice(1).map(x => x.ucFirst()).join("");
            else if (newCasing === "pascal")
                return parts.map(x => x.ucFirst()).join("");
            else if (newCasing === "upper")
                return parts.map(x => x.toUpperCase()).join("_");
            else if (newCasing === "snake")
                return parts.join("_");
            else
                error(`Unknown casing: ${newCasing}`);
        }
    }
    exports.CaseConverter = CaseConverter;
    class SchemaCaseConverter extends AstVisitor_1.AstVisitor {
        constructor(casing) {
            super();
            this.casing = casing;
        }
        getName(name, type) {
            // TODO: throw exception instead of using default snake_case?
            return CaseConverter.convert(name, this.casing[type] === LangFileSchema_1.LangFileSchema.Casing.PascalCase ? "pascal" :
                this.casing[type] === LangFileSchema_1.LangFileSchema.Casing.CamelCase ? "camel" :
                    this.casing[type] === LangFileSchema_1.LangFileSchema.Casing.UpperCase ? "upper" :
                        "snake", this.log);
        }
        visitMethod(method) {
            super.visitMethod(method, null);
            method.outName = this.getName(method.name, "method");
        }
        visitField(field) {
            super.visitField(field, null);
            field.outName = this.getName(field.name, "field");
        }
        visitProperty(prop) {
            super.visitProperty(prop, null);
            prop.outName = this.getName(prop.name, "property");
        }
        visitClass(cls) {
            super.visitClass(cls, null);
            cls.outName = this.getName(cls.name, "class");
        }
        visitInterface(intf) {
            super.visitInterface(intf, null);
            intf.outName = this.getName(intf.name, "class");
        }
        visitEnum(enum_) {
            super.visitEnum(enum_, null);
            enum_.outName = this.getName(enum_.name, "enum");
        }
        visitEnumMember(enumMember) {
            super.visitEnumMember(enumMember, null);
            enumMember.outName = this.getName(enumMember.name, "enumMember");
        }
        visitVariable(stmt) {
            super.visitVariable(stmt, null);
            stmt.outName = this.getName(stmt.name, "variable");
        }
        process(schema) {
            this.visitSchema(schema, null);
        }
    }
    exports.SchemaCaseConverter = SchemaCaseConverter;
});
//# sourceMappingURL=CaseConverter.js.map