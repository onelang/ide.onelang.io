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
    class NodeManager {
        constructor(reader) {
            this.reader = reader;
            this.nodes = [];
        }
        addNode(node, start) {
            node.nodeData = { sourceRange: { start, end: this.reader.wsOffset }, destRanges: {} };
            this.nodes.push(node);
        }
        getNodeAtOffset(offset) {
            const nodes = this.nodes.filter(x => x.nodeData && x.nodeData.sourceRange.start <= offset && offset < x.nodeData.sourceRange.end)
                .sortBy(x => x.nodeData.sourceRange.end - x.nodeData.sourceRange.start);
            return nodes.length === 0 ? null : nodes[0];
        }
    }
    exports.NodeManager = NodeManager;
});
//# sourceMappingURL=NodeManager.js.map