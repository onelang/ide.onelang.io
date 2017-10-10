(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Ast", "./AstVisitor", "./VariableContext"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Ast_1 = require("./Ast");
    const AstVisitor_1 = require("./AstVisitor");
    const VariableContext_1 = require("./VariableContext");
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
    class TiContext {
        constructor(parent = null) {
            this.variables = null;
            this.classes = null;
            this.variables = parent === null ? new VariableContext_1.VariableContext() : parent.variables.inherit();
            this.classes = parent === null ? new ClassRepository() : parent.classes;
        }
        inherit() {
            return new TiContext(this);
        }
    }
    exports.TiContext = TiContext;
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
    class InferTypesTransform extends AstVisitor_1.AstVisitor {
        constructor() {
            super(...arguments);
            this.name = "interTypes";
            this.dependencies = ["fillName"];
        }
        visitIdentifier(id, context) {
            const variable = context.variables.get(id.text);
            if (variable) {
                id.valueType = variable.type;
                if (!id.valueType)
                    this.log(`Variable type is missing: ${variable.metaPath}`);
            }
            else {
                const cls = context.classes.getClass(id.text);
                if (cls)
                    id.valueType = Ast_1.OneAst.Type.Class(id.text);
            }
            if (!id.valueType) {
                this.log(`Could not find identifier's type: ${id.text}`);
                id.valueType = Ast_1.OneAst.Type.Any;
            }
            //console.log(`Getting identifier: ${id.text} [${id.valueType.repr()}]`);
        }
        visitVariableDeclaration(stmt, context) {
            super.visitVariableDeclaration(stmt, context);
            stmt.type = stmt.initializer.valueType;
            context.variables.add(stmt);
        }
        visitForStatement(stmt, context) {
            this.visitExpression(stmt.itemVariable.initializer, context);
            stmt.itemVariable.type = stmt.itemVariable.initializer.valueType;
            const newContext = context.inherit();
            newContext.variables.add(stmt.itemVariable);
            this.visitExpression(stmt.condition, newContext);
            this.visitExpression(stmt.incrementor, newContext);
            this.visitBlock(stmt.body, newContext);
        }
        visitForeachStatement(stmt, context) {
            this.visitExpression(stmt.items, context);
            const itemsType = stmt.items.valueType;
            const itemsClass = context.classes.getClass(itemsType.className);
            if (!itemsClass || !itemsClass.meta.iteratable || itemsType.typeArguments.length === 0) {
                console.log(`Tried to use foreach on a non-array type: ${itemsType.repr()}!`);
                stmt.itemVariable.type = Ast_1.OneAst.Type.Any;
            }
            else {
                stmt.itemVariable.type = itemsType.typeArguments[0];
            }
            const newContext = context.inherit();
            newContext.variables.add(stmt.itemVariable);
            this.visitBlock(stmt.body, newContext);
        }
        visitBinaryExpression(expr, context) {
            super.visitBinaryExpression(expr, context);
            if (expr.left.valueType.typeKind === Ast_1.OneAst.TypeKind.Number &&
                expr.right.valueType.typeKind === Ast_1.OneAst.TypeKind.Number)
                expr.valueType = Ast_1.OneAst.Type.Number;
        }
        visitCallExpression(expr, context) {
            super.visitCallExpression(expr, context);
            if (expr.method.valueType.isMethod) {
                const className = expr.method.valueType.classType.className;
                const methodName = expr.method.valueType.methodName;
                const cls = context.classes.getClass(className);
                const method = cls.methods[methodName];
                if (!method)
                    this.log(`Method not found: ${className}::${methodName}`);
                else
                    expr.valueType = Ast_1.OneAst.Type.Load(method.returns);
            }
            else {
                this.log(`Tried to call a non-method type '${expr.method.valueType.repr()}'.`);
            }
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
            const method = cls.methods[expr.propertyName];
            if (method) {
                expr.valueType = Ast_1.OneAst.Type.Method(objType, expr.propertyName);
                return;
            }
            const fieldOrProp = cls.fields[expr.propertyName] || cls.properties[expr.propertyName];
            if (fieldOrProp) {
                expr.valueType = fieldOrProp.type;
                return;
            }
            this.log(`Member not found: ${objType.className}::${expr.propertyName}`);
        }
        visitArrayLiteral(expr, context) {
            super.visitArrayLiteral(expr, context);
            let itemType = expr.items.length > 0 ? expr.items[0].valueType : Ast_1.OneAst.Type.Any;
            if (expr.items.some(x => !x.valueType.equals(itemType)))
                itemType = Ast_1.OneAst.Type.Any;
            expr.valueType = Ast_1.OneAst.Type.Class("TsArray", [itemType]);
        }
        visitExpression(expression, context) {
            super.visitExpression(expression, context);
            if (!expression.valueType)
                expression.valueType = Ast_1.OneAst.Type.Any;
        }
        getTypeFromString(typeStr) {
            // TODO: serious hacks here
            if (typeStr === "int")
                return Ast_1.OneAst.Type.Number;
            else {
                console.log(`getTypeFromString unknown type: ${typeStr}`);
                return Ast_1.OneAst.Type.Any;
            }
        }
        transform(schemaCtx) {
            const globalContext = schemaCtx.tiContext.inherit();
            const classes = Object.values(schemaCtx.schema.classes);
            for (const cls of classes)
                globalContext.classes.addClass(cls);
            for (const cls of classes) {
                const classContext = globalContext.inherit();
                classContext.variables.add({ name: "this", type: Ast_1.OneAst.Type.Class(cls.name) });
                for (const method of Object.values(cls.methods)) {
                    const methodContext = classContext.inherit();
                    for (const param of method.parameters)
                        methodContext.variables.add(param);
                    this.visitBlock(method.body, methodContext);
                }
            }
        }
    }
    exports.InferTypesTransform = InferTypesTransform;
});
//# sourceMappingURL=TypeInferer.js.map