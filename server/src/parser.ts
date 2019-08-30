import * as vscode from 'vscode-languageserver';

// instruction mode (default), DBField mode. string mode
const PARSE_INSTRUCTION = 1;
const PARSE_DBFIELD = 2;
const PARSE_STRING = 3;

//export function ParseDocument(document: vscode.TextDocument, token: vscode.CancellationToken): ParseItem[] {
export function ParseDocument(document: vscode.TextDocument): MySymbol[] {
	// this stores all the symbols we create
	const symbols: ParseItem[] = [];
	const mysyms: MySymbol[] = [];

	let parseStatus = new ParseStatus();
	//array of already found symbols (strings, DB fields), that should be checked to see if new (eg) variable is inside or not


	//make heading symbols (bit of a bodge but expermient)

	// Parse the document, line by line


	for (let i = 0; i < document.lineCount; i++) {
		let oneline = document.getText(vscode.Range.create(i, -1, i, Number.MAX_VALUE));

		// 1 - Exclude comment lines
		if (oneline[0] === '#') {
			continue;
		}

		// 2 - find STRINGS. store start and end in mysms array for later
		var oneString: [number, number] = findSymbol(oneline, '"');
		if ((oneString[0] !== -1 && oneString[1] !== -1)) {

			//make a MySymbol to record the range of strings for exclusion from other searches
			//TODO
			// 
			//let symName:string = 'string: ' + (i+1).toString();
			let symName: string = oneline.substr(oneString[0], oneString[1] - oneString[0] + 1);
			let resultItem = new ParseItem(symName, vscode.SymbolKind.String);
			resultItem.line = i;
			resultItem.container = "STRINGS:";

			symbols.push(resultItem);

			//add on a start and end postition to form a MySymbol
			let onesym: MySymbol = new MySymbol(resultItem, oneString[0], oneString[1]);
			mysyms.push(onesym);
		}
		// 3- DB fields
		// find DB fields like you do with strings,  
		var oneDB: [number, number] = findSymbol(oneline, '{', '}');
		if (oneDB[0] !== -1 && oneDB[1] !== -1) {


			// check if this is inside an existing  symbol
			var inside: boolean = false;
			check: for (var symb of mysyms) {
				if (symb.withinField(i,oneDB[0])) {
					inside = true;
					break check;
				}
			}
			if (!inside) {
				let symName: string = oneline.substr(oneDB[0], oneDB[1] - oneDB[0] + 1);
				let resultSymbol = new ParseItem(symName, vscode.SymbolKind.Field);
				resultSymbol.line = i;
				resultSymbol.container = "DB FIELDS:";
				symbols.push(resultSymbol);

				// also addit to mysms array
				let onesym: MySymbol = new MySymbol(resultSymbol, oneDB[0], oneDB[1]);
				mysyms.push(onesym);
			}
		}

	}
	// 4 - everything else - split line into words delimited by non-ascii characters excluding {}"
	//if the word is in the keywords list, then ignore,
	// otherwise, word is a variable - make into symbol


	return mysyms;
}
// find all strings (a string may want to display a field name or curly braces)
// find all db fields that aren't in strings
// find all other words by delim, if it's not a keyword, then it's a variable

// 2 - find all db fields. store as item with symbol. Extend class to include start and end position
// function findblock (line, delim): returns item or null
// find start brace. find end brace - everything inbetween is classed as a DBfield
// if we reach end of string before then item is not classed as field

// find all STRINGS
//find start quote, 

// 3 - find all variables
// what is a variable - it's all other text not inside a DBfield, delimited by (){}\s,

//function get word:
//for each string.split(bydelim)
//start = current pointer
//end = string.length

//if it is a KEYWORD then ignore
//if it is inside a DB field then ignore
//otherwise it's a variable

//set start = end (+1?)
//


// constants?


// 3 - 
// FOR EACH WORD (split by space or bracket/curlybracet/comma)
// word delimiters: (){},whitespace
// string.split("\\P{Alpha}")

// if it's a keyword, ignore it

//if we are in DB field mode, check for field end

//if we are in string mode, check for string end

// 2 - DB Fields


// search for opening brace
// search for closing brace...
// if closing brace then mark as DB field


// 3 - keywords (any way to link this to languagefile?)

// 4 - 


function findSymbol(pLine: string, pDelimOpen: string, pDelimClose?: string): [number, number] {
	// returns start and end position of string in a line
	let i: number = 0;
	let nStart: number = -1;
	let nEnd: number = -1;
	var pClose: string;

	if (typeof pDelimClose === 'undefined') {
		pClose = pDelimOpen;
	} else {
		pClose = pDelimClose;
	}
	let startFound: boolean = false;

	for (const c of pLine) {
		if ((c == pDelimOpen && !startFound) || (c == pClose && startFound)) {
			if (!startFound) {
				nStart = i;
				startFound = true;
			} else {
				nEnd = i;
				return ([nStart, nEnd]);
			}
		}
		i++;
	}
	return [nStart, nEnd];
}
// store information about the parse state
class ParseStatus {
	public parseMode: number;
	public parseDepth: number;
	public parseString: string;

