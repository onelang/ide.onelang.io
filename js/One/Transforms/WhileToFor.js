(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./../Ast", "../AstVisitor", "../AstHelper"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Ast_1 = require("./../Ast");
    const AstVisitor_1 = require("../AstVisitor");
    const AstHelper_1 = require("../AstHelper");
    // converts 
    //    var i = ...;
    //    while (i <op> ...) {
    //        ...
    //        i-- / i++ / i ?= ...
    //    }
    // to 
    //    for (var i = ...; i <op> ...; i...)
    class WhileToForTransform extends AstVisitor_1.AstVisitor {
        visitBlock(block) {
            super.visitBlock(block, null);
            for (let i = 0; i < block.statements.length - 1; i++) {
                if (block.statements[i].stmtType !== "VariableDeclaration" ||
                    block.statements[i + 1].stmtType !== "While")
                    continue;
                const initVarDecl = block.statements[i];
                const whileStmt = block.statements[i + 1];
                const condition = whileStmt.condition;
                if (condition.exprKind !== "Binary" || condition.left.exprKind !== "VariableReference" ||
                    condition.left.varRef.name !== initVarDecl.name)
                    continue;
                const lastStmt = whileStmt.body.statements.last();
                if (!lastStmt || lastStmt.stmtType !== "ExpressionStatement")
                    continue;
                const modifiedExpr = AstHelper_1.AstHelper.getModifiedExpr(lastStmt.expression);
                if (!modifiedExpr || modifiedExpr.exprKind !== "VariableReference" ||
                    modifiedExpr.varRef.name !== initVarDecl.name)
                    continue;
                whileStmt.body.statements.pop();
                const forStmt = { stmtType: Ast_1.OneAst.StatementType.For,
                    itemVariable: initVarDecl,
                    condition,
                    incrementor: lastStmt.expression,
                    body: whileStmt.body,
                    leadingTrivia: whileStmt.leadingTrivia
                };
                block.statements.splice(i, 2, forStmt);
            }
        }
        transform(schemaCtx) {
            this.visitSchema(schemaCtx.schema, null);
        }
    }
    exports.WhileToForTransform = WhileToForTransform;
});
//# sourceMappingURL=WhileToFor.js.map