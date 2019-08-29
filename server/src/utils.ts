import * as path from 'path';

import {
	Location,
	Position,
	SymbolKind
} from 'vscode-languageserver';

export function isWindows(): boolean {
	return /^win/.test(process.platform);
}
export function uriToPath(uri: string): string {
	const p = path.resolve(uri.replace(/file:\/\/\//, ''));
	return isWindows() ? p.replace(/\//g, '\\') : p;
}

export function pathToUri(p: string): string {
	return 'file://' + (isWindows() ? '/' + p.replace(/\//g, '/') : p);
}

export const symbolKindsMapping: { [name: string]: SymbolKind } = {
	'enum member': SymbolKind.Constant,
	'JSX attribute': SymbolKind.Property,
	'local class': SymbolKind.Class,
	'local function': SymbolKind.Function,
	'local var': SymbolKind.Variable,
	'type parameter': SymbolKind.Variable,
	alias: SymbolKind.Variable,
	class: SymbolKind.Class,
	const: SymbolKind.Constant,
	constructor: SymbolKind.Constructor,
	enum: SymbolKind.Enum,
	field: SymbolKind.Field,
	file: SymbolKind.File,
	function: SymbolKind.Function,
	getter: SymbolKind.Method,
	interface: SymbolKind.Interface,
	let: SymbolKind.Variable,
	method: SymbolKind.Method,
	module: SymbolKind.Module,
	parameter: SymbolKind.Variable,
	property: SymbolKind.Property,
	setter: SymbolKind.Method,
	var: SymbolKind.Variable
};