	public stringQuote: string;

	public instructionString: string;
	public instructionStartLine: number;

	constructor() {
		this.parseMode = PARSE_INSTRUCTION;
		this.parseDepth = 0;
		this.parseString = '';
		this.stringQuote = '';
		this.instructionString = '';
		this.instructionStartLine = 0;
	}
}

// Store Information about the Parsed Object
// tslint:disable-next-line: max-classes-per-file

export class MySymbol {

	//contains ParseItem to create SymbolItem from, and also the found start and end character positions
	// to detect whether we are inside an existing symbol or not (eg comment or DB field) 
	// could later be extended to pass out to calling server for creating symbol including range
	public parseItem: ParseItem;
	public start: number;
	public end: number;


	constructor(pItem: ParseItem, pStart?: number, pEnd?: number) {
		if (typeof pStart === 'undefined') {
			this.start = 0;
		} else {
			this.start = pStart;
		}
		if (typeof pEnd === 'undefined') {
			this.end = 0;
		} else {
			this.end = pEnd;
		}
		this.parseItem = pItem;
	}

	withinField(pLine: number, pPosition: number): boolean {
		if (this.parseItem.line == pLine) {
			if (pPosition >= this.start && pPosition <= this.end) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}
}

export class ParseItem {
	public name: string;
	public line: number;
	public type: vscode.SymbolKind;
	public container: string;


