(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../ExprLang/ExprLangParser", "../ExprLang/ExprLangVM", "./TemplateAst", "./TemplateParser"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ExprLangParser_1 = require("../ExprLang/ExprLangParser");
    const ExprLangVM_1 = require("../ExprLang/ExprLangVM");
    const TemplateAst_1 = require("./TemplateAst");
    const TemplateParser_1 = require("./TemplateParser");
    /**
     * Some important notes:
     *  - nodes DON'T include trailing '\n', it's only added when they are included into somewhere else
     *  - the AST usually contains all the newline ('\n') characters, except for "for" and "if" constructs,
     *    because those are not always generate _any_ result (not even a newline), eg:
     *      - for: no items and {{else}} is not specified
     *      - if: condition is not true and {{else}} is not specified
     *    so we have to add that '\n' here in the generator based on runtime data
     *    (but only if it's not an inline construct & it's not the last node -> no trailing '\n' is allowed)
     *  - empty string ("") and <null> are different: <null> is created when an if or for does not match any item
     *    <null> does not generate code, not counts as a valid item in for (so no separator included)
     *    empty string ("") can generate code (eg. new line, separator in for loop, etc)
     */
    class TemplateMethod {
        constructor(name, args, template) {
            this.name = name;
            this.args = args;
            this.template = template;
            this.body = TemplateParser_1.TemplateParser.parse(template);
        }
        static fromSignature(signature, template) {
            const signatureAst = ExprLangParser_1.ExprLangParser.parse(signature);
            if (signatureAst.kind === "call") {
                const callExpr = signatureAst;
                const name = callExpr.method.text;
                const args = callExpr.arguments.map(x => x.text);
                return new TemplateMethod(name, args, template);
            }
            else if (signatureAst.kind === "identifier") {
                const idExpr = signatureAst;
                const name = idExpr.text;
                return new TemplateMethod(name, [], template);
            }
            else {
                throw new Error(`Could not parse method signature: '${signature}'`);
            }
        }
    }
    exports.TemplateMethod = TemplateMethod;
    class CallStackItem {
        constructor(methodName, vars) {
            this.methodName = methodName;
            this.vars = vars;
        }
    }
    exports.CallStackItem = CallStackItem;
    class GeneratedNode {
        constructor(text) {
            this.text = text;
        }
    }
    exports.GeneratedNode = GeneratedNode;
    class TemplateGenerator {
        constructor(variables) {
            this.vm = new ExprLangVM_1.ExprLangVM();
            this.methods = new ExprLangVM_1.VariableSource("TemplateGenerator methods");
            this.callStack = [];
            this.vm.methodHandler = this;
            this.rootVars = variables.inherit(this.methods);
        }
        addMethod(method) {
            this.methods.addCallback(method.name, () => method);
        }
        call(method, args, thisObj, vars) {
            let result;
            this.callStack.push(new CallStackItem(method.name, vars));
            if (method instanceof TemplateMethod) {
                //if (args.length !== method.args.length)
                //    throw new Error(`Method '${method.name}' called with ${args.length} arguments, but expected ${method.args.length}`);
                const varSource = new ExprLangVM_1.VariableSource(`method: ${method.name}`);
                for (let i = 0; i < args.length; i++)
                    varSource.setVariable(method.args[i], args[i]);
                result = this.generateNode(method.body, vars.inherit(varSource));
            }
            else if (typeof method === "function") {
                result = method.apply(thisObj, args);
            }
            else {
                throw new Error(`Expected TemplateMethod or function, but got ${method}`);
            }
            this.callStack.pop();
            return result;
        }
        isSimpleTextNode(node) {
            return node instanceof TemplateAst_1.TemplateAst.Line && node.items[0] instanceof TemplateAst_1.TemplateAst.TextNode;
        }
        static join(items, separator) {
            const result = [];
            for (const item of items) {
                if (result.length !== 0)
                    result.push(new GeneratedNode(separator));
                result.push(item);
            }
            return result;
        }
        static joinLines(lines, separator) {
            const result = [];
            for (const line of lines) {
                if (result.length !== 0)
                    result.push(new GeneratedNode(separator));
                result.push(...line);
            }
            return result;
        }
        processBlockNode(node, vars) {
            const lines = node.lines.map(x => this.generateNode(x, vars));
            const removeWs = lines.map(x => x === null);
            const resultLines = [];
            for (let iLine = 0; iLine < lines.length; iLine++) {
                const line = lines[iLine];
                if (line === null)
                    continue;
                const origLine = node.lines[iLine];
                const origLineWs = origLine instanceof TemplateAst_1.TemplateAst.Line && origLine.items.length === 0;
                if (origLineWs) {
                    if (removeWs[iLine - 1]) {
                        removeWs[iLine - 1] = false;
                        continue;
                    }
                    if (removeWs[iLine + 1]) {
                        removeWs[iLine + 1] = false;
                        continue;
                    }
                }
                resultLines.push(line);
            }
            const result = resultLines.length > 0 ? TemplateGenerator.joinLines(resultLines, "\n") : null;
            return result;
        }
        processLineNode(node, vars) {
            const lines = node.items.map(x => this.generateNode(x, vars));
            const nonNullLines = lines.filter(x => x !== null);
            if (lines.length === 0) {
                return [new GeneratedNode("")];
            }
            else if (nonNullLines.length === 0) {
                return null;
            }
            else {
                const hasIndent = node.indentLen > 0;
                const indent = hasIndent ? new GeneratedNode(" ".repeat(node.indentLen)) : null;
                let result = [];
                if (hasIndent)
                    result.push(indent);
                for (const line of nonNullLines) {
                    if (hasIndent) {
                        for (const item of line) {
                            const parts = item.text.toString().split(/\n/g);
                            if (parts.length === 1) {
                                result.push(item);
                            }
                            else {
                                result.push(new GeneratedNode(parts[0]), new GeneratedNode("\n"));
                                result.push(...TemplateGenerator.joinLines(parts.slice(1).map(x => [indent, new GeneratedNode(x)]), "\n"));
                            }
                        }
                    }
                    else {
                        result.push(...line);
                    }
                }
                return result;
            }
        }
        processIfNode(node, vars) {
            let resultBlock = node.else;
            for (const item of node.items) {
                const condValue = this.vm.evaluate(item.condition, vars);
                if (condValue) {
                    resultBlock = item.body;
                    break;
                }
            }
            const result = resultBlock ? this.generateNode(resultBlock, vars) : null;
            return result;
        }
        processForNode(node, vars) {
            let result;
            const array = this.vm.evaluate(node.arrayExpr, vars);
            if (array.length === 0) {
                result = node.else ? this.generateNode(node.else, vars) : null;
            }
            else {
                const lines = [];
                const varSource = new ExprLangVM_1.VariableSource(`for: ${node.itemName}`);
                const newVars = vars.inherit(varSource);
                for (let itemIdx = 0; itemIdx < array.length; itemIdx++) {
                    varSource.setVariable(node.itemName, array[itemIdx], true);
                    varSource.setVariable(`${node.itemName}_idx`, itemIdx, true);
                    const line = this.generateNode(node.body, newVars);
                    if (line !== null)
                        lines.push(line);
                }
                result = lines.length === 0 ? null : TemplateGenerator.joinLines(lines, node.separator);
            }
            return result;
        }
        processTemplateNode(node, vars) {
            const result = this.vm.evaluate(node.expr, vars);
            if (typeof (result) === "object")
                return result;
            const resNode = new GeneratedNode(result);
            return [resNode];
        }
        generateNode(node, vars) {
            let result;
            if (node instanceof TemplateAst_1.TemplateAst.TextNode) {
                result = [new GeneratedNode(node.value)];
            }
            else if (node instanceof TemplateAst_1.TemplateAst.TemplateNode) {
                result = this.processTemplateNode(node, vars);
            }
            else if (node instanceof TemplateAst_1.TemplateAst.Block) {
                result = this.processBlockNode(node, vars);
            }
            else if (node instanceof TemplateAst_1.TemplateAst.Line) {
                result = this.processLineNode(node, vars);
            }
            else if (node instanceof TemplateAst_1.TemplateAst.IfNode) {
                result = this.processIfNode(node, vars);
            }
            else if (node instanceof TemplateAst_1.TemplateAst.ForNode) {
                result = this.processForNode(node, vars);
            }
            else {
                throw new Error("Unexpected node type");
            }
            return result;
        }
        generate(template) {
            const nodes = this.generateNode(template, this.rootVars);
            const result = nodes.map(x => x.text).join("");
            return result;
        }
    }
    exports.TemplateGenerator = TemplateGenerator;
});
//# sourceMappingURL=TemplateGenerator.js.map