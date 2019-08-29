"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode_languageserver_1 = require("vscode-languageserver");
function isWindows() {
    return /^win/.test(process.platform);
}
exports.isWindows = isWindows;
function uriToPath(uri) {
    const p = path.resolve(uri.replace(/file:\/\/\//, ''));
    return isWindows() ? p.replace(/\//g, '\\') : p;
}
exports.uriToPath = uriToPath;
function pathToUri(p) {
    return 'file://' + (isWindows() ? '/' + p.replace(/\//g, '/') : p);
}
exports.pathToUri = pathToUri;
exports.symbolKindsMapping = {
    'enum member': vscode_languageserver_1.SymbolKind.Constant,
    'JSX attribute': vscode_languageserver_1.SymbolKind.Property,
    'local class': vscode_languageserver_1.SymbolKind.Class,
    'local function': vscode_languageserver_1.SymbolKind.Function,
    'local var': vscode_languageserver_1.SymbolKind.Variable,
    'type parameter': vscode_languageserver_1.SymbolKind.Variable,
    alias: vscode_languageserver_1.SymbolKind.Variable,
    class: vscode_languageserver_1.SymbolKind.Class,
    const: vscode_languageserver_1.SymbolKind.Constant,
    constructor: vscode_languageserver_1.SymbolKind.Constructor,
    enum: vscode_languageserver_1.SymbolKind.Enum,
    field: vscode_languageserver_1.SymbolKind.Field,
    file: vscode_languageserver_1.SymbolKind.File,
    function: vscode_languageserver_1.SymbolKind.Function,
    getter: vscode_languageserver_1.SymbolKind.Method,
    interface: vscode_languageserver_1.SymbolKind.Interface,
    let: vscode_languageserver_1.SymbolKind.Variable,
    method: vscode_languageserver_1.SymbolKind.Method,
    module: vscode_languageserver_1.SymbolKind.Module,
    parameter: vscode_languageserver_1.SymbolKind.Variable,
    property: vscode_languageserver_1.SymbolKind.Property,
    setter: vscode_languageserver_1.SymbolKind.Method,
    var: vscode_languageserver_1.SymbolKind.Variable
};
//# sourceMappingURL=utils.js.map