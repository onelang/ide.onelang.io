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
    class JSMethodHandler {
        call(method, args, thisObj, model) {
            if (typeof method !== "function")
                ExprLangVM.fail(`Tried to call a non-method value: '${method}' (${typeof method})`);
            const result = method.apply(thisObj, args);
            return result;
        }
    }
    exports.JSMethodHandler = JSMethodHandler;
    class VariableSource {
        constructor(name) {
            this.name = name;
            this.vars = {};
            this.callbacks = {};
        }
        checkUnique(varName, allowOverwrite = false) {
            if (!varName)
                ExprLangVM.fail("Variable name is missing!");
            if (varName in this.callbacks)
                ExprLangVM.fail(`Callback was already set for variable '${varName}'`);
            if (!allowOverwrite && varName in this.vars)
                ExprLangVM.fail(`Variable '${varName}' was already set`);
        }
        addCallback(varName, callback) {
            this.checkUnique(varName);
            this.callbacks[varName] = callback;
        }
        setVariable(varName, value, allowOverwrite = false) {
            this.checkUnique(varName, allowOverwrite);
            this.vars[varName] = value;
        }
        getVariable(varName) {
            let result = null;
            if (varName in this.vars) {
                result = this.vars[varName];
            }
            else if (varName in this.callbacks) {
                result = this.callbacks[varName]();
            }
            return result;
        }
        printAll() {
            const result = Object.keys(this.vars).map(varName => `${varName}: ${this.vars[varName]}`)
                .concat(Object.keys(this.callbacks).map(varName => `${varName}: ${this.callbacks[varName]()}`));
            return result.map(x => `${x}\n`).join("");
        }
        static createSingle(varName, value, sourceName) {
            const source = new VariableSource(sourceName || `var: ${varName}`);
            source.setVariable(varName, value);
            return source;
        }
        static fromObject(obj, sourceName) {
            const source = new VariableSource(sourceName || `object`);
            for (const key in obj)
                source.setVariable(key, obj[key]);
            return source;
        }
    }
    exports.VariableSource = VariableSource;
    class VariableContext {
        constructor(sources = []) {
            this.sources = sources;
        }
        inherit(...newSources) {
            return new VariableContext([...newSources, ...this.sources]);
        }
        getVariable(varName) {
            for (const source of this.sources) {
                const result = source.getVariable(varName);
                if (result !== null)
                    return result;
            }
            ExprLangVM.fail(`Variable '${varName}' was not found in contexts: `
                + this.sources.map(x => `'${x.name}'`).join(", "));
        }
        printAll() {
            const result = this.sources.map(src => `Source['${src.name}']:\n  ${src.printAll().replace(/\n/g, "\n  ")}`).join("\n");
            return result;
        }
    }
    exports.VariableContext = VariableContext;
    class ExprLangVM {
        static accessMember(obj, memberName) {
            if (typeof obj !== "object")
                this.fail(`Expected object for accessing member: (${typeof obj})`);
            if (!(memberName in obj))
                return null;
            //ExprLangVM.fail(`Member '${memberName}' not found in object '${obj.constructor.name}' (${typeof obj})`);
            return obj[memberName];
        }
        static fail(msg) {
            throw new Error(`[ExprLangVM] ${msg}`);
        }
        evaluate(expr, vars) {
            if (expr.kind === "literal") {
                const litExpr = expr;
                return litExpr.value;
            }
            else if (expr.kind === "identifier") {
                const identifier = expr;
                if (identifier.text === "true") {
                    return true;
                }
                else if (identifier.text === "false") {
                    return false;
                }
                else if (identifier.text === "null") {
                    return null;
                }
                else {
                    const result = vars.getVariable(identifier.text);
                    return result;
                }
            }
            else if (expr.kind === "unary") {
                const unaryExpr = expr;
                const exprValue = this.evaluate(unaryExpr.expr, vars);
                if (unaryExpr.op === "!") {
                    return !exprValue;
                }
                else if (unaryExpr.op === "+") {
                    return +exprValue;
                }
                else if (unaryExpr.op === "-") {
                    return -exprValue;
                }
                else
                    ExprLangVM.fail(`Unexpected unary operator: '${unaryExpr.op}'`);
            }
            else if (expr.kind === "binary") {
                const binaryExpr = expr;
                const leftValue = this.evaluate(binaryExpr.left, vars);
                const rightValue = this.evaluate(binaryExpr.right, vars);
                if (binaryExpr.op === "+") {
                    return leftValue + rightValue;
                }
                else if (binaryExpr.op === "-") {
                    return leftValue - rightValue;
                }
                else if (binaryExpr.op === "*") {
                    return leftValue * rightValue;
                }
                else if (binaryExpr.op === "/") {
                    return leftValue / rightValue;
                }
                else if (binaryExpr.op === "<<") {
                    return leftValue << rightValue;
                }
                else if (binaryExpr.op === ">>") {
                    return leftValue >> rightValue;
                }
                else if (binaryExpr.op === "==") {
                    return leftValue === rightValue;
                }
                else if (binaryExpr.op === "!=") {
                    return leftValue !== rightValue;
                }
                else if (binaryExpr.op === ">=") {
                    return leftValue >= rightValue;
                }
                else if (binaryExpr.op === "<=") {
                    return leftValue <= rightValue;
                }
                else if (binaryExpr.op === "<") {
                    return leftValue < rightValue;
                }
                else if (binaryExpr.op === ">") {
                    return leftValue > rightValue;
                }
                else if (binaryExpr.op === "&&") {
                    return leftValue && rightValue;
                }
                else if (binaryExpr.op === "||") {
                    return leftValue || rightValue;
                }
                else
                    ExprLangVM.fail(`Unexpected binary operator: '${binaryExpr.op}'`);
            }
            else if (expr.kind === "parenthesized") {
                const parenExpr = expr;
                const exprValue = this.evaluate(parenExpr, vars);
                return exprValue;
            }
            else if (expr.kind === "conditional") {
                const condExpr = expr;
                const condValue = this.evaluate(condExpr.condition, vars);
                const result = this.evaluate(condValue ? condExpr.whenTrue : condExpr.whenFalse, vars);
                return result;
            }
            else if (expr.kind === "call") {
                const callExpr = expr;
                const method = this.evaluate(callExpr.method, vars);
                let thisObj;
                if (callExpr.method.kind === "propertyAccess") {
                    const thisObjExpr = callExpr.method.object;
                    thisObj = this.evaluate(thisObjExpr, vars);
                }
                else {
                    thisObj = null;
                }
                const args = callExpr.arguments.map(arg => this.evaluate(arg, vars));
                if (!this.methodHandler)
                    ExprLangVM.fail(`Method handler was not set!`);
                const result = this.methodHandler.call(method, args, thisObj, vars);
                return result;
            }
            else if (expr.kind === "propertyAccess") {
                const propAccExpr = expr;
                const object = this.evaluate(propAccExpr.object, vars);
                const result = ExprLangVM.accessMember(object, propAccExpr.propertyName);
                return result;
            }
            else if (expr.kind === "elementAccess") {
                const elemAccExpr = expr;
                const object = this.evaluate(elemAccExpr.object, vars);
                const memberName = this.evaluate(elemAccExpr.elementExpr, vars);
                const result = ExprLangVM.accessMember(object, memberName);
                return result;
            }
            else {
                ExprLangVM.fail(`Unknown expression kind: '${expr.kind}'`);
            }
        }
    }
    exports.ExprLangVM = ExprLangVM;
});
//# sourceMappingURL=ExprLangVM.js.map