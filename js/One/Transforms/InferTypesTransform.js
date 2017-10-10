(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../Ast", "../AstVisitor", "../AstHelper"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Ast_1 = require("../Ast");
    const AstVisitor_1 = require("../AstVisitor");
    const AstHelper_1 = require("../AstHelper");
    var ReferenceType;
    (function (ReferenceType) {
        ReferenceType[ReferenceType["Class"] = 0] = "Class";
        ReferenceType[ReferenceType["Method"] = 1] = "Method";
        ReferenceType[ReferenceType["MethodVariable"] = 2] = "MethodVariable";
        ReferenceType[ReferenceType["ClassVariable"] = 3] = "ClassVariable";
    })(ReferenceType = exports.ReferenceType || (exports.ReferenceType = {}));
    class Reference {
    }
    exports.Reference = Reference;
    class Context {
        constructor(parent = null) {
            this.classes = null;
            this.classes = parent === null ? new ClassRepository() : parent.classes;
        }
        inherit() {
            return new Context(this);
        }
    }
    exports.Context = Context;
    class ClassRepository {
        constructor() {
            this.classes = {};
        }
        addClass(cls) {
            this.classes[cls.name] = cls;
        }
        getClass(name) {
            const cls = this.classes[name];
            if (!cls)
                console.log(`[ClassRepository] Class not found: ${name}.`);
            return cls;
        }
    }
    exports.ClassRepository = ClassRepository;
    class GenericsMapping {
        constructor(map) {
            this.map = map;
        }
        static log(data) { console.log(`[GenericsMapping] ${data}`); }
        static create(cls, realClassType) {
            if (cls.typeArguments.length !== realClassType.typeArguments.length) {
                this.log(`Type argument count mismatch! '${cls.type.repr()}' <=> '${realClassType.repr()}'`);
                return null;
            }
            const resolveDict = {};
            for (let i = 0; i < cls.typeArguments.length; i++)
                resolveDict[cls.typeArguments[i]] = realClassType.typeArguments[i];
            return new GenericsMapping(resolveDict);
        }
        replace(type) {
            let newType = Ast_1.OneAst.Type.Load(type);
            if (type.isGenerics) {
                const resolvedType = this.map[type.genericsName];
                if (!resolvedType)
                    GenericsMapping.log(`Generics '${type.genericsName}' is not mapped. Mapped types: ${Object.keys(this.map).join(", ")}.`);
                else
                    newType = Ast_1.OneAst.Type.Load(resolvedType);
            }
            if (newType.isClass)
                for (let i = 0; i < newType.typeArguments.length; i++)
                    newType.typeArguments[i] = this.replace(newType.typeArguments[i]);
            return newType;
        }
    }
    exports.GenericsMapping = GenericsMapping;
    class InferTypesTransform extends AstVisitor_1.AstVisitor {
        constructor() {
            super(...arguments);
            this.name = "inferTypes";
            this.dependencies = ["fillName", "fillParent", "resolveIdentifiers"];
        }
        visitIdentifier(id, context) {
            console.log(`No identifier should be here!`);
        }
        visitVariableDeclaration(stmt, context) {
            super.visitVariableDeclaration(stmt, context);
            if (stmt.initializer)
                stmt.type = stmt.initializer.valueType;
        }
        visitForeachStatement(stmt, context) {
            this.visitExpression(stmt.items, context);
            const itemsType = stmt.items.valueType;
            const itemsClass = context.classes.getClass(itemsType.className);
            if (!itemsClass || !itemsClass.meta.iterable || itemsType.typeArguments.length === 0) {
                console.log(`Tried to use foreach on a non-array type: ${itemsType.repr()}!`);
                stmt.itemVariable.type = Ast_1.OneAst.Type.Any;
            }
            else {
                stmt.itemVariable.type = itemsType.typeArguments[0];
            }
            this.visitBlock(stmt.body, context);
        }
        visitBinaryExpression(expr, context) {
            super.visitBinaryExpression(expr, context);
            if (expr.left.valueType.isNumber && expr.right.valueType.isNumber)
                expr.valueType = Ast_1.OneAst.Type.Number;
        }
        visitReturnStatement(stmt, context) {
            super.visitReturnStatement(stmt, context);
        }
        visitUnaryExpression(expr, context) {
            this.visitExpression(expr.operand, context);
            if (expr.operand.valueType.isNumber)
                expr.valueType = Ast_1.OneAst.Type.Number;
        }
        visitElementAccessExpression(expr, context) {
            super.visitElementAccessExpression(expr, context);
            // TODO: use the return type of get() method
            const typeArgs = expr.object.valueType.typeArguments;
            if (typeArgs && typeArgs.length === 1)
                expr.valueType = typeArgs[0];
        }
        visitCallExpression(expr, context) {
            super.visitCallExpression(expr, context);
            if (!expr.method.valueType.isMethod) {
                this.log(`Tried to call a non-method type '${expr.method.valueType.repr()}'.`);
                return;
            }
            const className = expr.method.valueType.classType.className;
            const methodName = expr.method.valueType.methodName;
            const cls = context.classes.getClass(className);
            const method = cls.methods[methodName];
            if (!method) {
                this.log(`Method not found: ${className}::${methodName}`);
                return;
            }
            expr.valueType = Ast_1.OneAst.Type.Load(method.returns);
            const thisExpr = expr.method.thisExpr;
            if (thisExpr) {
                const genMap = GenericsMapping.create(cls, thisExpr.valueType);
                expr.valueType = genMap.replace(expr.valueType);
            }
        }
        getType(name) {
            if (name === "number")
                return Ast_1.OneAst.Type.Number;
            else if (name === "string")
                return Ast_1.OneAst.Type.String;
            else if (name === "boolean")
                return Ast_1.OneAst.Type.Boolean;
            else if (name === "null")
                return Ast_1.OneAst.Type.Null;
            else
                return null;
        }
        visitNewExpression(expr, context) {
            super.visitNewExpression(expr, context);
            expr.valueType = Ast_1.OneAst.Type.Load(expr.cls.valueType);
            expr.valueType.typeArguments = expr.typeArguments.map(t => this.getType(t) || Ast_1.OneAst.Type.Class(t));
        }
        visitLiteral(expr, context) {
            if (expr.literalType === "numeric")
                expr.valueType = Ast_1.OneAst.Type.Number;
            else if (expr.literalType === "string")
                expr.valueType = Ast_1.OneAst.Type.String;
            else if (expr.literalType === "boolean")
                expr.valueType = Ast_1.OneAst.Type.Boolean;
            else if (expr.literalType === "null")
                expr.valueType = Ast_1.OneAst.Type.Null;
            else
                this.log(`Could not inter literal type: ${expr.literalType}`);
        }
        visitParenthesizedExpression(expr, context) {
            super.visitParenthesizedExpression(expr, context);
            expr.valueType = expr.expression.valueType;
        }
        visitPropertyAccessExpression(expr, context) {
            super.visitPropertyAccessExpression(expr, context);
            const objType = expr.object.valueType;
            if (!objType.isClass) {
                this.log(`Cannot access property '${expr.propertyName}' on object type '${expr.object.valueType.repr()}'.`);
                return;
            }
            const cls = context.classes.getClass(objType.className);
            if (!cls) {
                this.log(`Class not found: ${objType.className}`);
                return;
            }
            const thisIsStatic = expr.object.exprKind === Ast_1.OneAst.ExpressionKind.ClassReference;
            const thisIsThis = expr.object.exprKind === Ast_1.OneAst.ExpressionKind.ThisReference;
            const method = cls.methods[expr.propertyName];
            if (method) {
                if (method.static && !thisIsStatic)
                    this.log("Tried to call static method via instance reference");
                else if (!method.static && thisIsStatic)
                    this.log("Tried to call non-static method via static reference");
                const newValue = new Ast_1.OneAst.MethodReference(method, thisIsStatic ? null : expr.object);
                const newExpr = AstHelper_1.AstHelper.replaceProperties(expr, newValue);
                newExpr.valueType = Ast_1.OneAst.Type.Method(objType, method.name);
                return;
            }
            const fieldOrProp = cls.fields[expr.propertyName] || cls.properties[expr.propertyName];
            if (fieldOrProp) {
                const newValue = Ast_1.OneAst.VariableRef.InstanceField(expr.object, fieldOrProp);
                const newExpr = AstHelper_1.AstHelper.replaceProperties(expr, newValue);
                newExpr.valueType = fieldOrProp.type;
                return;
            }
            this.log(`Member not found: ${objType.className}::${expr.propertyName}`);
        }
        visitArrayLiteral(expr, context) {
            super.visitArrayLiteral(expr, context);
            let itemType = expr.items.length > 0 ? expr.items[0].valueType : Ast_1.OneAst.Type.Any;
            if (expr.items.some(x => !x.valueType.equals(itemType)))
                itemType = Ast_1.OneAst.Type.Any;
            expr.valueType = Ast_1.OneAst.Type.Class(context.schemaCtx.arrayType, [itemType]);
        }
        visitMapLiteral(expr, context) {
            super.visitMapLiteral(expr, context);
            let itemType = expr.properties.length > 0 ? expr.properties[0].type : Ast_1.OneAst.Type.Any;
            if (expr.properties.some(x => !x.type.equals(itemType)))
                itemType = Ast_1.OneAst.Type.Any;
            expr.valueType = Ast_1.OneAst.Type.Class(context.schemaCtx.mapType, [Ast_1.OneAst.Type.String, itemType]);
        }
        visitExpression(expression, context) {
            super.visitExpression(expression, context);
            if (!expression.valueType)
                expression.valueType = Ast_1.OneAst.Type.Any;
        }
        visitClassReference(expr, context) {
            expr.valueType = expr.classRef.type;
        }
        visitThisReference(expr, context) {
            expr.valueType = context.currClass.type;
        }
        visitVariableRef(expr, context) {
            super.visitVariableRef(expr, context);
            expr.valueType = expr.varRef.type;
        }
        visitMethodReference(expr, context) {
            expr.valueType = expr.methodRef.type || expr.valueType;
        }
        visitMethod(method, context) {
            method.type = Ast_1.OneAst.Type.Method(method.classRef.type, method.name);
            super.visitMethod(method, context);
        }
        visitClass(cls, context) {
            context.currClass = cls;
            cls.type = Ast_1.OneAst.Type.Class(cls.name, cls.typeArguments.map(t => Ast_1.OneAst.Type.Generics(t)));
            super.visitClass(cls, context);
        }
        transform(schemaCtx) {
            const context = new Context();
            context.schemaCtx = schemaCtx;
            context.classes = schemaCtx.tiContext.classes;
            for (const cls of Object.values(schemaCtx.schema.classes))
                context.classes.addClass(cls);
            for (const cls of Object.values(schemaCtx.schema.classes)) {
                this.visitClass(cls, context);
            }
        }
    }
    exports.InferTypesTransform = InferTypesTransform;
});
//# sourceMappingURL=InferTypesTransform.js.map