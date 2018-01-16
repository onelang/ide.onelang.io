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
    class ParserHelper {
        static parseMapLiteral(reader, separator = ":") {
            if (!reader.readToken("{"))
                return null;
            const mapLiteral = { exprKind: "MapLiteral", properties: [] };
            if (!reader.readToken("}")) {
                do {
                    const item = {};
                    mapLiteral.properties.push(item);
                    item.name = reader.expectIdentifier("expected identifier as map key");
                    reader.expectToken(":");
                    item.initializer = parse();
                } while (reader.readToken(","));
                reader.expectToken("}");
            }
            return mapLiteral;
        }
        static parseArrayLiteral(reader) {
            if (!reader.readToken("["))
                return null;
            const arrayLiteral = { exprKind: "ArrayLiteral", items: [] };
            if (!reader.readToken("]")) {
                do {
                    const item = parse();
                    arrayLiteral.items.push(item);
                } while (reader.readToken(","));
                reader.expectToken("]");
            }
            return arrayLiteral;
        }
    }
    exports.ParserHelper = ParserHelper;
});
//# sourceMappingURL=ParserHelper.js.map