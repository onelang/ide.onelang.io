(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Parsers/TypeScriptParser", "./One/SchemaTransformer", "./One/Transforms/FillNameTransform", "./One/Transforms/FillParentTransform", "./One/Transforms/FillMetaPathTransform", "./One/Transforms/ResolveIdentifiersTransform", "./One/Transforms/InferTypesTransform", "./One/Transforms/InlineOverlayTypesTransform", "./One/Transforms/ConvertInlineThisRefTransform", "./One/SchemaContext", "./One/OverviewGenerator", "./One/AstHelper", "./One/Transforms/CaseConverter", "./Generator/CodeGenerator", "./One/Transforms/FillVariableMutability", "./One/Transforms/TriviaCommentTransform", "./One/Transforms/GenericTransformer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const TypeScriptParser_1 = require("./Parsers/TypeScriptParser");
    const SchemaTransformer_1 = require("./One/SchemaTransformer");
    const FillNameTransform_1 = require("./One/Transforms/FillNameTransform");
    const FillParentTransform_1 = require("./One/Transforms/FillParentTransform");
    const FillMetaPathTransform_1 = require("./One/Transforms/FillMetaPathTransform");
    const ResolveIdentifiersTransform_1 = require("./One/Transforms/ResolveIdentifiersTransform");
    const InferTypesTransform_1 = require("./One/Transforms/InferTypesTransform");
    const InlineOverlayTypesTransform_1 = require("./One/Transforms/InlineOverlayTypesTransform");
    const ConvertInlineThisRefTransform_1 = require("./One/Transforms/ConvertInlineThisRefTransform");
    const SchemaContext_1 = require("./One/SchemaContext");
    const OverviewGenerator_1 = require("./One/OverviewGenerator");
    const AstHelper_1 = require("./One/AstHelper");
    const CaseConverter_1 = require("./One/Transforms/CaseConverter");
    const CodeGenerator_1 = require("./Generator/CodeGenerator");
    const FillVariableMutability_1 = require("./One/Transforms/FillVariableMutability");
    const TriviaCommentTransform_1 = require("./One/Transforms/TriviaCommentTransform");
    const GenericTransformer_1 = require("./One/Transforms/GenericTransformer");
    SchemaTransformer_1.SchemaTransformer.instance.addTransform(new FillNameTransform_1.FillNameTransform());
    SchemaTransformer_1.SchemaTransformer.instance.addTransform(new FillParentTransform_1.FillParentTransform());
    SchemaTransformer_1.SchemaTransformer.instance.addTransform(new FillMetaPathTransform_1.FillMetaPathTransform());
    SchemaTransformer_1.SchemaTransformer.instance.addTransform(new ResolveIdentifiersTransform_1.ResolveIdentifiersTransform());
    SchemaTransformer_1.SchemaTransformer.instance.addTransform(new InferTypesTransform_1.InferTypesTransform());
    SchemaTransformer_1.SchemaTransformer.instance.addTransform(new InlineOverlayTypesTransform_1.InlineOverlayTypesTransform());
    SchemaTransformer_1.SchemaTransformer.instance.addTransform(new ConvertInlineThisRefTransform_1.ConvertInlineThisRefTransform());
    SchemaTransformer_1.SchemaTransformer.instance.addTransform(new TriviaCommentTransform_1.TriviaCommentTransform());
    class OneCompiler {
        parseFromTS(programCode, overlayCode, stdlibCode, genericTransformerYaml) {
            overlayCode = overlayCode.replace(/^[^\n]*<reference.*stdlib.d.ts[^\n]*\n/, "");
            const schema = TypeScriptParser_1.TypeScriptParser.parseFile(programCode);
            const overlaySchema = TypeScriptParser_1.TypeScriptParser.parseFile(overlayCode);
            const stdlibSchema = TypeScriptParser_1.TypeScriptParser.parseFile(stdlibCode);
            this.genericTransformer = new GenericTransformer_1.GenericTransformer(YAML.parse(genericTransformerYaml));
            // TODO: hack
            overlaySchema.classes["TsArray"].meta = { iterable: true };
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
            this.stdlibCtx = new SchemaContext_1.SchemaContext(stdlibSchema);
            this.saveSchemaState(this.stdlibCtx, "0_Original");
            this.stdlibCtx.ensureTransforms("fillMetaPath", "inferTypes");
            this.saveSchemaState(this.stdlibCtx, "0_Converted");
            this.overlayCtx = new SchemaContext_1.SchemaContext(overlaySchema);
            this.overlayCtx.addDependencySchema(stdlibSchema, "stdlib");
            this.saveSchemaState(this.overlayCtx, "0_Original");
            this.overlayCtx.ensureTransforms("convertInlineThisRef", "fillMetaPath");
            this.saveSchemaState(this.overlayCtx, "1_Converted");
            this.schemaCtx = new SchemaContext_1.SchemaContext(schema);
            // TODO: move to somewhere else...
            this.schemaCtx.arrayType = "TsArray";
            this.schemaCtx.mapType = "TsMap";
            this.saveSchemaState(this.schemaCtx, `0_Original`);
            this.genericTransformer.process(this.schemaCtx.schema);
            this.saveSchemaState(this.schemaCtx, `1_GenericTransforms`);
            this.schemaCtx.addDependencySchema(overlaySchema, "overlay");
            this.schemaCtx.addDependencySchema(stdlibSchema, "stdlib");
            this.schemaCtx.ensureTransforms("inferTypes");
            this.saveSchemaState(this.schemaCtx, `2_TypesInferred`);
            this.schemaCtx.ensureTransforms("inlineOverlayTypes");
            this.saveSchemaState(this.schemaCtx, `3_OverlayTypesInlined`);
            this.schemaCtx.ensureTransforms("triviaComment");
            this.saveSchemaState(this.schemaCtx, `4_ExtendedInfoAdded`);
            // TODO: looks like as a giantic hack...
            this.schemaCtx.schema.meta.transforms["inferTypes"] = false;
            this.schemaCtx.arrayType = "OneArray";
            this.schemaCtx.mapType = "OneMap";
            this.schemaCtx.ensureTransforms("inferTypes");
            this.saveSchemaState(this.schemaCtx, `5_TypesInferredAgain`);
        }
        getCodeGenerator(langCode, langName) {
            const lang = YAML.parse(langCode.replace(/\\ /g, "{space}"));
            new CaseConverter_1.CaseConverter(lang.casing).process(this.schemaCtx.schema);
            new FillVariableMutability_1.FillVariableMutability(lang).process(this.schemaCtx.schema);
            this.saveSchemaState(this.schemaCtx, `10_${langName ? `${langName}_` : ""}Init`);
            const codeGen = new CodeGenerator_1.CodeGenerator(this.schemaCtx.schema, this.stdlibCtx.schema, lang);
            return codeGen;
        }
        compile(langCode, langName, callTestMethod = true) {
            const codeGen = this.getCodeGenerator(langCode, langName);
            const generatedCode = codeGen.generate(callTestMethod);
            return generatedCode;
        }
    }
    exports.OneCompiler = OneCompiler;
});
//# sourceMappingURL=OneCompiler.js.map