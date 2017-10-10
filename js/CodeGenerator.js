(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./KSLangSchema", "./TemplateCompiler"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const KSLangSchema_1 = require("./KSLangSchema");
    const TemplateCompiler_1 = require("./TemplateCompiler");
    var KsLangSchema;
    (function (KsLangSchema) {
        let Casing;
        (function (Casing) {
            Casing["PascalCase"] = "pascal_case";
            Casing["CamelCase"] = "camel_case";
            Casing["SnakeCase"] = "snake_case";
        })(Casing = KsLangSchema.Casing || (KsLangSchema.Casing = {}));
    })(KsLangSchema = exports.KsLangSchema || (exports.KsLangSchema = {}));
    function deindent(str) {
        function getPadLen(line) {
            for (let i = 0; i < line.length; i++)
                if (line[i] !== ' ')
                    return i;
            return -1; // whitespace line => pad === 0
        }
        const lines = str.split("\n");
        if (getPadLen(lines[0]) === -1)
            lines.shift();
        const minPadLen = Math.min.apply(null, lines.map(getPadLen).filter(x => x !== -1));
        const newStr = lines.map(x => x.length !== 0 ? x.substr(minPadLen) : x).join("\n");
        return newStr;
    }
    exports.deindent = deindent;
    function tmpl(parts, ...values) {
        let result = parts[0];
        for (let i = 0; i < values.length; i++) {
            const prevLastLineIdx = result.lastIndexOf("\n");
            const extraPad = result.length - (prevLastLineIdx === -1 ? 0 : prevLastLineIdx + 1);
            result += values[i].toString().replace(/\n/g, "\n" + " ".repeat(extraPad)) + parts[i + 1];
        }
        return deindent(result);
    }
    class CodeGeneratorModel {
        constructor(generator) {
            this.generator = generator;
            this.includes = [];
            this.absoluteIncludes = [];
            this.classes = [];
            this.expressionGenerators = {};
            this.internalMethodGenerators = {};
        }
        gen(obj) {
            const type = obj.stmtType || obj.exprKind;
            if (type === KSLangSchema_1.KSLangSchema.StatementType.Expression)
                obj = obj.expression;
            if (type === KSLangSchema_1.KSLangSchema.ExpressionKind.Call) {
                const callExpr = obj;
                const methodPath = this.generator.getMethodPath(callExpr.method);
                const method = methodPath && this.generator.lang.functions[methodPath];
                if (method) {
                    if (method.arguments.length !== callExpr.arguments.length)
                        throw new Error(`Invalid argument count for '${methodPath}': expected: ${method.arguments.length}, actual: ${callExpr.arguments.length}.`);
                    const args = callExpr.arguments.map(x => this.gen(x));
                    const code = this.internalMethodGenerators[methodPath].apply(this, args);
                    return code;
                }
            }
            let genName = type.toString();
            if (genName === KSLangSchema_1.KSLangSchema.ExpressionKind.Literal) {
                const literalExpr = obj;
                genName = `${literalExpr.literalType.ucFirst()}Literal`;
            }
            const genFunc = this.expressionGenerators[genName];
            if (!genFunc)
                throw new Error(`Expression template not found: ${genName}!`);
            const result = genFunc.call(this, obj);
            //console.log("generate statement", obj, result);
            return result;
        }
        main() { return null; }
        testGenerator(cls, method) { return null; }
    }
    class CodeGenerator {
        constructor(schema, lang) {
            this.lang = lang;
            this.model = new CodeGeneratorModel(this);
            this.schema = JSON.parse(JSON.stringify(schema)); // clone
            this.setupNames();
            this.setupClasses();
            this.setupIncludes();
            this.interTypes();
            this.compileTemplates();
        }
        getName(name, type) {
            const casing = this.lang.casing[type === "enum" ? "class" : type];
            const parts = name.split("_").map(x => x.toLowerCase());
            if (casing === KsLangSchema.Casing.CamelCase)
                return parts[0] + parts.splice(1).map(x => x.ucFirst()).join("");
            else if (casing === KsLangSchema.Casing.PascalCase)
                return parts.map(x => x.ucFirst()).join("");
            else if (casing === KsLangSchema.Casing.SnakeCase)
                return parts.join("_");
            else
                throw new Error(`Unknown casing: ${casing}`);
        }
        getTypeName(type) {
            if (type.typeKind === KSLangSchema_1.KSLangSchema.TypeKind.Array)
                return (this.lang.array || "{{type}}[]").replace("{{type}}", this.getTypeName(type.typeArguments[0]));
            else if (type.typeKind === KSLangSchema_1.KSLangSchema.TypeKind.Class)
                return this.getName(type.className, "class");
            else
                return this.lang.primitiveTypes ? this.lang.primitiveTypes[type.typeKind] : type.typeKind;
        }
        convertIdentifier(origName, vars, mode) {
            const name = origName === "class" ? "cls" : origName;
            const isLocalVar = vars.includes(name);
            return `${isLocalVar || mode === "declaration" || mode === "field" ? "" : "this."}${name}`;
        }
        getMethodPath(method) {
            let parts = [];
            let currExpr = method;
            while (true) {
                if (currExpr.exprKind === KSLangSchema_1.KSLangSchema.ExpressionKind.PropertyAccess) {
                    const propAcc = currExpr;
                    parts.push(propAcc.propertyName);
                    currExpr = propAcc.object;
                }
                else if (currExpr.exprKind === KSLangSchema_1.KSLangSchema.ExpressionKind.Identifier) {
                    parts.push(currExpr.text);
                    break;
                }
                else
                    return null;
            }
            const funcName = parts.reverse().map(x => x.toLowerCase()).join(".");
            return funcName;
        }
        genTemplate(template, args) {
            const tmpl = new TemplateCompiler_1.Template(template, args);
            tmpl.convertIdentifier = this.convertIdentifier;
            return `return tmpl\`\n${tmpl.templateToJS(tmpl.treeRoot, args)}\`;`;
        }
        setupNames() {
            for (const enumName of Object.keys(this.schema.enums)) {
                const enumObj = this.schema.enums[enumName];
                enumObj.origName = enumName;
                enumObj.name = this.getName(enumName, "enum");
            }
            for (const className of Object.keys(this.schema.classes)) {
                const cls = this.schema.classes[className];
                cls.origName = className;
                cls.name = this.getName(className, "class");
                for (const methodName of Object.keys(cls.methods)) {
                    const method = cls.methods[methodName];
                    method.origName = methodName;
                    method.name = this.getName(methodName, "method");
                }
            }
        }
        setupClasses() {
            this.model.classes = Object.keys(this.schema.classes).map(className => {
                const cls = this.schema.classes[className];
                const methods = Object.keys(cls.methods).map(methodName => {
                    const method = cls.methods[methodName];
                    return {
                        name: method.name,
                        origName: method.origName,
                        returnType: this.getTypeName(method.returns),
                        body: method.body,
                        parameters: method.parameters.map((param, idx) => {
                            return {
                                idx,
                                name: param.name,
                                type: this.getTypeName(param.type),
                            };
                        }),
                        visibility: "public" // TODO
                    };
                });
                return {
                    name: cls.name,
                    origName: cls.origName,
                    methods: methods,
                    publicMethods: methods,
                    privateMethods: []
                };
            });
        }
        setupIncludes() {
            for (const func of Object.values(this.lang.functions))
                for (const include of func.includes || [])
                    this.model.includes.push(include);
        }
        genTemplateMethodCode(name, args, template) {
            const newName = name.includes(".") ? `"${name}"` : name;
            return tmpl `
            ${newName}(${args.join(", ")}) {
                ${this.genTemplate(template, args)}
            },`;
        }
        compileTemplates() {
            this.templateObjectCode = tmpl `
            ({
                expressionGenerators: {
                    ${Object.keys(this.lang.expressions).map(name => this.genTemplateMethodCode(name.ucFirst(), ["expr"], this.lang.expressions[name])).join("\n\n")}
                },

                internalMethodGenerators: {
                    ${Object.keys(this.lang.functions).map(funcPath => {
                const funcInfo = this.lang.functions[funcPath];
                return this.genTemplateMethodCode(funcPath, funcInfo.arguments.map(x => x.name), funcInfo.template);
            }).join("\n\n")}
                },

                ${Object.keys(this.lang.templates).map(tmplName => {
                const tmplOrig = this.lang.templates[tmplName];
                const tmplObj = typeof tmplOrig === "string" ? { template: tmplOrig, args: [] } : tmplOrig;
                if (tmplName === "testGenerator")
                    tmplObj.args = [{ name: "cls" }, { name: "method" }];
                return this.genTemplateMethodCode(tmplName, tmplObj.args.map(x => x.name), tmplObj.template);
            }).join("\n\n")}
            })`;
            this.templateObject = eval(this.templateObjectCode);
        }
        generate(callTestMethod) {
            const model = Object.assign(this.model, this.templateObject);
            let code = this.model.main();
            if (callTestMethod)
                code += "\n\n" + this.model.testGenerator(this.getName("test_class", "class"), this.getName("test_method", "method"));
            return code;
        }
        interTypes() {
            new KsLangTypeInterferer(this).process();
        }
        generateOverview() {
            return new KsLangOverviewGenerator(this).result;
        }
    }
    exports.CodeGenerator = CodeGenerator;
    class KsLangTypeInterferer {
        constructor(codeGen) {
            this.codeGen = codeGen;
        }
        log(data) {
            console.log(`[TypeInferer] ${data}`);
        }
        processBlock(block) {
            for (const statement of block.statements) {
                if (statement.stmtType === KSLangSchema_1.KSLangSchema.StatementType.Return) {
                    const stmt = statement;
                    this.processExpression(stmt.expression);
                }
                else if (statement.stmtType === KSLangSchema_1.KSLangSchema.StatementType.Expression) {
                    const stmt = statement;
                    this.processExpression(stmt.expression);
                }
                else if (statement.stmtType === KSLangSchema_1.KSLangSchema.StatementType.If) {
                    const stmt = statement;
                    this.processExpression(stmt.condition);
                    this.processBlock(stmt.then);
                    this.processBlock(stmt.else);
                }
                else if (statement.stmtType === KSLangSchema_1.KSLangSchema.StatementType.Throw) {
                    const stmt = statement;
                    this.processExpression(stmt.expression);
                }
                else if (statement.stmtType === KSLangSchema_1.KSLangSchema.StatementType.Variable) {
                    const stmt = statement;
                    this.processExpression(stmt.initializer);
                }
                else if (statement.stmtType === KSLangSchema_1.KSLangSchema.StatementType.While) {
                    const stmt = statement;
                    this.processExpression(stmt.condition);
                    this.processBlock(stmt.body);
                }
                else {
                    this.log(`Unknown statement type: ${statement.stmtType}`);
                }
            }
        }
        processExpression(expression) {
            expression.valueType = new KSLangSchema_1.KSLangSchema.Type();
            expression.valueType.typeKind = KSLangSchema_1.KSLangSchema.TypeKind.Any;
            if (expression.exprKind === KSLangSchema_1.KSLangSchema.ExpressionKind.Binary) {
                const expr = expression;
                this.processExpression(expr.left);
                this.processExpression(expr.right);
                if (expr.left.valueType.typeKind === KSLangSchema_1.KSLangSchema.TypeKind.Number && expr.right.valueType.typeKind === KSLangSchema_1.KSLangSchema.TypeKind.Number)
                    expr.valueType.typeKind = KSLangSchema_1.KSLangSchema.TypeKind.Number;
            }
            else if (expression.exprKind === KSLangSchema_1.KSLangSchema.ExpressionKind.Call) {
                const expr = expression;
                this.processExpression(expr.method);
                for (const arg of expr.arguments)
                    this.processExpression(arg);
            }
            else if (expression.exprKind === KSLangSchema_1.KSLangSchema.ExpressionKind.Conditional) {
                const expr = expression;
                this.processExpression(expr.condition);
                this.processExpression(expr.whenTrue);
                this.processExpression(expr.whenFalse);
            }
            else if (expression.exprKind === KSLangSchema_1.KSLangSchema.ExpressionKind.Identifier) {
                const expr = expression;
            }
            else if (expression.exprKind === KSLangSchema_1.KSLangSchema.ExpressionKind.New) {
                const expr = expression;
                this.processExpression(expr.class);
                for (const arg of expr.arguments)
                    this.processExpression(arg);
            }
            else if (expression.exprKind === KSLangSchema_1.KSLangSchema.ExpressionKind.Literal) {
                const expr = expression;
                if (expr.literalType === "numeric")
                    expr.valueType.typeKind = KSLangSchema_1.KSLangSchema.TypeKind.Number;
                else if (expr.literalType === "string")
                    expr.valueType.typeKind = KSLangSchema_1.KSLangSchema.TypeKind.String;
                else if (expr.literalType === "boolean")
                    expr.valueType.typeKind = KSLangSchema_1.KSLangSchema.TypeKind.Boolean;
                else if (expr.literalType === "null")
                    expr.valueType.typeKind = KSLangSchema_1.KSLangSchema.TypeKind.Null;
                else
                    this.log(`Could not inter literal type: ${expr.literalType}`);
            }
            else if (expression.exprKind === KSLangSchema_1.KSLangSchema.ExpressionKind.Parenthesized) {
                const expr = expression;
                this.processExpression(expr.expression);
                expr.valueType = expr.expression.valueType;
            }
            else if (expression.exprKind === KSLangSchema_1.KSLangSchema.ExpressionKind.Unary) {
                const expr = expression;
                this.processExpression(expr.operand);
            }
            else if (expression.exprKind === KSLangSchema_1.KSLangSchema.ExpressionKind.PropertyAccess) {
                const expr = expression;
                this.processExpression(expr.object);
            }
            else if (expression.exprKind === KSLangSchema_1.KSLangSchema.ExpressionKind.ArrayLiteral) {
                const expr = expression;
                for (const item of expr.items)
                    this.processExpression(item);
                let itemType = expr.items.length > 0 ? expr.items[0].valueType : KSLangSchema_1.KSLangSchema.Type.Any;
                if (expr.items.some(x => !x.valueType.equals(itemType)))
                    itemType = KSLangSchema_1.KSLangSchema.Type.Any;
                expr.valueType = KSLangSchema_1.KSLangSchema.Type.Array(itemType);
            }
            else {
                this.log(`Unknown expression type: ${expression.exprKind}`);
            }
        }
        process() {
            for (const cls of this.codeGen.model.classes) {
                for (const method of cls.methods) {
                    this.processBlock(method.body);
                }
            }
        }
    }
    class KsLangOverviewGenerator {
        constructor(codeGen) {
            this.codeGen = codeGen;
            this.result = "";
            this.pad = "";
            this.padWasAdded = false;
            this.generate();
        }
        addLine(line) {
            this.add(`${line}\n`);
            this.padWasAdded = false;
        }
        add(data) {
            if (!this.padWasAdded) {
                this.result += this.pad;
                this.padWasAdded = true;
            }
            this.result += data;
        }
        indent(num) {
            if (num === 1)
                this.pad += "  ";
            else
                this.pad = this.pad.substr(0, this.pad.length - 2);
        }
        printBlock(block) {
            this.indent(1);
            for (const statement of block.statements) {
                this.add("- ");
                if (statement === null) {
                    this.addLine("<null>");
                }
                else if (statement.stmtType === KSLangSchema_1.KSLangSchema.StatementType.Return) {
                    const stmt = statement;
                    this.addLine(`Return`);
                    this.printExpression(stmt.expression);
                }
                else if (statement.stmtType === KSLangSchema_1.KSLangSchema.StatementType.Expression) {
                    const stmt = statement;
                    this.addLine(`Expression`);
                    this.printExpression(stmt.expression);
                }
                else if (statement.stmtType === KSLangSchema_1.KSLangSchema.StatementType.If) {
                    const stmt = statement;
                    this.addLine(`If`);
                    this.printExpression(stmt.condition);
                    this.addLine(`Then`);
                    this.printBlock(stmt.then);
                    this.addLine(`Else`);
                    this.printBlock(stmt.else);
                }
                else if (statement.stmtType === KSLangSchema_1.KSLangSchema.StatementType.Throw) {
                    const stmt = statement;
                    this.printExpression(stmt.expression);
                }
                else if (statement.stmtType === KSLangSchema_1.KSLangSchema.StatementType.Variable) {
                    const stmt = statement;
                    this.addLine(`Variable: ${stmt.variableName}`);
                    this.printExpression(stmt.initializer);
                }
                else if (statement.stmtType === KSLangSchema_1.KSLangSchema.StatementType.While) {
                    const stmt = statement;
                    this.addLine(`While`);
                    this.printExpression(stmt.condition);
                    this.addLine(`Body`);
                    this.printBlock(stmt.body);
                }
                else if (statement.stmtType === KSLangSchema_1.KSLangSchema.StatementType.Foreach) {
                    const stmt = statement;
                    this.addLine(`Foreach ${stmt.itemVariable.variableName}: ${stmt.itemVariable.stmtType}`);
                    this.addLine(`Items`);
                    this.printExpression(stmt.items);
                    this.addLine(`Body`);
                    this.printBlock(stmt.body);
                }
                else if (statement.stmtType === KSLangSchema_1.KSLangSchema.StatementType.For) {
                    const stmt = statement;
                    this.addLine(`For ("${stmt.itemVariable.variableName}")`);
                    this.addLine(`Condition`);
                    this.printExpression(stmt.condition);
                    this.addLine(`Incrementor`);
                    this.printExpression(stmt.incrementor);
                    this.addLine(`Body`);
                    this.printBlock(stmt.body);
                }
                else {
                    console.log(`Unknown statement type: ${statement.stmtType}`);
                    this.addLine(`${statement.stmtType} (unknown!)`);
                }
            }
            this.indent(-1);
        }
        printExpression(expression) {
            this.indent(1);
            this.add("- ");
            const addHdr = (line) => {
                this.addLine(`${line}` + (expression.valueType ? ` [${expression.valueType.repr()}]` : ""));
            };
            if (expression === null) {
                addHdr("<null>");
            }
            else if (expression.exprKind === KSLangSchema_1.KSLangSchema.ExpressionKind.Binary) {
                const expr = expression;
                addHdr(`Binary: ${expr.operator}`);
                this.printExpression(expr.left);
                this.printExpression(expr.right);
            }
            else if (expression.exprKind === KSLangSchema_1.KSLangSchema.ExpressionKind.Call) {
                const expr = expression;
                addHdr(`Call`);
                this.printExpression(expr.method);
                for (const arg of expr.arguments)
                    this.printExpression(arg);
            }
            else if (expression.exprKind === KSLangSchema_1.KSLangSchema.ExpressionKind.Conditional) {
                const expr = expression;
                addHdr(`Conditional`);
                this.printExpression(expr.condition);
                this.printExpression(expr.whenTrue);
                this.printExpression(expr.whenFalse);
            }
            else if (expression.exprKind === KSLangSchema_1.KSLangSchema.ExpressionKind.Identifier) {
                const expr = expression;
                addHdr(`Identifier: ${expr.text}`);
            }
            else if (expression.exprKind === KSLangSchema_1.KSLangSchema.ExpressionKind.New) {
                const expr = expression;
                addHdr(`New`);
                this.printExpression(expr.class);
                for (const arg of expr.arguments)
                    this.printExpression(arg);
            }
            else if (expression.exprKind === KSLangSchema_1.KSLangSchema.ExpressionKind.Literal) {
                const expr = expression;
                const value = expr.literalType === "string" ? `"${expr.value}"` : expr.value;
                addHdr(`Literal (${expr.literalType}): ${value}`);
            }
            else if (expression.exprKind === KSLangSchema_1.KSLangSchema.ExpressionKind.Parenthesized) {
                const expr = expression;
                addHdr(`Parenthesized`);
                this.printExpression(expr.expression);
            }
            else if (expression.exprKind === KSLangSchema_1.KSLangSchema.ExpressionKind.Unary) {
                const expr = expression;
                addHdr(`Unary (${expr.unaryType}): ${expr.operator}`);
                this.printExpression(expr.operand);
            }
            else if (expression.exprKind === KSLangSchema_1.KSLangSchema.ExpressionKind.PropertyAccess) {
                const expr = expression;
                addHdr(`PropertyAccess (.${expr.propertyName})`);
                this.printExpression(expr.object);
            }
            else if (expression.exprKind === KSLangSchema_1.KSLangSchema.ExpressionKind.ElementAccess) {
                const expr = expression;
                addHdr(`ElementAccess`);
                this.printExpression(expr.object);
                this.printExpression(expr.elementExpr);
            }
            else if (expression.exprKind === KSLangSchema_1.KSLangSchema.ExpressionKind.ArrayLiteral) {
                const expr = expression;
                addHdr(`ArrayLiteral`);
                for (const item of expr.items)
                    this.printExpression(item);
            }
            else {
                console.log(`Unknown expression type: ${expression.exprKind}`);
                this.addLine(`${expression.exprKind} (unknown!)`);
            }
            this.indent(-1);
        }
        generate() {
            for (const cls of this.codeGen.model.classes) {
                for (const method of cls.methods) {
                    const argList = method.parameters.map(arg => `${arg.name}: ${arg.type}`).join(", ");
                    this.addLine(`${cls.origName}::${method.origName}(${argList}): ${method.returnType}`);
                    this.printBlock(method.body);
                    this.addLine("");
                }
            }
        }
    }
});
//# sourceMappingURL=CodeGenerator.js.map