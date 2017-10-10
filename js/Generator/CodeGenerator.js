(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../One/Ast", "./TemplateCompiler", "./LangFileSchema", "./Utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Ast_1 = require("../One/Ast");
    const TemplateCompiler_1 = require("./TemplateCompiler");
    const LangFileSchema_1 = require("./LangFileSchema");
    const Utils_1 = require("./Utils");
    function tmpl(literalParts, ...values) {
        ;
        let parts = [];
        for (let i = 0; i < values.length + 1; i++) {
            parts.push({ type: "text", value: literalParts[i] });
            if (i < values.length) {
                let value = values[i];
                if (value instanceof tmpl.Block) {
                    parts.push({ type: "value", value: value.data, block: true });
                }
                else {
                    parts.push({ type: "value", value: value, block: false });
                }
            }
        }
        const isEmptyBlock = (part) => part && part.block && part.value === "";
        // filter out whitespace text part if it's between two blocks from which one is empty
        //  (so the whitespace was there to separate blocks but there is no need for separator
        //  if the block is empty)
        parts = parts.filter((part, i) => !(part.type === "text" && (isEmptyBlock(parts[i - 1]) || isEmptyBlock(parts[i + 1]))
            && /^\s*$/.test(part.value)));
        let result = "";
        for (const part of parts) {
            if (part.type === "text") {
                result += part.value;
            }
            else if (part.type === "value") {
                const prevLastLineIdx = result.lastIndexOf("\n");
                let extraPad = 0;
                while (result[prevLastLineIdx + 1 + extraPad] === " ")
                    extraPad++;
                const value = (part.value || "").toString().replace(/\n/g, "\n" + " ".repeat(extraPad));
                //if (value.includes("Dictionary") || value.includes("std::map"))
                //    debugger;
                result += value;
            }
        }
        return Utils_1.deindent(result);
    }
    (function (tmpl) {
        function Block(data) {
            if (!(this instanceof Block))
                return new Block(data);
            this.data = data;
        }
        tmpl.Block = Block;
    })(tmpl || (tmpl = {}));
    class CodeGeneratorModel {
        constructor(generator) {
            this.generator = generator;
            this.includes = [];
            this.absoluteIncludes = [];
            this.classes = [];
            this.expressionGenerators = {};
            this.internalMethodGenerators = {};
        }
        log(data) { console.log(`[CodeGeneratorModel] ${data}`); }
        typeName(type) {
            const gen = this.internalMethodGenerators[type.className];
            const result = gen ? gen.apply(this, [null, type.typeArguments.map(x => this.typeName(x))]) : this.generator.getTypeName(type);
            return result;
        }
        isIfBlock(block) {
            return block.statements && block.statements.length === 1
                && block.statements[0].stmtType === Ast_1.OneAst.StatementType.If;
        }
        // TODO: hack: understand how perl works and fix this...
        hackPerlToVar(name) {
            return name.replace(/%|@/g, '$');
        }
        getOverlayCallCode(callExpr, extraArgs) {
            const methodRef = callExpr.method;
            // TODO: I should either use metaPath or methodRef/classRef everywhere, but not hacks like this
            let metaPath = methodRef.methodRef.metaPath;
            if (!metaPath) {
                if (methodRef.methodRef.classRef)
                    metaPath = `${methodRef.methodRef.classRef.name}/${methodRef.methodRef.name}`;
                else {
                    this.log("Meta path is missing!");
                    return null;
                }
            }
            const metaPathParts = metaPath.split("/");
            const className = metaPathParts[0];
            const methodName = metaPathParts[1];
            const generatorName = `${className}.${methodName}`;
            const method = this.generator.lang.functions[generatorName];
            // if extraArgs was used then we only accept a method with extra args and vice versa
            if (!method || (!!method.extraArgs !== !!extraArgs))
                return null;
            const extraArgValues = (method.extraArgs || []).map(extraArgName => {
                if (!extraArgs.hasOwnProperty(extraArgName))
                    throw new Error(`Extra argument '${extraArgName}' is missing!`);
                return extraArgs[extraArgName];
            });
            const stdMethod = this.generator.stdlib.classes[className].methods[methodName];
            const methodArgs = stdMethod.parameters.map(x => x.name);
            const exprCallArgs = callExpr.arguments.map(x => this.gen(x));
            if (methodArgs.length !== exprCallArgs.length)
                throw new Error(`Invalid argument count for '${generatorName}': expected: ${methodArgs.length}, actual: ${callExpr.arguments.length}.`);
            // TODO: move this to AST visitor
            for (let i = 0; i < callExpr.arguments.length; i++)
                callExpr.arguments[i].paramName = methodArgs[i];
            const thisArg = methodRef.thisExpr ? this.gen(methodRef.thisExpr) : null;
            const overlayFunc = this.internalMethodGenerators[generatorName];
            const typeArgs = methodRef.thisExpr && methodRef.thisExpr.valueType.typeArguments.map(x => this.typeName(x));
            const code = overlayFunc.apply(this, [thisArg, typeArgs, ...exprCallArgs, ...extraArgValues]);
            return code;
        }
        gen(obj, ...genArgs) {
            const objExpr = obj;
            const type = obj.stmtType || objExpr.exprKind;
            if (type === Ast_1.OneAst.ExpressionKind.Call) {
                const callExpr = obj;
                const overlayCallCode = this.getOverlayCallCode(callExpr);
                if (overlayCallCode)
                    return overlayCallCode;
                const methodRef = callExpr.method;
                const methodArgs = methodRef.methodRef.parameters;
                if (!methodArgs)
                    throw new Error(`Method implementation is not found: ${methodRef.methodRef.metaPath}`);
                if (methodArgs.length !== callExpr.arguments.length)
                    throw new Error(`Invalid argument count for '${methodRef.methodRef.metaPath}': expected: ${methodArgs.length}, actual: ${callExpr.arguments.length}.`);
                // TODO: move this to AST visitor
                for (let i = 0; i < methodArgs.length; i++)
                    callExpr.arguments[i].paramName = methodArgs[i].name;
            }
            else if (type === Ast_1.OneAst.ExpressionKind.VariableReference) {
                const varRef = obj;
                if (varRef.varType === Ast_1.OneAst.VariableRefType.InstanceField) {
                    const varPath = `${varRef.thisExpr.valueType.className}.${varRef.varRef.name}`;
                    const func = this.generator.lang.functions[varPath];
                    const thisArg = varRef.thisExpr ? this.gen(varRef.thisExpr) : null;
                    const gen = this.internalMethodGenerators[varPath];
                    //this.log(varPath);
                    if (gen) {
                        const code = gen.apply(this, [thisArg]);
                        return code;
                    }
                }
            }
            let genName = type.toString();
            if (type === Ast_1.OneAst.ExpressionKind.Literal) {
                const literalExpr = obj;
                if (literalExpr.literalType === "boolean") {
                    genName = `${literalExpr.value ? "True" : "False"}Literal`;
                }
                else {
                    genName = `${literalExpr.literalType.ucFirst()}Literal`;
                }
            }
            else if (type === Ast_1.OneAst.ExpressionKind.VariableReference) {
                const varRef = obj;
                genName = `${varRef.varType}`;
            }
            else if (type === Ast_1.OneAst.ExpressionKind.MethodReference) {
                const methodRef = obj;
                genName = methodRef.thisExpr ? "InstanceMethod" : "StaticMethod";
            }
            else if (type === Ast_1.OneAst.ExpressionKind.Unary) {
                const unaryExpr = obj;
                const unaryName = unaryExpr.unaryType.ucFirst();
                const fullName = `${unaryName}${unaryExpr.operator}`;
                genName = this.expressionGenerators[fullName] ? fullName : unaryName;
            }
            else if (type === Ast_1.OneAst.StatementType.VariableDeclaration) {
                const varDecl = obj;
                const initType = varDecl.initializer.exprKind;
                if (initType === Ast_1.OneAst.ExpressionKind.MapLiteral
                    && this.expressionGenerators["MapLiteralDeclaration"])
                    genName = "MapLiteralDeclaration";
                else if (initType === Ast_1.OneAst.ExpressionKind.Call) {
                    const overlayCall = this.getOverlayCallCode(varDecl.initializer, { result: varDecl.name });
                    if (overlayCall)
                        return overlayCall;
                }
            }
            if (objExpr.valueType && objExpr.valueType.typeArguments) {
                objExpr.typeArgs = objExpr.valueType.typeArguments.map(x => this.generator.getTypeName(x));
            }
            const genFunc = this.expressionGenerators[genName];
            if (!genFunc)
                throw new Error(`Expression template not found: ${genName}!`);
            const result = genFunc.call(this, obj, ...genArgs);
            //console.log("generate statement", obj, result);
            return result;
        }
        main() { return null; }
        testGenerator(cls, method) { return null; }
    }
    class CodeGenerator {
        constructor(schema, stdlib, lang) {
            this.schema = schema;
            this.stdlib = stdlib;
            this.lang = lang;
            this.model = new CodeGeneratorModel(this);
            this.setupClasses();
            this.setupIncludes();
            this.compileTemplates();
        }
        getName(name, type) {
            const casing = this.lang.casing[type === "enum" ? "class" : type];
            const parts = name.split("_").map(x => x.toLowerCase());
            if (casing === LangFileSchema_1.LangFileSchema.Casing.CamelCase)
                return parts[0] + parts.splice(1).map(x => x.ucFirst()).join("");
            else if (casing === LangFileSchema_1.LangFileSchema.Casing.PascalCase)
                return parts.map(x => x.ucFirst()).join("");
            else if (casing === LangFileSchema_1.LangFileSchema.Casing.SnakeCase)
                return parts.join("_");
            else
                throw new Error(`Unknown casing: ${casing}`);
        }
        getTypeName(type) {
            if (type.typeKind === Ast_1.OneAst.TypeKind.Class)
                return this.getName(type.className, "class");
            else
                return this.lang.primitiveTypes ? this.lang.primitiveTypes[type.typeKind] : type.typeKind.toString();
        }
        convertIdentifier(origName, vars, mode) {
            const name = origName === "class" ? "cls" : origName;
            const isLocalVar = vars.includes(name);
            const knownKeyword = ["true", "false"].includes(name);
            return `${isLocalVar || mode === "declaration" || mode === "field" || knownKeyword ? "" : "this."}${name}`;
        }
        getMethodPath(method) {
            let parts = [];
            let currExpr = method;
            while (true) {
                if (currExpr.exprKind === Ast_1.OneAst.ExpressionKind.PropertyAccess) {
                    const propAcc = currExpr;
                    parts.push(propAcc.propertyName);
                    currExpr = propAcc.object;
                }
                else if (currExpr.exprKind === Ast_1.OneAst.ExpressionKind.Identifier) {
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
            const tmplCodeLines = tmpl.templateToJS(tmpl.treeRoot, args).split("\n");
            const tmplCode = tmplCodeLines.length > 1 ? tmplCodeLines.map(x => `\n    ${x}`).join("") : tmplCodeLines[0];
            return `return tmpl\`${tmplCode}\`;`;
        }
        setupNames() {
            for (const enumName of Object.keys(this.schema.enums)) {
                const enumObj = this.schema.enums[enumName];
                enumObj.name = this.getName(enumName, "enum");
            }
            for (const className of Object.keys(this.schema.classes)) {
                const cls = this.schema.classes[className];
                cls.name = this.getName(className, "class");
                for (const methodName of Object.keys(cls.methods)) {
                    const method = cls.methods[methodName];
                    method.name = this.getName(methodName, "method");
                }
            }
        }
        setupClasses() {
            this.model.classes = Object.values(this.schema.classes).map(cls => {
                const methods = Object.values(cls.methods).map(method => {
                    return {
                        name: method.name,
                        returnType: this.getTypeName(method.returns),
                        body: method.body,
                        parameters: method.parameters.map((param, idx) => {
                            return {
                                idx,
                                name: param.name,
                                type: this.getTypeName(param.type)
                            };
                        }),
                        visibility: method.visibility || "public"
                    };
                });
                const fields = Object.values(cls.fields).map(field => {
                    return {
                        name: field.name,
                        type: this.getTypeName(field.type),
                        typeInfo: field.type,
                        visibility: field.visibility || "public"
                    };
                });
                return {
                    name: cls.name,
                    methods: methods,
                    publicMethods: methods.filter(x => x.visibility === "public"),
                    protectedMethods: methods.filter(x => x.visibility === "protected"),
                    privateMethods: methods.filter(x => x.visibility === "private"),
                    fields: fields,
                    publicFields: fields.filter(x => x.visibility === "public"),
                    protectedFields: fields.filter(x => x.visibility === "protected"),
                    privateFields: fields.filter(x => x.visibility === "private"),
                };
            });
        }
        setupIncludes() {
            const includes = {};
            for (const func of Object.values(this.lang.functions))
                for (const include of func.includes || [])
                    includes[include] = true;
            this.model.includes.push(...Object.keys(includes));
        }
        genTemplateMethodCode(name, args, template) {
            const newName = /^[a-z]+$/.test(name) ? name : `"${name}"`;
            return tmpl `
            ${newName}(${[...args, "...args"].join(", ")}) {
                ${this.genTemplate(template, [...args, "args"])}
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
                const funcPathParts = funcPath.split(".");
                const className = funcPathParts[0];
                const methodName = funcPathParts[1];
                const stdMethod = this.stdlib.classes[className].methods[methodName];
                const methodArgs = stdMethod ? stdMethod.parameters.map(x => x.name) : [];
                const funcArgs = ["self", "typeArgs", ...methodArgs, ...funcInfo.extraArgs || []];
                return this.genTemplateMethodCode(funcPath, funcArgs, funcInfo.template);
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
            this.generatedCode = this.model.main();
            if (callTestMethod)
                this.generatedCode += "\n\n" + this.model.testGenerator(this.getName("test_class", "class"), this.getName("test_method", "method"));
            this.generatedCode = this.generatedCode.replace(/\{space\}/g, " ");
            return this.generatedCode;
        }
    }
    exports.CodeGenerator = CodeGenerator;
});
//# sourceMappingURL=CodeGenerator.js.map