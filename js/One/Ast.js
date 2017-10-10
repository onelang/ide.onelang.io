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
            TypeKind["Boolean"] = "boolean";
            TypeKind["String"] = "string";
            TypeKind["Number"] = "number";
            TypeKind["Null"] = "null";
            TypeKind["Any"] = "any";
            TypeKind["Class"] = "class";
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
            get isMethod() { return this.typeKind === TypeKind.Method; }
            get isGenerics() { return this.typeKind === TypeKind.Generics; }
            get isNumber() { return this.typeKind === TypeKind.Number; }
            get isOneArray() { return this.className === "OneArray"; }
            get isOneMap() { return this.className === "OneMap"; }
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
                else if (this.isClass) {
                    return this.className + (this.typeArguments.length === 0 ? "" :
                        `<${this.typeArguments.map(x => x.repr()).join(", ")}>`);
                }
                else if (this.isMethod) {
                    return `${this.classType.repr()}::${this.methodName}`;
                }
                else if (this.isGenerics) {
                    return this.genericsName;
                }
                else {
                    return "?";
                }
            }
            static Class(className, generics = []) {
                const result = new Type(TypeKind.Class);
                result.className = className;
                result.typeArguments = generics;
                return result;
            }
            static Method(classType, methodName) {
                const result = new Type(TypeKind.Method);
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
                return Object.assign(new Type(), source);
            }
        }
        Type.PrimitiveTypeKinds = [TypeKind.Void, TypeKind.Boolean, TypeKind.String, TypeKind.Number, TypeKind.Null, TypeKind.Any];
        Type.Void = new Type(TypeKind.Void);
        Type.Boolean = new Type(TypeKind.Boolean);
        Type.String = new Type(TypeKind.String);
        Type.Number = new Type(TypeKind.Number);
        Type.Null = new Type(TypeKind.Null);
        Type.Any = new Type(TypeKind.Any);
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
            ExpressionKind["Parenthesized"] = "Parenthesized";
            ExpressionKind["Unary"] = "Unary";
            ExpressionKind["ArrayLiteral"] = "ArrayLiteral";
            ExpressionKind["MapLiteral"] = "MapLiteral";
            ExpressionKind["VariableReference"] = "VariableReference";
            ExpressionKind["MethodReference"] = "MethodReference";
            ExpressionKind["ThisReference"] = "ThisReference";
            ExpressionKind["ClassReference"] = "ClassReference";
        })(ExpressionKind = OneAst.ExpressionKind || (OneAst.ExpressionKind = {}));
        class Reference {
        }
        OneAst.Reference = Reference;
        let VariableRefType;
        (function (VariableRefType) {
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
        })(StatementType = OneAst.StatementType || (OneAst.StatementType = {}));
    })(OneAst = exports.OneAst || (exports.OneAst = {}));
});
//# sourceMappingURL=Ast.js.map