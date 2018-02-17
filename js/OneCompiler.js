(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Parsers/TypeScriptParser2", "./One/SchemaTransformer", "./One/Transforms/FillNameTransform", "./One/Transforms/FillParentTransform", "./One/Transforms/FillMetaPathTransform", "./One/Transforms/ResolveIdentifiersTransform", "./One/Transforms/InferTypesTransform", "./One/Transforms/InlineOverlayTypesTransform", "./One/Transforms/ConvertInlineThisRefTransform", "./One/Transforms/InferCharacterTypes", "./One/SchemaContext", "./One/OverviewGenerator", "./One/AstHelper", "./One/Transforms/CaseConverter", "./Generator/CodeGenerator", "./One/Transforms/FillVariableMutability", "./One/Transforms/TriviaCommentTransform", "./One/Transforms/GenericTransformer", "./One/Transforms/FillThrowsTransform", "./One/Transforms/RemoveEmptyTemplateStringLiterals", "./One/Transforms/FixGenericAndEnumTypes", "./Parsers/CSharpParser", "./Parsers/RubyParser", "./One/Transforms/ExtractCommentAttributes", "./Parsers/PhpParser", "./One/Transforms/ForceTemplateStrings", "./One/Transforms/WhileToFor", "./One/Transforms/ProcessTypeHints"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const TypeScriptParser2_1 = require("./Parsers/TypeScriptParser2");
    const SchemaTransformer_1 = require("./One/SchemaTransformer");
    const FillNameTransform_1 = require("./One/Transforms/FillNameTransform");
    const FillParentTransform_1 = require("./One/Transforms/FillParentTransform");
    const FillMetaPathTransform_1 = require("./One/Transforms/FillMetaPathTransform");
    const ResolveIdentifiersTransform_1 = require("./One/Transforms/ResolveIdentifiersTransform");
    const InferTypesTransform_1 = require("./One/Transforms/InferTypesTransform");
    const InlineOverlayTypesTransform_1 = require("./One/Transforms/InlineOverlayTypesTransform");
    const ConvertInlineThisRefTransform_1 = require("./One/Transforms/ConvertInlineThisRefTransform");
    const InferCharacterTypes_1 = require("./One/Transforms/InferCharacterTypes");
    const SchemaContext_1 = require("./One/SchemaContext");
    const OverviewGenerator_1 = require("./One/OverviewGenerator");
    const AstHelper_1 = require("./One/AstHelper");
    const CaseConverter_1 = require("./One/Transforms/CaseConverter");
    const CodeGenerator_1 = require("./Generator/CodeGenerator");
    const FillVariableMutability_1 = require("./One/Transforms/FillVariableMutability");
    const TriviaCommentTransform_1 = require("./One/Transforms/TriviaCommentTransform");
    const GenericTransformer_1 = require("./One/Transforms/GenericTransformer");
    const FillThrowsTransform_1 = require("./One/Transforms/FillThrowsTransform");
    const RemoveEmptyTemplateStringLiterals_1 = require("./One/Transforms/RemoveEmptyTemplateStringLiterals");
    const FixGenericAndEnumTypes_1 = require("./One/Transforms/FixGenericAndEnumTypes");
    const CSharpParser_1 = require("./Parsers/CSharpParser");
    const RubyParser_1 = require("./Parsers/RubyParser");
    const ExtractCommentAttributes_1 = require("./One/Transforms/ExtractCommentAttributes");
    const PhpParser_1 = require("./Parsers/PhpParser");
    const ForceTemplateStrings_1 = require("./One/Transforms/ForceTemplateStrings");
    const WhileToFor_1 = require("./One/Transforms/WhileToFor");
    const ProcessTypeHints_1 = require("./One/Transforms/ProcessTypeHints");
    SchemaTransformer_1.SchemaTransformer.instance.addTransform(new FillNameTransform_1.FillNameTransform());
    SchemaTransformer_1.SchemaTransformer.instance.addTransform(new FillParentTransform_1.FillParentTransform());
    SchemaTransformer_1.SchemaTransformer.instance.addTransform(new FillMetaPathTransform_1.FillMetaPathTransform());
    SchemaTransformer_1.SchemaTransformer.instance.addTransform(new InlineOverlayTypesTransform_1.InlineOverlayTypesTransform());
    SchemaTransformer_1.SchemaTransformer.instance.addTransform(new ConvertInlineThisRefTransform_1.ConvertInlineThisRefTransform());
    SchemaTransformer_1.SchemaTransformer.instance.addTransform(new TriviaCommentTransform_1.TriviaCommentTransform());
    SchemaTransformer_1.SchemaTransformer.instance.addTransform(new InferCharacterTypes_1.InferCharacterTypes());
    class OneCompiler {
        /**
         * Schema types:
         *  - program: the input program to be compiled into another language
         *  - overlay: helper classes which map the input language's built-in methods / properties to OneLang methods (eg. Object.keys(map) -> map.keys())
         *  - stdlib: declaration (not implementation!) of OneLang methods (eg. map.keys) which are implemented in every language separately
         */
        parse(langName, programCode, overlayCode, stdlibCode, genericTransformerYaml) {
            this.langName = langName;
            let arrayName;
            if (langName === "typescript") {
                overlayCode = overlayCode.replace(/^[^\n]*<reference.*stdlib.d.ts[^\n]*\n/, "");
                this.parser = new TypeScriptParser2_1.TypeScriptParser2(programCode);
            }
            else if (langName === "csharp") {
                this.parser = new CSharpParser_1.CSharpParser(programCode);
            }
            else if (langName === "ruby") {
                this.parser = new RubyParser_1.RubyParser(programCode);
            }
            else if (langName === "php") {
                this.parser = new PhpParser_1.PhpParser(programCode);
            }
            else {
                throw new Error(`[OneCompiler] Unsupported language: ${langName}`);
            }
            const schema = this.parser.parse();
            const overlaySchema = TypeScriptParser2_1.TypeScriptParser2.parseFile(overlayCode);
            const stdlibSchema = TypeScriptParser2_1.TypeScriptParser2.parseFile(stdlibCode);
            this.genericTransformer = new GenericTransformer_1.GenericTransformer(YAML.parse(genericTransformerYaml), schema.langData.langId);
            // TODO: hack
            overlaySchema.classes[this.parser.langData.literalClassNames.array].meta = { iterable: true };
            stdlibSchema.classes["OneArray"].meta = { iterable: true };
            stdlibSchema.classes["OneError"].methods["raise"].throws = true;
            this.prepareSchemas(schema, overlaySchema, stdlibSchema);
        }
        saveSchemaState(schemaCtx, name) {
            if (!this.saveSchemaStateCallback)
                return;
            const schemaOverview = new OverviewGenerator_1.OverviewGenerator().generate(schemaCtx);
            this.saveSchemaStateCallback("overviewText", schemaCtx.schema.sourceType, name, schemaOverview);
            const schemaJson = AstHelper_1.AstHelper.toJson(schemaCtx.schema);
            this.saveSchemaStateCallback("schemaJson", schemaCtx.schema.sourceType, name, schemaJson);
        }
        prepareSchemas(schema, overlaySchema, stdlibSchema) {
            schema.sourceType = "program";
            overlaySchema.sourceType = "overlay";
            stdlibSchema.sourceType = "stdlib";
            this.stdlibCtx = new SchemaContext_1.SchemaContext(stdlibSchema, "stdlib");
            new FixGenericAndEnumTypes_1.FixGenericAndEnumTypes().process(this.stdlibCtx.schema);
            this.saveSchemaState(this.stdlibCtx, "0_Original");
            this.stdlibCtx.ensureTransforms("fillName", "fillMetaPath", "fillParent");
            ResolveIdentifiersTransform_1.ResolveIdentifiersTransform.transform(this.stdlibCtx);
            new InferTypesTransform_1.InferTypesTransform(this.stdlibCtx).transform();
            this.saveSchemaState(this.stdlibCtx, "0_Converted");
            this.overlayCtx = new SchemaContext_1.SchemaContext(overlaySchema, "overlay");
            this.overlayCtx.addDependencySchema(this.stdlibCtx);
            new FixGenericAndEnumTypes_1.FixGenericAndEnumTypes().process(this.overlayCtx.schema);
            this.saveSchemaState(this.overlayCtx, "0_Original");
            this.overlayCtx.ensureTransforms("fillName", "fillMetaPath", "fillParent");
            ResolveIdentifiersTransform_1.ResolveIdentifiersTransform.transform(this.overlayCtx);
            new InferTypesTransform_1.InferTypesTransform(this.overlayCtx).transform();
            this.overlayCtx.ensureTransforms("convertInlineThisRef");
            this.saveSchemaState(this.overlayCtx, "1_Converted");
            this.schemaCtx = new SchemaContext_1.SchemaContext(schema, "program");
            // TODO: move to somewhere else...
            this.schemaCtx.arrayType = this.parser.langData.literalClassNames.array;
            this.schemaCtx.mapType = this.parser.langData.literalClassNames.map;
            new RemoveEmptyTemplateStringLiterals_1.RemoveEmptyTemplateStringLiterals().process(this.schemaCtx.schema);
            new FixGenericAndEnumTypes_1.FixGenericAndEnumTypes().process(this.schemaCtx.schema);
            new ExtractCommentAttributes_1.ExtractCommentAttributes().process(this.schemaCtx.schema);
            this.saveSchemaState(this.schemaCtx, `0_Original`);
            this.genericTransformer.process(this.schemaCtx.schema);
            this.saveSchemaState(this.schemaCtx, `1_GenericTransforms`);
            this.schemaCtx.addDependencySchema(this.overlayCtx);
            this.schemaCtx.addDependencySchema(this.stdlibCtx);
            this.schemaCtx.ensureTransforms("fillName", "fillMetaPath", "fillParent");
            ResolveIdentifiersTransform_1.ResolveIdentifiersTransform.transform(this.schemaCtx);
            new InferTypesTransform_1.InferTypesTransform(this.schemaCtx).transform();
            this.saveSchemaState(this.schemaCtx, `2_TypesInferred`);
            this.schemaCtx.ensureTransforms("inlineOverlayTypes");
            this.saveSchemaState(this.schemaCtx, `3_OverlayTypesInlined`);
            this.schemaCtx.ensureTransforms("triviaComment");
            this.saveSchemaState(this.schemaCtx, `4_ExtendedInfoAdded`);
            this.schemaCtx.arrayType = "OneArray";
            this.schemaCtx.mapType = "OneMap";
            global["debugOn"] = true;
            new InferTypesTransform_1.InferTypesTransform(this.schemaCtx).transform();
            this.schemaCtx.ensureTransforms("inferCharacterTypes");
            this.saveSchemaState(this.schemaCtx, `5_TypesInferredAgain`);
            if (!this.schemaCtx.schema.langData.supportsTemplateStrings)
                new ForceTemplateStrings_1.ForceTemplateStrings().transform(this.schemaCtx);
            if (!this.schemaCtx.schema.langData.supportsFor)
                new WhileToFor_1.WhileToForTransform().transform(this.schemaCtx);
            new ProcessTypeHints_1.ProcessTypeHints().transform(this.schemaCtx);
            this.saveSchemaState(this.schemaCtx, `6_PostProcess`);
        }
        preprocessLangFile(lang) {
            for (const opDesc of Object.keys(lang.operators || {})) {
                let opData = lang.operators[opDesc];
                if (typeof opData === "string")
                    opData = lang.operators[opDesc] = { template: opData };
                const opDescParts = opDesc.split(" ").filter(x => x !== "");
                if (opDescParts.length === 3)
                    [opData.leftType, opData.operator, opData.rightType] = opDescParts;
            }
            for (const classDesc of Object.values(lang.classes || {})) {
                for (const methodName of Object.keys(classDesc.methods || {})) {
                    if (typeof classDesc.methods[methodName] === "string")
                        classDesc.methods[methodName] = { template: classDesc.methods[methodName] };
                }
            }
        }
        getCodeGenerator(langCode, langName) {
            const lang = YAML.parse(langCode);
            lang.name = langName;
            this.preprocessLangFile(lang);
            new CaseConverter_1.SchemaCaseConverter(lang.casing).process(this.schemaCtx.schema);
            new CaseConverter_1.SchemaCaseConverter(lang.casing).process(this.stdlibCtx.schema);
            new FillVariableMutability_1.FillVariableMutability(lang).process(this.schemaCtx.schema);
            new FillThrowsTransform_1.FillThrowsTransform(lang).process(this.schemaCtx.schema);
            this.saveSchemaState(this.schemaCtx, `10_${langName ? `${langName}_` : ""}Init`);
            const codeGen = new CodeGenerator_1.CodeGenerator(this.schemaCtx.schema, this.stdlibCtx.schema, lang);
            return codeGen;
        }
        compile(langCode, langName, callTestMethod = true, genMeta = false) {
            const codeGen = this.getCodeGenerator(langCode, langName);
            codeGen.model.config.genMeta = genMeta;
            const generatedCode = codeGen.generate(callTestMethod);
            return generatedCode;
        }
    }
    exports.OneCompiler = OneCompiler;
});
//# sourceMappingURL=OneCompiler.js.map