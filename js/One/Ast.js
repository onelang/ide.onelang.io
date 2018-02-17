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
    var OneAst;
    (function (OneAst) {
        let Visibility;
        (function (Visibility) {
            Visibility["Public"] = "public";
            Visibility["Protected"] = "protected";
            Visibility["Private"] = "private";
        })(Visibility = OneAst.Visibility || (OneAst.Visibility = {}));
        let TypeKind;
        (function (TypeKind) {
            TypeKind["Void"] = "void";
            TypeKind["Any"] = "any";
            TypeKind["Null"] = "null";
            TypeKind["Class"] = "class";
            TypeKind["Interface"] = "interface";
            TypeKind["Enum"] = "enum";
            TypeKind["Method"] = "method";
            TypeKind["Generics"] = "generics";
        })(TypeKind = OneAst.TypeKind || (OneAst.TypeKind = {}));
        class Type {
            constructor(typeKind = null) {
                this.typeKind = typeKind;
                this.$objType = "Type";
            }
            get isPrimitiveType() { return Type.PrimitiveTypeKinds.includes(this.typeKind); }
            get isClass() { return this.typeKind === TypeKind.Class; }
            get isInterface() { return this.typeKind === TypeKind.Interface; }
            get isClassOrInterface() { return this.isClass || this.isInterface; }
            get isComplexClass() { return this.canBeNull && !this.isAny; } // TODO: hack for C++ (any) & Go (interface{})
            get isEnum() { return this.typeKind === TypeKind.Enum; }
            get isMethod() { return this.typeKind === TypeKind.Method; }
            get isGenerics() { return this.typeKind === TypeKind.Generics; }
            get isAny() { return this.typeKind === TypeKind.Any; }
            get isNull() { return this.typeKind === TypeKind.Null; }
            get isVoid() { return this.typeKind === TypeKind.Void; }
            get isNumber() { return this.className === "OneNumber"; }
            get isString() { return this.className === "OneString"; }
            get isCharacter() { return this.className === "OneCharacter"; }
            get isBoolean() { return this.className === "OneBoolean"; }
            get isOneArray() { return this.className === "OneArray"; }
            get isOneMap() { return this.className === "OneMap"; }
            get canBeNull() { return (this.isClassOrInterface && !this.isNumber && !this.isCharacter && !this.isString && !this.isBoolean) || this.isAny; }
            equals(other) {
                if (this.typeKind !== other.typeKind)
                    return false;
                if (this.isPrimitiveType)
                    return true;
                const typeArgsMatch = this.typeArguments.length === other.typeArguments.length
                    && this.typeArguments.every((thisArg, i) => thisArg.equals(other.typeArguments[i]));
                if (this.typeKind === TypeKind.Class)
                    return this.className === other.className && typeArgsMatch;
                else
                    throw new Error(`Type.equals: Unknown typeKind: ${this.typeKind}`);
            }
            repr() {
                if (this.isPrimitiveType) {
                    return this.typeKind.toString();
                }
                else if (this.isClassOrInterface) {
                    return (this.isInterface ? "(I)" : "") + this.className +
                        (this.typeArguments.length === 0 ? "" : `<${this.typeArguments.map(x => x.repr()).join(", ")}>`);
                }
                else if (this.isMethod) {
                    return `${this.classType.repr()}::${this.methodName}`;
                }
                else if (this.isGenerics) {
                    return this.genericsName;
                }
                else if (this.isEnum) {
                    return `${this.enumName} (enum)`;
                }
                else {
                    return "?";
                }
            }
            get oneName() {
                if (this.isPrimitiveType) {
                    return this.typeKind.toString();
                }
                else if (this.isNumber) {
                    return "number";
                }
                else if (this.isString) {
                    return "string";
                }
                else if (this.isBoolean) {
                    return "bool";
                }
                else if (this.isCharacter) {
                    return "char";
                }
                else if (this.isClassOrInterface) {
                    return this.className + (this.typeArguments.length === 0 ? "" : `<${this.typeArguments.map(x => x.repr()).join(", ")}>`);
                }
                else if (this.isGenerics) {
                    return this.genericsName;
                }
                else if (this.isEnum) {
                    return `${this.enumName}`;
                }
                else {
                    return "?";
                }
            }
            // TODO / note: new instance is required because of NodeData... maybe rethink this approach?
            static get Void() { return new Type(TypeKind.Void); }
            static get Any() { return new Type(TypeKind.Any); }
            static get Null() { return new Type(TypeKind.Null); }
            static Class(className, generics = []) {
                if (!className)
                    throw new Error("expected className in Type.Class");
                const result = new Type(TypeKind.Class);
                result.className = className;
                result.typeArguments = generics;
                return result;
            }
            static Interface(className, generics = []) {
                if (!className)
                    throw new Error("expected className in Type.Interface");
                const result = new Type(TypeKind.Interface);
                result.className = className;
                result.typeArguments = generics;
                return result;
            }
            static Enum(enumName) {
                const result = new Type(TypeKind.Enum);
                result.enumName = enumName;
                return result;
            }
            static Method(classType, methodName) {
                const result = new Type(TypeKind.Method);
                if (!classType)
                    throw new Error(`Missing classType for method: ${methodName}`);
                result.classType = classType;
                result.methodName = methodName;
                return result;
            }
            static Generics(genericsName) {
                const result = new Type(TypeKind.Generics);
                result.genericsName = genericsName;
                return result;
            }
            static Load(source) {
                if (!source || source.$objType !== "Type")
                    throw new Error("Invalid source to load Type from!");
                return Object.assign(new Type(), source);
            }
        }
        Type.PrimitiveTypeKinds = [TypeKind.Void, TypeKind.Any, TypeKind.Null];
        OneAst.Type = Type;
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
            ExpressionKind["TemplateString"] = "TemplateString";
            ExpressionKind["Parenthesized"] = "Parenthesized";
            ExpressionKind["Unary"] = "Unary";
            ExpressionKind["Cast"] = "Cast";
            ExpressionKind["ArrayLiteral"] = "ArrayLiteral";
            ExpressionKind["MapLiteral"] = "MapLiteral";
            ExpressionKind["VariableReference"] = "VariableReference";
            ExpressionKind["MethodReference"] = "MethodReference";
            ExpressionKind["ThisReference"] = "ThisReference";
            ExpressionKind["ClassReference"] = "ClassReference";
            ExpressionKind["EnumReference"] = "EnumReference";
            ExpressionKind["EnumMemberReference"] = "EnumMemberReference";
        })(ExpressionKind = OneAst.ExpressionKind || (OneAst.ExpressionKind = {}));
        class Reference {
        }
        OneAst.Reference = Reference;
        let VariableRefType;
        (function (VariableRefType) {
            VariableRefType["StaticField"] = "StaticField";
            VariableRefType["InstanceField"] = "InstanceField";
            VariableRefType["MethodArgument"] = "MethodArgument";
            VariableRefType["LocalVar"] = "LocalVar";
        })(VariableRefType = OneAst.VariableRefType || (OneAst.VariableRefType = {}));
        class VariableRef extends Reference {
            constructor(varType, varRef, thisExpr) {
                super();
                this.varType = varType;
                this.varRef = varRef;
                this.thisExpr = thisExpr;
                this.$objType = "VariableRef";
                this.exprKind = ExpressionKind.VariableReference;
            }
            static InstanceField(thisExpr, varRef) {
                return new VariableRef(VariableRefType.InstanceField, varRef, thisExpr);
            }
            static StaticField(thisExpr, varRef) {
                return new VariableRef(VariableRefType.StaticField, varRef, thisExpr);
            }
            static MethodVariable(varRef) {
                return new VariableRef(VariableRefType.LocalVar, varRef);
            }
            static MethodArgument(varRef) {
                return new VariableRef(VariableRefType.MethodArgument, varRef);
            }
            static Load(source) {
                return Object.assign(new VariableRef(null, null), source);
            }
        }
        OneAst.VariableRef = VariableRef;
        class MethodReference extends Reference {
            constructor(methodRef, thisExpr) {
                super();
                this.methodRef = methodRef;
                this.thisExpr = thisExpr;
                this.exprKind = ExpressionKind.MethodReference;
            }
        }
        OneAst.MethodReference = MethodReference;
        class ClassReference extends Reference {
            constructor(classRef) {
                super();
                this.classRef = classRef;
                this.exprKind = ExpressionKind.ClassReference;
            }
        }
        OneAst.ClassReference = ClassReference;
        class EnumReference extends Reference {
            constructor(enumRef) {
                super();
                this.enumRef = enumRef;
                this.exprKind = ExpressionKind.EnumReference;
            }
        }
        OneAst.EnumReference = EnumReference;
        class EnumMemberReference extends Reference {
            constructor(enumMemberRef, enumRef) {
                super();
                this.enumMemberRef = enumMemberRef;
                this.enumRef = enumRef;
                this.exprKind = ExpressionKind.EnumMemberReference;
            }
        }
        OneAst.EnumMemberReference = EnumMemberReference;
        class ThisReference extends Reference {
            constructor() {
                super(...arguments);
                this.exprKind = ExpressionKind.ThisReference;
            }
        }
        OneAst.ThisReference = ThisReference;
        // ======================= STATEMENTS ======================
        let StatementType;
        (function (StatementType) {
            StatementType["If"] = "If";
            StatementType["Return"] = "Return";
            StatementType["ExpressionStatement"] = "ExpressionStatement";
            StatementType["VariableDeclaration"] = "VariableDeclaration";
            StatementType["While"] = "While";
            StatementType["Throw"] = "Throw";
            StatementType["Foreach"] = "Foreach";
            StatementType["For"] = "For";
            StatementType["Break"] = "Break";
            StatementType["Unset"] = "Unset";
        })(StatementType = OneAst.StatementType || (OneAst.StatementType = {}));
    })(OneAst = exports.OneAst || (exports.OneAst = {}));
});
//# sourceMappingURL=Ast.js.map