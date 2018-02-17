(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../One/Ast", "../One/Transforms/CaseConverter", "../One/Transforms/IncludesCollector", "./OneTemplate/TemplateGenerator", "./ExprLang/ExprLangVM"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Ast_1 = require("../One/Ast");
    const CaseConverter_1 = require("../One/Transforms/CaseConverter");
    const IncludesCollector_1 = require("../One/Transforms/IncludesCollector");
    const TemplateGenerator_1 = require("./OneTemplate/TemplateGenerator");
    const ExprLangVM_1 = require("./ExprLang/ExprLangVM");
    class TempVariable {
        constructor(name, code) {
            this.name = name;
            this.code = code;
        }
    }
    class TempVarHandler {
        constructor() {
            this.prefix = "tmp";
            this.variables = [];
            this.stack = [];
            this.nextIndex = 0;
        }
        get empty() { return this.variables.length === 0; }
        get current() { return this.stack.last(); }
        create() {
            const name = `${this.prefix}${this.nextIndex++}`;
            this.stack.push(name);
            return name;
        }
        finish(code) {
            const name = this.stack.pop();
            this.variables.push(new TempVariable(name, code));
            return name;
        }
        reset() {
            const result = this.variables;
            this.stack = [];
            this.variables = [];
            return result;
        }
    }
    class CodeGeneratorModel {
        constructor(generator) {
            this.generator = generator;
            this.tempVarHandler = new TempVarHandler();
            this.includes = [];
            this.classes = [];
            this.interfaces = [];
            this.enums = [];
            this.config = { genMeta: false };
        }
        // temporary variable's name
        get result() { return this.tempVarHandler.current; }
        log(data) { console.log(`[CodeGeneratorModel] ${data}`); }
        typeName(type) {
            const cls = this.generator.classGenerators[type.className];
            const result = cls ? this.generator.call(cls.typeGenerator, [type.typeArguments.map(x => this.typeName(x)), type.typeArguments]) : this.generator.getTypeName(type);
            return result;
        }
        isIfBlock(block) {
            return block.statements && block.statements.length === 1
                && block.statements[0].stmtType === Ast_1.OneAst.StatementType.If;
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
            const cls = this.generator.lang.classes[className];
            const method = cls && (cls.methods || {})[methodName];
            // if extraArgs was used then we only accept a method with extra args and vice versa
            if (!method || (!!method.extraArgs !== !!extraArgs))
                return null;
            const extraArgValues = (method.extraArgs || []).map(extraArgName => {
                if (!extraArgs.hasOwnProperty(extraArgName))
                    throw new Error(`Extra argument '${extraArgName}' is missing!`);
                return extraArgs[extraArgName];
            });
            const stdMethod = this.generator.stdlib.classes[className].methods[methodName];
            const methodArgs = stdMethod.parameters.map(x => x.outName);
            const exprCallArgs = callExpr.arguments;
            if (methodArgs.length !== exprCallArgs.length)
                throw new Error(`Invalid argument count for '${generatorName}': expected: ${methodArgs.length}, actual: ${callExpr.arguments.length}.`);
            // TODO: move this to AST visitor
            for (let i = 0; i < callExpr.arguments.length; i++)
                callExpr.arguments[i].paramName = methodArgs[i];
            const thisArg = methodRef.thisExpr ? this.gen(methodRef.thisExpr) : null;
            const overlayFunc = this.generator.classGenerators[className].methods[methodName];
            const typeArgs = methodRef.thisExpr && methodRef.thisExpr.valueType.typeArguments.map(x => this.typeName(x));
            const code = this.generator.call(overlayFunc, [thisArg, typeArgs, ...exprCallArgs, ...extraArgValues]);
            return code;
        }
        escapeQuotes(obj) {
            if (typeof obj === "string") {
                return obj.replace(/"/g, '\\"');
            }
            else {
                for (const node of obj)
                    node.text = node.text.replace(/"/g, '\\"');
                return obj;
            }
        }
        gen(obj, ...genArgs) {
            const objExpr = obj;
            const type = obj.stmtType || objExpr.exprKind;
            const isStatement = !!obj.stmtType;
            if (type === Ast_1.OneAst.ExpressionKind.Call) {
                const callExpr = obj;
                const overlayCallCode = this.getOverlayCallCode(callExpr);
                if (overlayCallCode)
                    return overlayCallCode;
                const methodRef = callExpr.method;
                const methodArgs = methodRef.methodRef.parameters;
                if (!methodArgs)
                    throw new Error(`Method implementation is not found: ${methodRef.methodRef.metaPath} for ${this.generator.lang.extension}`);
                if (methodArgs.length !== callExpr.arguments.length)
                    throw new Error(`Invalid argument count for '${methodRef.methodRef.metaPath}': expected: ${methodArgs.length}, actual: ${callExpr.arguments.length}.`);
                // TODO: move this to AST visitor
                for (let i = 0; i < methodArgs.length; i++)
                    callExpr.arguments[i].paramName = methodArgs[i].outName;
            }
            else if (type === Ast_1.OneAst.ExpressionKind.New) {
                const callExpr = obj;
                const cls = callExpr.cls;
                const methodRef = cls.classRef.constructor;
                const methodArgs = methodRef ? methodRef.parameters : [];
                if (!methodArgs)
                    throw new Error(`Method implementation is not found: ${methodRef.metaPath} for ${this.generator.lang.extension}`);
                if (methodArgs.length !== callExpr.arguments.length)
                    throw new Error(`Invalid argument count for '${methodRef.metaPath}': expected: ${methodArgs.length}, actual: ${callExpr.arguments.length}.`);
                // TODO: move this to AST visitor
                for (let i = 0; i < methodArgs.length; i++)
                    callExpr.arguments[i].paramName = methodArgs[i].outName;
            }
            else if (type === Ast_1.OneAst.ExpressionKind.VariableReference) {
                const varRef = obj;
                if (varRef.varType === Ast_1.OneAst.VariableRefType.InstanceField) {
                    const className = varRef.thisExpr.valueType.className;
                    const fieldName = varRef.varRef.name;
                    const cls = this.generator.lang.classes[className];
                    if (cls) {
                        const func = cls.fields && cls.fields[fieldName];
                        const thisArg = varRef.thisExpr ? this.gen(varRef.thisExpr) : null;
                        const gen = (this.generator.classGenerators[className].fields || {})[fieldName];
                        //this.log(varPath);
                        if (gen) {
                            const code = this.generator.call(gen, [thisArg]);
                            return code;
                        }
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
                    if (literalExpr.literalType === "string" || literalExpr.literalType === "character") {
                        const escapedJson = JSON.stringify(literalExpr.value);
                        literalExpr.escapedText = escapedJson.substr(1, escapedJson.length - 2);
                        literalExpr.escapedTextSingle = literalExpr.escapedText.replace(/'/g, "\\'");
                    }
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
                genName = this.generator.expressionGenerators[fullName] ? fullName : unaryName;
            }
            else if (type === Ast_1.OneAst.ExpressionKind.Binary) {
                const binaryExpr = obj;
                const leftType = binaryExpr.left.valueType.repr();
                const rightType = binaryExpr.right.valueType.repr();
                const opGens = this.generator.operatorGenerators;
                const opGenMatch = Object.keys(opGens).find(opGenName => {
                    const [left, op, right] = opGenName.split(' ');
                    return binaryExpr.operator === op && (left === "any" || left === leftType) && (right === "any" || right === rightType);
                });
                if (opGenMatch)
                    return this.generator.call(opGens[opGenMatch], [binaryExpr.left, binaryExpr.right]);
                const fullName = `Binary${binaryExpr.operator}`;
                if (this.generator.expressionGenerators[fullName])
                    genName = fullName;
            }
            else if (type === Ast_1.OneAst.StatementType.VariableDeclaration) {
                const varDecl = obj;
                const initType = varDecl.initializer.exprKind;
                if (initType === Ast_1.OneAst.ExpressionKind.MapLiteral
                    && this.generator.expressionGenerators["MapLiteralDeclaration"])
                    genName = "MapLiteralDeclaration";
                else if (initType === Ast_1.OneAst.ExpressionKind.Call) {
                    const overlayCall = this.getOverlayCallCode(varDecl.initializer, { result: varDecl.outName });
                    if (overlayCall)
                        return overlayCall;
                }
            }
            if (objExpr.valueType && objExpr.valueType.typeArguments) {
                objExpr.typeArgs = objExpr.valueType.typeArguments.map(x => this.generator.getTypeName(x));
            }
            const genFunc = this.generator.expressionGenerators[genName];
            if (!genFunc)
                throw new Error(`Expression template not found: ${genName}!`);
            // TODO (hack): using global "result" and "resultType" variables
            const usingResult = genFunc.template.includes("{{result}}");
            if (usingResult)
                this.tempVarHandler.create();
            let genResult = this.generator.call(genFunc, [obj, ...genArgs]);
            if (usingResult)
                genResult = [new TemplateGenerator_1.GeneratedNode(this.tempVarHandler.finish(genResult))];
            if (!usingResult && isStatement && !this.tempVarHandler.empty) {
                const prefix = TemplateGenerator_1.TemplateGenerator.joinLines(this.tempVarHandler.reset().map(v => v.code), "\n");
                genResult = [...prefix, new TemplateGenerator_1.GeneratedNode("\n"), ...genResult];
            }
            for (const item of genResult)
                if (!item.astNode)
                    item.astNode = obj;
            return genResult;
        }
        clsName(obj) {
            const cls = (this.generator.lang.classes || {})[obj.name];
            return cls && cls.template ? cls.template : obj.outName;
        }
    }
    class CodeGenerator {
        constructor(schema, stdlib, lang) {
            this.schema = schema;
            this.stdlib = stdlib;
            this.lang = lang;
            this.model = new CodeGeneratorModel(this);
            this.templateVars = new ExprLangVM_1.VariableSource("Templates");
            this.templates = {};
            this.operatorGenerators = {};
            this.expressionGenerators = {};
            this.classGenerators = {};
            this.caseConverter = new CaseConverter_1.SchemaCaseConverter(lang.casing);
            this.setupTemplateGenerator();
            this.compileTemplates();
            this.setupEnums();
            this.setupClasses();
            this.setupIncludes();
        }
        setupTemplateGenerator() {
            const codeGenVars = new ExprLangVM_1.VariableSource("CodeGeneratorModel");
            codeGenVars.addCallback("includes", () => this.model.includes);
            codeGenVars.addCallback("classes", () => this.model.classes);
            codeGenVars.addCallback("config", () => this.model.config);
            // TODO: hack, see https://github.com/koczkatamas/onelang/issues/17
            codeGenVars.addCallback("reflectedClasses", () => this.model.classes.filter(x => x.attributes["reflect"]));
            codeGenVars.addCallback("interfaces", () => this.model.interfaces);
            codeGenVars.addCallback("enums", () => this.model.enums);
            codeGenVars.addCallback("mainBlock", () => this.schema.mainBlock);
            codeGenVars.addCallback("result", () => this.model.result);
            for (const name of ["gen", "isIfBlock", "typeName", "escapeQuotes", "clsName"])
                codeGenVars.setVariable(name, (...args) => this.model[name].apply(this.model, args));
            const varContext = new ExprLangVM_1.VariableContext([codeGenVars, this.templateVars]);
            this.templateGenerator = new TemplateGenerator_1.TemplateGenerator(varContext);
            this.templateGenerator.objectHook = obj => this.model.gen(obj);
        }
        call(method, args) {
            const callStackItem = this.templateGenerator.callStack.last();
            const varContext = callStackItem ? callStackItem.vars : this.templateGenerator.rootVars;
            return this.templateGenerator.call(method, args, this.model, varContext);
        }
        getTypeName(type) {
            if (!type)
                return "???";
            if (type.isClassOrInterface) {
                const classGen = this.model.generator.classGenerators[type.className];
                if (classGen) {
                    return this.call(classGen.typeGenerator, [type.typeArguments.map(x => this.getTypeName(x)), type.typeArguments])
                        .map(x => x.text).join("");
                }
                else {
                    let result = this.caseConverter.getName(type.className, "class");
                    if (type.typeArguments && type.typeArguments.length > 0) {
                        // TODO: make this templatable
                        result += `<${type.typeArguments.map(x => this.getTypeName(x)).join(", ")}>`;
                    }
                    return result;
                }
            }
            else if (type.isEnum) {
                return this.caseConverter.getName(type.enumName, "enum");
            }
            else if (type.isGenerics) {
                return this.lang.genericsOverride ? this.lang.genericsOverride : type.genericsName;
            }
            else {
                return this.lang.primitiveTypes ? this.lang.primitiveTypes[type.typeKind] : type.typeKind.toString();
            }
        }
        convertIdentifier(name, vars, mode) {
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
        genParameters(method) {
            return method.parameters.map((param, idx) => ({
                idx,
                name: param.outName,
                type: this.getTypeName(param.type),
                typeInfo: param.type
            }));
        }
        setupIncludes() {
            const includesCollector = new IncludesCollector_1.IncludesCollector(this.lang);
            includesCollector.process(this.schema);
            this.model.includes = Array.from(includesCollector.includes).map(name => ({ name, source: (this.lang.includeSources || {})[name] || name })).sortBy(x => x.name);
        }
        setupEnums() {
            this.model.enums = Object.values(this.schema.enums).map(enum_ => {
                return {
                    name: enum_.outName,
                    values: enum_.values.map((x, i) => ({ name: x.outName, intValue: i, origName: x.name }))
                };
            });
        }
        convertMethod(method) {
            return {
                name: method.outName,
                returnType: this.getTypeName(method.returns),
                returnTypeInfo: method.returns,
                body: method.body,
                parameters: this.genParameters(method),
                visibility: method.visibility || "public",
                static: method.static || false,
                throws: method.throws || false,
                attributes: method.attributes,
            };
        }
        setupClasses() {
            this.model.interfaces = Object.values(this.schema.interfaces).map(intf => {
                const methods = Object.values(intf.methods).map(method => this.convertMethod(method));
                return {
                    name: intf.outName,
                    methods: methods,
                    typeArguments: intf.typeArguments && intf.typeArguments.length > 0 ? intf.typeArguments : null,
                    baseInterfaces: intf.baseInterfaces,
                    baseClasses: intf.baseInterfaces,
                    attributes: intf.attributes,
                };
            });
            this.model.classes = Object.values(this.schema.classes).map(cls => {
                const methods = Object.values(cls.methods).map(method => this.convertMethod(method));
                const constructor = cls.constructor ? {
                    body: cls.constructor.body,
                    parameters: this.genParameters(cls.constructor),
                    throws: cls.constructor.throws || false
                } : null;
                const fields = Object.values(cls.fields).map(field => {
                    return {
                        name: this.caseConverter.getName(field.outName, "field"),
                        type: this.getTypeName(field.type),
                        typeInfo: field.type,
                        visibility: field.visibility || "public",
                        public: field.visibility ? field.visibility === "public" : true,
                        initializer: field.initializer,
                        static: field.static || false
                    };
                });
                return {
                    name: cls.outName,
                    methods: methods,
                    constructor,
                    typeArguments: cls.typeArguments && cls.typeArguments.length > 0 ? cls.typeArguments : null,
                    baseClass: cls.baseClass,
                    baseInterfaces: cls.baseInterfaces,
                    baseClasses: (cls.baseClass ? [cls.baseClass] : []).concat(cls.baseInterfaces),
                    attributes: cls.attributes,
                    // TODO: hack, see https://github.com/koczkatamas/onelang/issues/17
                    needsConstructor: constructor !== null || fields.some(x => x.visibility === "public" && !x.static && !!x.initializer),
                    virtualMethods: methods.filter(x => x.attributes["virtual"]),
                    publicMethods: methods.filter(x => x.visibility === "public"),
                    protectedMethods: methods.filter(x => x.visibility === "protected"),
                    privateMethods: methods.filter(x => x.visibility === "private"),
                    fields: fields,
                    instanceFields: fields.filter(x => !x.static),
                    staticFields: fields.filter(x => x.static),
                    publicFields: fields.filter(x => x.visibility === "public"),
                    protectedFields: fields.filter(x => x.visibility === "protected"),
                    privateFields: fields.filter(x => x.visibility === "private"),
                };
            });
        }
        compileTemplates() {
            for (const name of Object.keys(this.lang.expressions || {})) {
                const templateObj = this.lang.expressions[name];
                const template = typeof (templateObj) === "string" ? templateObj : templateObj.template;
                this.expressionGenerators[name.ucFirst()] = new TemplateGenerator_1.TemplateMethod(name.ucFirst(), ["expr"], template);
            }
            for (const name of Object.keys(this.lang.operators || {}))
                this.operatorGenerators[name] = new TemplateGenerator_1.TemplateMethod(name, ["left", "right"], this.lang.operators[name].template);
            for (const name of Object.keys(this.lang.templates || {})) {
                const tmplOrig = this.lang.templates[name];
                const tmplObj = typeof tmplOrig === "string" ? { template: tmplOrig, args: [] } : tmplOrig;
                if (name === "testGenerator")
                    tmplObj.args = [{ name: "class" }, { name: "method" }, { name: "methodInfo" }];
                this.templates[name] = new TemplateGenerator_1.TemplateMethod(name, tmplObj.args.map(x => x.name), tmplObj.template);
                this.templateVars.setVariable(name, this.templates[name]);
            }
            for (const clsName of Object.keys(this.lang.classes || {})) {
                const cls = this.lang.classes[clsName];
                const clsGen = this.classGenerators[clsName] = {
                    typeGenerator: new TemplateGenerator_1.TemplateMethod("typeGenerator", ["typeArgs", "typeArguments"], cls.type || clsName),
                    methods: {},
                    fields: {},
                };
                for (const methodName of Object.keys(cls.methods || [])) {
                    const funcInfo = cls.methods[methodName];
                    const stdMethod = this.stdlib.classes[clsName].methods[methodName];
                    const methodArgs = stdMethod ? stdMethod.parameters.map(x => x.outName) : [];
                    const funcArgs = ["self", "typeArgs", ...methodArgs, ...funcInfo.extraArgs || []];
                    clsGen.methods[methodName] = new TemplateGenerator_1.TemplateMethod(methodName, funcArgs, funcInfo.template);
                }
                for (const fieldName of Object.keys(cls.fields || [])) {
                    const fieldInfo = cls.fields[fieldName];
                    const stdField = this.stdlib.classes[clsName].fields[fieldName];
                    const funcArgs = ["self", "typeArgs"];
                    clsGen.fields[fieldName] = new TemplateGenerator_1.TemplateMethod(fieldName, funcArgs, fieldInfo.template);
                }
            }
        }
        generate(callTestMethod) {
            const generatedNodes = this.call(this.templates["main"], []);
            this.generatedCode = "";
            for (const tmplNode of generatedNodes || []) {
                if (tmplNode.astNode && tmplNode.astNode.nodeData) {
                    const nodeData = tmplNode.astNode.nodeData;
                    let dstRange = nodeData.destRanges[this.lang.name];
                    if (!dstRange)
                        dstRange = nodeData.destRanges[this.lang.name] = { start: this.generatedCode.length, end: -1 };
                    dstRange.end = this.generatedCode.length + tmplNode.text.length;
                }
                this.generatedCode += tmplNode.text;
            }
            if (callTestMethod) {
                const testClassName = this.caseConverter.getName("test_class", "class");
                const testMethodName = this.caseConverter.getName("test_method", "method");
                const testClass = this.model.classes.find(x => x.name === testClassName);
                if (testClass) {
                    const testMethod = testClass.methods.find(x => x.name === testMethodName);
                    this.generatedCode += "\n\n" + this.call(this.templates["testGenerator"], [testClassName, testMethodName, testMethod]).map(x => x.text).join("");
                }
            }
            return this.generatedCode;
        }
    }
    exports.CodeGenerator = CodeGenerator;
});
//# sourceMappingURL=CodeGenerator.js.map