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
    var KSLangSchema;
    (function (KSLangSchema) {
        let Visibility;
        (function (Visibility) {
            Visibility["Public"] = "public";
            Visibility["Protected"] = "protected";
            Visibility["Private"] = "private";
        })(Visibility = KSLangSchema.Visibility || (KSLangSchema.Visibility = {}));
        let TypeKind;
        (function (TypeKind) {
            TypeKind["Void"] = "void";
            TypeKind["Boolean"] = "boolean";
            TypeKind["String"] = "string";
            TypeKind["Number"] = "number";
            TypeKind["Null"] = "null";
            TypeKind["Any"] = "any";
            TypeKind["Array"] = "array";
            TypeKind["Class"] = "class";
        })(TypeKind = KSLangSchema.TypeKind || (KSLangSchema.TypeKind = {}));
        class Type {
            constructor(typeKind = null, className = null, typeArguments = null) {
                this.typeKind = typeKind;
                this.className = className;
                this.typeArguments = typeArguments;
            }
            static Array(itemType) { return new Type(TypeKind.Array, null, [itemType]); }
            static Class(className, generics) { return new Type(TypeKind.Array, className, generics); }
            get isPrimitiveType() { return Type.PrimitiveTypeKinds.includes(this.typeKind); }
            get isArray() { return this.typeKind === TypeKind.Array; }
            get isClass() { return this.typeKind === TypeKind.Class; }
            equals(other) {
                if (this.typeKind !== other.typeKind)
                    return false;
                if (this.isPrimitiveType)
                    return true;
                const typeArgsMatch = this.typeArguments.length === other.typeArguments.length
                    && this.typeArguments.every((thisArg, i) => thisArg.equals(other.typeArguments[i]));
                if (this.typeKind === TypeKind.Array)
                    return typeArgsMatch;
                else if (this.typeKind === TypeKind.Class)
                    return this.className === other.className && typeArgsMatch;
                else
                    throw new Error(`Type.equals: Unknown typeKind: ${this.typeKind}`);
            }
            repr() {
                const argsRepr = () => this.typeArguments.map(x => x.repr()).join(", ");
                if (this.isPrimitiveType)
                    return this.typeKind.toString();
                else if (this.isArray)
                    return `array<${argsRepr()}>`;
                else if (this.isClass)
                    return `${this.className}<${argsRepr()}>`;
                else
                    return "?";
            }
        }
        Type.PrimitiveTypeKinds = [TypeKind.Void, TypeKind.Boolean, TypeKind.String, TypeKind.Number, TypeKind.Null, TypeKind.Any];
        Type.Void = new Type(TypeKind.Void);
        Type.Boolean = new Type(TypeKind.Boolean);
        Type.String = new Type(TypeKind.String);
        Type.Number = new Type(TypeKind.Number);
        Type.Null = new Type(TypeKind.Null);
        Type.Any = new Type(TypeKind.Any);
        KSLangSchema.Type = Type;
        // ======================= EXPRESSIONS ======================
        let ExpressionKind;
        (function (ExpressionKind) {
            ExpressionKind["Call"] = "Call";
            ExpressionKind["Binary"] = "Binary";
            ExpressionKind["PropertyAccess"] = "PropertyAccess";
            ExpressionKind["ElementAccess"] = "ElementAccess";
            ExpressionKind["Identifier"] = "Identifier";
            ExpressionKind["New"] = "New";
            ExpressionKind["Conditional"] = "Conditional";
            ExpressionKind["Literal"] = "Literal";
            ExpressionKind["Parenthesized"] = "Parenthesized";
            ExpressionKind["Unary"] = "Unary";
            ExpressionKind["ArrayLiteral"] = "ArrayLiteral";
        })(ExpressionKind = KSLangSchema.ExpressionKind || (KSLangSchema.ExpressionKind = {}));
        // ======================= STATEMENTS ======================
        let StatementType;
        (function (StatementType) {
            StatementType["If"] = "If";
            StatementType["Return"] = "Return";
            StatementType["Expression"] = "Expression";
            StatementType["Variable"] = "Variable";
            StatementType["While"] = "While";
            StatementType["Throw"] = "Throw";
            StatementType["Foreach"] = "Foreach";
            StatementType["For"] = "For";
        })(StatementType = KSLangSchema.StatementType || (KSLangSchema.StatementType = {}));
    })(KSLangSchema = exports.KSLangSchema || (exports.KSLangSchema = {}));
});
//# sourceMappingURL=KSLangSchema.js.map