	constructor(pName: string, pType?: vscode.SymbolKind) {
		if (typeof pType === 'undefined') {
			this.type = vscode.SymbolKind.Object;
		} else {
			this.type = pType;
		}
		this.name = pName;
		this.line = 0;
	}
}

// Search for DBField End
function parseForDBFieldEnd(pStatus: ParseStatus): ParseStatus {
	// check start DBField
	let DBFieldStart = 0;
	DBField: while (DBFieldStart >= 0) {
		// check DBField
		DBFieldStart = pStatus.parseString.search(/\/\*|\*\//);

		// line inside a DBField, ignore
		if (DBFieldStart === -1) {
			pStatus.parseString = '';
			break DBField;
		}

		// set new DBField depth level
		const DBFieldType = pStatus.parseString.substr(DBFieldStart, 2);
		if (DBFieldType === '/*') {
			pStatus.parseDepth++;
		} else {
			pStatus.parseDepth--;
		}

		// adjust parse string
		pStatus.parseString = pStatus.parseString.substr(DBFieldStart + 2);

		// DBField is over, return
		if (pStatus.parseDepth <= 0) {
			pStatus.parseMode = PARSE_INSTRUCTION;
			break DBField;
		}
	}
	return pStatus;
}

// Search for String End
function parseForStringEnd(pStatus: ParseStatus): ParseStatus {

	let endQuote = -1;
	if (pStatus.stringQuote === '\'') {
		endQuote = pStatus.parseString.search(/'/);
	} else {
		endQuote = pStatus.parseString.search(/"/);
	}

	// End Quote found
	if (endQuote >= 0) {
		// DoubleQuote
		if (pStatus.parseString.substr(endQuote + 1, 1) === pStatus.stringQuote) {
			pStatus.parseString = pStatus.parseString.substr(endQuote + 2);
			return parseForStringEnd(pStatus);
		}
		pStatus.parseString = pStatus.parseString.substr(endQuote + 1);
		pStatus.stringQuote = '';
		pStatus.parseMode = PARSE_INSTRUCTION;
	} else {
		// line inside a string, ignore
		pStatus.parseString = '';
	}

	return pStatus;
}

// create symbol for Block
function parseBlock(pBlock: string): ParseItem {
	// empty string, nothing to do
	if (pBlock.length === 0) {
		return null;
	}
	// last char is colon, we wont need that
	if (pBlock.substr(pBlock.length - 1, 1) === ':') {
		pBlock = pBlock.substr(0, pBlock.length - 1);
	}
	// split into words
	const words = pBlock.split(/\s+/);
	// no words, no work
	if (words.length === 0) {
		return null;
	}
	// is this a label or a block
	// ABL is case-insensitive, TS is not; make our life easier by coverting string to lowercase
	switch (words[0].toLowerCase()) {
		case 'case':
		case 'catch':
		case 'def':
		case 'define':
		case 'do':
		case 'else': // may precede a block
		case 'finally':
		case 'for':
		case 'get':
		case 'if': // if statements may precede a block
		case 'on': // on statements may precede a block
		case 'otherwise': // may precede a block
		case 'private':
		case 'protected':
		case 'public':
		case 'repeat':
		case 'set':
		case 'triggers':
		case 'when': // may precede a block
			// ignore those blocks
			return null;
		case 'class':
			return new ParseItem(words[1], vscode.SymbolKind.Class);
		case 'constructor':
			// check for keywords that may precede the name
			let iC = 1;
			const wC = words[1].toLowerCase();
			if (wC === 'private' || wC === 'public' || wC === 'protected' || wC === 'static') {
				iC++;
			}
			return new ParseItem(RemoveBracketFromName(words[iC]), vscode.SymbolKind.Constructor);
		case 'destructor':
			// check for keywords that may precede the name
			let iD = 1;
			const wD = words[1].toLowerCase();
			if (wD === 'public') {
				iD++;
			}
			// No Destructor Type in SymbolKind, return Method
			return new ParseItem(RemoveBracketFromName(words[iD]), vscode.SymbolKind.Method);
		case 'enum':
			return new ParseItem(words[1], vscode.SymbolKind.Enum);
		case 'function':
		case 'procedure':
			// No Procedure Type in SymbolKind, return Function
			return new ParseItem(words[1], vscode.SymbolKind.Function);
		case 'interface':
			return new ParseItem(words[1], vscode.SymbolKind.Interface);
		case 'method':
			// We want the Name of the Method, so check for various keywords
			let iM = 1;
			while (words[iM]) {
				const wM = words[iM].toLowerCase();
				if (wM === 'private' || wM === 'public' || wM === 'protected' || wM === 'static'
					|| wM === 'abstract' || wM === 'override' || wM === 'final') {
					iM++;
				} else {
					// iM should now be the return type, increase by one to get the name
					iM++;
					break;
				}
			}
			if (words[iM]) {
				return new ParseItem(RemoveBracketFromName(words[iM]), vscode.SymbolKind.Method);
			}
			return null;
		// must be a label
		default:
			return new ParseItem(words[0], vscode.SymbolKind.Key);

	}
}

// create symbol for instruction
function parseInstruction(pInstruction: string): ParseItem {
	// ABL is case-insensitive, TS is not; make our life easier by coverting string to lowercase
	if (pInstruction.substr(0, 3).toLowerCase().startsWith('def')) {
		const words = pInstruction.split(/\s+/);

		/*
         * Walk over all words of the instruction
         * certain keywords identify the type of definition (like parameter or variable)
         * this will be followed by the name
         */
		buffer: for (let i = 1; i < words.length; i++) {
			// ABL is case-insensitive, TS is not; make our life easier by coverting string to lowercase
			switch (words[i].toLowerCase()) {
				// reserverd words that might show up in a definition
				case 'new':
				case 'global':
				case 'shared':
				case 'private':
				case 'protected':
				case 'public':
				case 'static':
				case 'abstract':
				case 'override':
				case 'serializable':
				case 'non-serializable':
				case 'input':
				case 'output':
				case 'input-output':
				case 'return':
					break;
				// mark these as objects unless something better comes along
				case 'buffer':
				case 'dataset':
				case 'data-source':
				case 'frame':
				case 'image':
				case 'menu':
				case 'query':
				case 'rectangle':
				case 'sub-menu':
				case 'temp-table':
				case 'work-table':
				case 'workfile':
					i++;
					if (words[i]) {
						return new ParseItem(words[i], vscode.SymbolKind.Object);
					}
					break buffer;
				// Enumerations
				case 'enum':
					i++;
					if (words[i]) {
						return new ParseItem(words[i], vscode.SymbolKind.EnumMember);
					}
					break buffer;
				// Events
				case 'event':
					i++;
					if (words[i]) {
						return new ParseItem(words[i], vscode.SymbolKind.Event);
					}
					break buffer;
				// Parameter
				case 'parameter':
					i++;
					if (words[i]) {
						return new ParseItem(words[i], vscode.SymbolKind.TypeParameter);
					}
					break buffer;
				// Property
				case 'property':
					i++;
					if (words[i]) {
						return new ParseItem(words[i], vscode.SymbolKind.Property);
					}
					break buffer;
				// Stream
				case 'stream':
					i++;
					if (words[i]) {
						return new ParseItem(words[i], vscode.SymbolKind.File);
					}
					break buffer;
				// Variable
				case 'var':
				case 'vari':
				case 'variab':
				case 'variabl':
				case 'variable':
					i++;
					if (words[i]) {
						return new ParseItem(words[i], vscode.SymbolKind.Variable);
					}
					break buffer;
			}
		}
	}
	return null;
}

// Helper Function to Remove Brackets from names, Example: "Func(input)" -> "Func"
function RemoveBracketFromName(pName: string): string {
	const rName = pName.split('(', 1);
	return rName[0];
}