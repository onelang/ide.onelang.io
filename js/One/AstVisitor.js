(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Ast"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Ast_1 = require("./Ast");
    class AstVisitor {
        log(data) {
            const thisClassName = this.constructor.name;
            console.log(`[${thisClassName}]`, data);
        }
        visitNode(node, context) {
        }
        visitNamedItem(namedItem, context) {
            this.visitNode(namedItem, context);
        }
        visitType(type, context) {
            if (!type)
                return;
            this.visitNode(type, context);
            if (type.isClassOrInterface)
                for (const typeArg of type.typeArguments)
                    this.visitType(typeArg, context);
        }
        visitIdentifier(id, context) { }
        visitReturnStatement(stmt, context) {
            if (stmt.expression)
                this.visitExpression(stmt.expression, context);
        }
        visitExpressionStatement(stmt, context) {
            this.visitExpression(stmt.expression, context);
        }
        visitIfStatement(stmt, context) {
            this.visitExpression(stmt.condition, context);
            this.visitBlock(stmt.then, context);
            if (stmt.else)
                this.visitBlock(stmt.else, context);
        }
        visitThrowStatement(stmt, context) {
            this.visitExpression(stmt.expression, context);
        }
        visitVariable(stmt, context) {
            this.visitNamedItem(stmt, context);
            this.visitType(stmt.type, context);
        }
        visitVariableDeclaration(stmt, context) {
            this.visitVariable(stmt, context);
            if (stmt.initializer)
                this.visitExpression(stmt.initializer, context);
        }
        visitWhileStatement(stmt, context) {
            this.visitExpression(stmt.condition, context);
            this.visitBlock(stmt.body, context);
        }
        visitForStatement(stmt, context) {
            this.visitVariableDeclaration(stmt.itemVariable, context);
            this.visitExpression(stmt.itemVariable.initializer, context);
            this.visitExpression(stmt.condition, context);
            this.visitExpression(stmt.incrementor, context);
            this.visitBlock(stmt.body, context);
        }
        visitForeachStatement(stmt, context) {
            this.visitVariable(stmt.itemVariable, context);
            this.visitExpression(stmt.items, context);
            this.visitBlock(stmt.body, context);
        }
        visitBreakStatement(stmt, context) { }
        visitUnsetStatement(stmt, context) {
            this.visitExpression(stmt.expression, context);
        }
        visitUnknownStatement(stmt, context) {
            this.log(`Unknown statement type: ${stmt.stmtType}`);
        }
        visitStatement(statement, context) {
            this.visitNode(statement, context);
            if (statement.stmtType === Ast_1.OneAst.StatementType.Return) {
                return this.visitReturnStatement(statement, context);
            }
            else if (statement.stmtType === Ast_1.OneAst.StatementType.ExpressionStatement) {
                return this.visitExpressionStatement(statement, context);
            }
            else if (statement.stmtType === Ast_1.OneAst.StatementType.If) {
                return this.visitIfStatement(statement, context);
            }
            else if (statement.stmtType === Ast_1.OneAst.StatementType.Throw) {
                return this.visitThrowStatement(statement, context);
            }
            else if (statement.stmtType === Ast_1.OneAst.StatementType.VariableDeclaration) {
                return this.visitVariableDeclaration(statement, context);
            }
            else if (statement.stmtType === Ast_1.OneAst.StatementType.While) {
                return this.visitWhileStatement(statement, context);
            }
            else if (statement.stmtType === Ast_1.OneAst.StatementType.For) {
                return this.visitForStatement(statement, context);
            }
            else if (statement.stmtType === Ast_1.OneAst.StatementType.Foreach) {
                return this.visitForeachStatement(statement, context);
            }
            else if (statement.stmtType === Ast_1.OneAst.StatementType.Break) {
                return this.visitBreakStatement(statement, context);
            }
            else if (statement.stmtType === Ast_1.OneAst.StatementType.Unset) {
                return this.visitUnsetStatement(statement, context);
            }
            else {
                return this.visitUnknownStatement(statement, context);
            }
        }
        visitBlock(block, context) {
            this.visitNamedItem(block, context);
            for (const statement of block.statements) {
                this.visitStatement(statement, context);
            }
        }
        visitBinaryExpression(expr, context) {
            this.visitExpression(expr.left, context);
            this.visitExpression(expr.right, context);
        }
        visitCallExpression(expr, context) {
            this.visitExpression(expr.method, context);
            for (const arg of expr.arguments)
                this.visitExpression(arg, context);
        }
        visitConditionalExpression(expr, context) {
            this.visitExpression(expr.condition, context);
            this.visitExpression(expr.whenTrue, context);
            this.visitExpression(expr.whenFalse, context);
        }
        visitNewExpression(expr, context) {
            this.visitExpression(expr.cls, context);
            for (const arg of expr.arguments)
                this.visitExpression(arg, context);
        }
        visitLiteral(expr, context) { }
        visitTemplateString(expr, context) {
            for (const part of expr.parts.filter(x => x.expr))
                this.visitExpression(part.expr, context);
        }
        visitParenthesizedExpression(expr, context) {
            this.visitExpression(expr.expression, context);
        }
        visitUnaryExpression(expr, context) {
            this.visitExpression(expr.operand, context);
        }
        visitPropertyAccessExpression(expr, context) {
            this.visitExpression(expr.object, context);
        }
        visitElementAccessExpression(expr, context) {
            this.visitExpression(expr.object, context);
            this.visitExpression(expr.elementExpr, context);
        }
        visitArrayLiteral(expr, context) {
            for (const item of expr.items)
                this.visitExpression(item, context);
        }
        visitMapLiteral(expr, context) {
            for (const item of expr.properties)
                this.visitVariableDeclaration(item, context);
        }
        visitUnknownExpression(expr, context) {
            this.log(`Unknown expression type: ${expr.exprKind}`);
        }
        visitVariableRef(expr, context) {
            if (expr.thisExpr)
                this.visitExpression(expr.thisExpr, context);
        }
        visitMethodReference(expr, context) {
            if (expr.thisExpr)
                this.visitExpression(expr.thisExpr, context);
        }
        visitClassReference(expr, context) { }
        visitThisReference(expr, context) { }
        visitEnumReference(expr, context) { }
        visitEnumMemberReference(expr, context) { }
        visitCastExpression(expr, context) {
            this.visitExpression(expr.expression, context);
        }
        visitExpression(expression, context) {
            this.visitNode(expression, context);
            if (expression.exprKind === Ast_1.OneAst.ExpressionKind.Binary) {
                return this.visitBinaryExpression(expression, context);
            }
            else if (expression.exprKind === Ast_1.OneAst.ExpressionKind.Call) {
                return this.visitCallExpression(expression, context);
            }
            else if (expression.exprKind === Ast_1.OneAst.ExpressionKind.Conditional) {
                return this.visitConditionalExpression(expression, context);
            }
            else if (expression.exprKind === Ast_1.OneAst.ExpressionKind.Identifier) {
                return this.visitIdentifier(expression, context);
            }
            else if (expression.exprKind === Ast_1.OneAst.ExpressionKind.New) {
                return this.visitNewExpression(expression, context);
            }
            else if (expression.exprKind === Ast_1.OneAst.ExpressionKind.Literal) {
                return this.visitLiteral(expression, context);
            }
            else if (expression.exprKind === Ast_1.OneAst.ExpressionKind.TemplateString) {
                return this.visitTemplateString(expression, context);
            }
            else if (expression.exprKind === Ast_1.OneAst.ExpressionKind.Parenthesized) {
                return this.visitParenthesizedExpression(expression, context);
            }
            else if (expression.exprKind === Ast_1.OneAst.ExpressionKind.Unary) {
                return this.visitUnaryExpression(expression, context);
            }
            else if (expression.exprKind === Ast_1.OneAst.ExpressionKind.PropertyAccess) {
                return this.visitPropertyAccessExpression(expression, context);
            }
            else if (expression.exprKind === Ast_1.OneAst.ExpressionKind.ElementAccess) {
                return this.visitElementAccessExpression(expression, context);
            }
            else if (expression.exprKind === Ast_1.OneAst.ExpressionKind.ArrayLiteral) {
                return this.visitArrayLiteral(expression, context);
            }
            else if (expression.exprKind === Ast_1.OneAst.ExpressionKind.MapLiteral) {
                return this.visitMapLiteral(expression, context);
            }
            else if (expression.exprKind === Ast_1.OneAst.ExpressionKind.VariableReference) {
                return this.visitVariableRef(expression, context);
            }
            else if (expression.exprKind === Ast_1.OneAst.ExpressionKind.MethodReference) {
                return this.visitMethodReference(expression, context);
            }
            else if (expression.exprKind === Ast_1.OneAst.ExpressionKind.ClassReference) {
                return this.visitClassReference(expression, context);
            }
            else if (expression.exprKind === Ast_1.OneAst.ExpressionKind.ThisReference) {
                return this.visitThisReference(expression, context);
            }
            else if (expression.exprKind === Ast_1.OneAst.ExpressionKind.EnumReference) {
                return this.visitEnumReference(expression, context);
            }
            else if (expression.exprKind === Ast_1.OneAst.ExpressionKind.EnumMemberReference) {
                return this.visitEnumMemberReference(expression, context);
            }
            else if (expression.exprKind === Ast_1.OneAst.ExpressionKind.Cast) {
                return this.visitCastExpression(expression, context);
            }
            else {
                return this.visitUnknownExpression(expression, context);
            }
        }
        visitMethodLike(method, context) {
            this.visitNamedItem(method, context);
            if (method.body)
                this.visitBlock(method.body, context);
            for (const param of method.parameters)
                this.visitVariableDeclaration(param, context);
        }
        visitMethod(method, context) {
            this.visitMethodLike(method, context);
            this.visitType(method.returns, context);
        }
        visitConstructor(constructor, context) {
            this.visitMethodLike(constructor, context);
        }
        visitField(field, context) {
            this.visitVariableDeclaration(field, context);
        }
        visitProperty(prop, context) {
            this.visitBlock(prop.getter, context);
            this.visitVariable(prop, context);
        }
        visitInterface(intf, context) {
            this.visitNamedItem(intf, context);
            for (const method of Object.values(intf.methods))
                this.visitMethod(method, context);
        }
        visitClass(cls, context) {
            this.visitNamedItem(cls, context);
            if (cls.constructor)
                this.visitConstructor(cls.constructor, context);
            for (const method of Object.values(cls.methods))
                this.visitMethod(method, context);
            for (const prop of Object.values(cls.properties))
                this.visitProperty(prop, context);
            for (const field of Object.values(cls.fields))
                this.visitField(field, context);
        }
        visitEnum(enum_, context) {
            this.visitNamedItem(enum_, context);
            for (var item of enum_.values)
                this.visitEnumMember(item, context);
        }
        visitEnumMember(enumMember, context) {
            this.visitNamedItem(enumMember, context);
        }
        visitSchema(schema, context) {
            for (const enum_ of Object.values(schema.enums))
                this.visitEnum(enum_, context);
            for (const intf of Object.values(schema.interfaces))
                this.visitInterface(intf, context);
            for (const cls of Object.values(schema.classes))
                this.visitClass(cls, context);
            this.visitBlock(schema.mainBlock, context);
        }
    }
    exports.AstVisitor = AstVisitor;
});
//# sourceMappingURL=AstVisitor.js.map