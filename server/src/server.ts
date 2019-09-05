/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import {
	createConnection,

	Diagnostic,
	DiagnosticSeverity,


	ExecuteCommandParams,
	ExecuteCommandRequest,
	Command,
	DidChangeConfigurationNotification,
	DocumentSymbolParams,
	InitializeParams,
	CancellationToken,
	CodeActionParams,
	CodeActionOptions,
	CompletionItem,
	CompletionItemKind,
	CodeAction,
	CodeActionKind,
	CreateFile,


	MessageType,
	StreamMessageWriter,
	ShowMessageRequestParams,
	ProposedFeatures,
	PublishDiagnosticsParams,
	Range,
	SymbolInformation,
	SymbolKind,
	TextDocumentPositionParams,
	RemoteWindow,
	ShowMessageNotification,
	ShowMessageParams,
	TextDocuments,
	TextDocument,
	WindowFeature,
	WorkspaceEdit,
	WorkspaceChange,
	WorkspaceFolder,
	WorkspaceFeature,
	CreateFileOptions,


	DeleteFile,
	Location,
	Position,
	RenameFile,
	TextDocumentEdit,
	TextEdit,
	VersionedTextDocumentIdentifier,




} from 'vscode-languageserver';
import * as utils from './utils';
import * as path from 'path';
//grab array of keywords here. can we get this from the client?
import * as grammar from './pro.tmLanguage.json';



//import * as vscode from 'vscode-languageserver';

import { ParseDocument, ParseItem, MySymbol } from './parser';
//import {onExecuteCommand} from './commands';
import { connect } from 'http2';
import { isWindows } from './utils.js';
import { WorkspaceFoldersFeature } from 'vscode-languageserver/lib/workspaceFolders';

// Create a connection for the server. The connection uses Node's IPC as a transport.
// Also include all preview / proposed LSP features.
let connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager. The text document manager
// supports full document sync only
let documents: TextDocuments = new TextDocuments();

let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;
let hasDiagnosticRelatedInformationCapability: boolean = false;

connection.onInitialize((params: InitializeParams) => {
	let capabilities = params.capabilities;

	// Does the client support the `workspace/configuration` request?
	// If not, we will fall back using global settings
	hasConfigurationCapability = !!(
		capabilities.workspace && !!capabilities.workspace.configuration
	);
	hasWorkspaceFolderCapability = !!(
		capabilities.workspace && !!capabilities.workspace.workspaceFolders
	);
	hasDiagnosticRelatedInformationCapability = !!(
		capabilities.textDocument &&
		capabilities.textDocument.publishDiagnostics &&
		capabilities.textDocument.publishDiagnostics.relatedInformation
	);

	return {
		capabilities: {
			textDocumentSync: documents.syncKind,

			// code action - only way to return a command with a link to doc?
			codeActionProvider: true,
			// Tell the client that the server supports code completion
			completionProvider: {
				resolveProvider: true

			},

			// Tell the client that the server supports document Symbols
			documentSymbolProvider: true,

			// and can execute commands (for syntax checker)
			executeCommandProvider: {
				"commands": ["checkSyntax"]
			}

		}
	};
});

connection.onInitialized(() => {
	if (hasConfigurationCapability) {
		// Register for all configuration changes.
		connection.client.register(DidChangeConfigurationNotification.type, undefined);
	}
	if (hasWorkspaceFolderCapability) {
		connection.workspace.onDidChangeWorkspaceFolders(_event => {
			connection.console.log('Workspace folder change event received.');
		});
	}
});

// The example settings
interface ExampleSettings {
	maxNumberOfProblems: number;
	enableSyntaxCheckTab: boolean;
	enableSyntaxCheckCodeAction: boolean;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000, enableSyntaxCheckTab: true, enableSyntaxCheckCodeAction: false };
let globalSettings: ExampleSettings = defaultSettings;

// Cache the settings of all open documents
let documentSettings: Map<string, Thenable<ExampleSettings>> = new Map();





connection.onDidChangeConfiguration(change => {
	if (hasConfigurationCapability) {
		// Reset all cached document settings
		documentSettings.clear();
	} else {
		globalSettings = <ExampleSettings>(
			(change.settings.languageServerExample || defaultSettings)
		);
	}

	// Revalidate all open text documents
	documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Thenable<ExampleSettings> {
	if (!hasConfigurationCapability) {
		return Promise.resolve(globalSettings);
	}
	let result = documentSettings.get(resource);
	if (!result) {
		result = connection.workspace.getConfiguration({
			scopeUri: resource,
			section: 'languageServerExample'
		});
		documentSettings.set(resource, result);
	}
	return result;
}

// Only keep settings for open documents
documents.onDidClose(e => {
	documentSettings.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {

	//DISABLED but left code in for reference.
	//validateTextDocument(change.document);
	checkDocumentSyntax(change.document);
});

async function checkDocumentSyntax(textDocument: TextDocument): Promise<void> {
	//if syntaxcheck tab is enabled:
	let settings = await getDocumentSettings(textDocument.uri);
	if (settings.enableSyntaxCheckTab) {
		var doc = documents.get(textDocument.uri);
		//monitor only .pro files
		//how do we retrieve this from the client language setting?
		if (doc.languageId == 'pro') {
			
			//pass document name to syntax checker
			var args: string[] = [];
			args.push(textDocument.uri.toString());
			
			var execute: ExecuteCommandParams = { command: "checkSyntax", arguments: args };
			var token: CancellationToken;
			onExecuteCommand(execute, token);
		}
	}
}

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
	// In this simple example we get the settings for every validate run.
	let settings = await getDocumentSettings(textDocument.uri);

	// The validator creates diagnostics for all uppercase words length 2 and more
	let text = textDocument.getText();
	let pattern = /\b[A-Z]{2,}\b/g;
	let m: RegExpExecArray | null;

	let problems = 0;
	let diagnostics: Diagnostic[] = [];
	while ((m = pattern.exec(text)) && problems < settings.maxNumberOfProblems) {
		problems++;
		let diagnostic: Diagnostic = {
			severity: DiagnosticSeverity.Warning,
			range: {
				start: textDocument.positionAt(m.index),
				end: textDocument.positionAt(m.index + m[0].length)
			},
			message: `${m[0]} is all uppercase!!!.`,
			source: 'ex'
		};
		if (hasDiagnosticRelatedInformationCapability) {
			diagnostic.relatedInformation = [
				{
					location: {
						uri: textDocument.uri,
						range: Object.assign({}, diagnostic.range)
					},
					message: 'Spelling matters'
				},
				{
					location: {
						uri: textDocument.uri,
						range: Object.assign({}, diagnostic.range)
					},
					message: 'Particularly for names'
				}
			];
		}
		diagnostics.push(diagnostic);
	}

	// Send the computed diagnostics to VSCode.
	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

connection.onDidChangeWatchedFiles(_change => {
	// Monitored files have change in VSCode
	console.log('We received an file change event');
});

// This handler provides the initial list of the completion items.
connection.onCompletion(
	(_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
		// The pass parameter contains the position of the text document in
		// which code complete got requested. For the example we ignore this
		// info and always provide the same completion items.
		return [
			{
				label: 'TypeScript',
				kind: CompletionItemKind.Text,
				data: 1
			},
			{
				label: 'JavaScript',
				kind: CompletionItemKind.Text,
				data: 2
			}
		];
	}
);

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve(
	(item: CompletionItem): CompletionItem => {
		if (item.data === 1) {
			item.detail = 'TypeScript details';
			item.documentation = 'TypeScript documentation';
		} else if (item.data === 2) {
			item.detail = 'JavaScript details';
			item.documentation = 'JavaScript documentation';
		}
		return item;
	}
);

connection.onCodeAction((codeActionParams: CodeActionParams): CodeAction[] => {
	//all this is a bodge to get the uri through to the calling command, so we can parse symbols and presend dialog box server-side

	let codeActions = [];
	let codeAction: CodeAction = { title: "Check Syntax", kind: CodeActionKind.QuickFix };

	var doc: TextDocument = documents.get(codeActionParams.textDocument.uri);

	var args: string[] = [];
	args.push(codeActionParams.textDocument.uri.toString());
	var command: Command = Command.create("checkSyntax", "checkSyntax", codeActionParams.textDocument.uri.toString());

	codeAction.command = command;
	//	var oneCommand = Command.create("my syntax checker","checkSyntax",args);
	//command.push(oneCommand);
	codeActions.push(codeAction);

	//DISABLED in preference to onDocumentChange trigger
	//return codeActions;
	return;
});

connection.onDocumentSymbol(onDocumentSymbol);
//change to async then promise.resolve
function onDocumentSymbol(documentSymbol: DocumentSymbolParams): SymbolInformation[] {
	console.log('Server.onDocumentSymbol', documentSymbol);
	//const path = utils.uriToPath(documentSymbol.textDocument.uri);

	// Create an SymbolInformation[] Object to pass as result
	const symbolInformationResult: SymbolInformation[] = [];

	// Form local variables for changed doc uri (preliminary code is for DocumentSymbol not workspace-wide)
	const uri = documentSymbol.textDocument.uri;
	const thisdoc = documents.get(uri);

	//create headings/containers for outline... not yet working...
	/*
	const wholedoc = Range.create(0, 0, thisdoc.lineCount, Number.MAX_VALUE);
	var headingSymbolString = SymbolInformation.create('STRINGS:',SymbolKind.String,wholedoc,uri);
	symbolInformationResult.push(headingSymbolString);
	
	var headingSymbolString = SymbolInformation.create('DB FIELDS:',SymbolKind.Field,wholedoc,uri);
	symbolInformationResult.push(headingSymbolString);
	*/

	// Retrieve list of symbols by passing document to parser
	// ParseItem is (name,symbolKind and Line), but not Range. Extended by MySymbol to include start and end char pos in line
	// pass it also our grammar json to identify keyworkds
	const symbols: MySymbol[] = ParseDocument(thisdoc, grammar);

	//for each symbok, construct a SymbolInformation Object, and push to result array
	for (const symbol of symbols) {

		// What is the document range that covers this symbol? 
		// this is the character range of the whole line, rather than just the symbol start and end
		const symbolRange = Range.create(symbol.parseItem.line, symbol.start, symbol.parseItem.line, symbol.end);

		// Construct symbolInformation Object
		const symbolInformation = SymbolInformation.create(symbol.parseItem.name, symbol.parseItem.type, symbolRange, uri, symbol.parseItem.container);
		//var conName = symbolInformation.containerName;

		// Finally, push the symbol to output array
		symbolInformationResult.push(symbolInformation);
	}
	return symbolInformationResult;
}


/*
connection.onDidOpenTextDocument((params) => {
	// A text document got opened in VSCode.
	// params.uri uniquely identifies the document. For documents store on disk this is a file URI.
	// params.text the initial full content of the document.
	connection.console.log(`${params.textDocument.uri} opened.`);
});
connection.onDidChangeTextDocument((params) => {
	// The content of a text document did change in VSCode.
	// params.uri uniquely identifies the document.
	// params.contentChanges describe the content changes to the document.
	connection.console.log(`${params.textDocument.uri} changed: ${JSON.stringify(params.contentChanges)}`);
});
connection.onDidCloseTextDocument((params) => {
	// A text document got closed in VSCode.
	// params.uri uniquely identifies the document.
	connection.console.log(`${params.textDocument.uri} closed.`);
});
*/

// Make the text document manager listen on the connection
// for open, change and close text document events


connection.onExecuteCommand(onExecuteCommand);
async function onExecuteCommand(params: ExecuteCommandParams, pToken: CancellationToken) {
	console.log("run command");
	switch (params.command) {
		case "checkSyntax":
			// we have passed the doc URI in the ExecuteCommandParams as an argument.
			// (this seems to have to come via a CodeAction rather than a plain UI ExecuteCommand in order that
			// the UI can pass the document url )

			// Get the DocumentSymols 
			let uri: string = params.arguments[0];
			const thisdoc = documents.get(uri);
			let documentSymbol: DocumentSymbolParams = { textDocument: thisdoc };
			var symbolInformationResult: SymbolInformation[] = [];
			symbolInformationResult = onDocumentSymbol(documentSymbol);
			var syntaxmessage: string;
			var myarray = [];
			var strings: string = "";
			var fields: string = "";
			var variables: string = "";

			var stringsA: string[] = [];
			var fieldsA: string[] = [];
			var variablesA: string[] = [];


			//Format the symbols into a Syntax Checker result string
			for (let sym of symbolInformationResult) {
				//syntaxmessage += sym.containerName;
				myarray.push({
					"type": sym.containerName,
					"value": sym.name
				});
				if (sym.containerName == "STRINGS:") {
					stringsA.push(sym.name);
					strings += sym.name + "\r\n";
				}
				if (sym.containerName == "DB FIELDS:") {
					fields += sym.name + "\r\n";
					fieldsA.push(sym.name);
				}
				if (sym.containerName == "VARIABLES:") {
					variables += sym.name + "\r\n";
					variablesA.push(sym.name);
				}
			}

			//syntaxmessage = '*****     STRINGS     *****\r\n' + strings + "\r\n" + "*****     DB FIELDS     *****\r\n" + fields + "\r\n" + "*****     VARIABLES     *****\r\n" + variables;
			const distinctStrings = [...new Set(stringsA)];
			const distinctFields = [...new Set(fieldsA)];
			const distinctVars = [...new Set(variablesA)];

			syntaxmessage = '*****     STRINGS       *****\r\n' + distinctStrings.join('\r\n') + '\r\n\r\n';
			syntaxmessage += '*****     DB FIELDS     *****\r\n' + distinctFields.join('\r\n') + '\r\n\r\n';
			syntaxmessage += '*****     VARIABLES     *****\r\n' + distinctVars.join('\r\n') + '\r\n\r\n';

			//popup syntax

			// hmm, doesn't allow multiline.
			//connection.window.showErrorMessage(syntaxmessage);

			//instead, make a new tab in the workspace
			//some text
			//const textToAdd: string = "test string";

			//create new WorkspaceChange obj
			//let workspaceChange = new WorkspaceChange();

			//uri of new file
			let newuri = 'file:///c:/temp/syntaxcheck.txt';

			//construct a CreateFile variable
			let createFile: CreateFile = { kind: 'create', uri: newuri };
			//and make into array
			let createFiles: CreateFile[] = [];
			createFiles.push(createFile);

			//make a new workspaceEdit variable, specifying a createFile document change
			var workspaceEdit: WorkspaceEdit = { documentChanges: createFiles };

			//pass to client to apply this edit
			await connection.workspace.applyEdit(workspaceEdit);


			//To insert the text (and pop up the window), create array of TextEdit
			let textEdit: TextEdit[] = [];
			//let document = documents.get(newuri);
			let documentRange: Range = Range.create(0, 0, Number.MAX_VALUE, Number.MAX_VALUE);
			//populate with the text, and where to insert (surely this is what workspaceChange.insert is for?)
			let textEdits: TextEdit = { range: documentRange, newText: syntaxmessage };
			//Range.create(Position.create(0, 1),Position.create(0, 1)), newText: syntaxmessage};
			textEdit.push(textEdits);

			//make a new array of textDocumentEdits, containing our TextEdit (range and text)
			let textDocumentEdit = TextDocumentEdit.create({ uri: newuri, version: 1 }, textEdit);
			let textDocumentEdits: TextDocumentEdit[] = [];
			textDocumentEdits.push(textDocumentEdit);

			//set  our workspaceEdit variable to this new TextDocumentEdit
			workspaceEdit = { documentChanges: textDocumentEdits };

			//and finally apply this to our workspace.
			// we can probably do this some more elegant way / in
			connection.workspace.applyEdit(workspaceEdit);

			break;
	}
}




documents.listen(connection);

// Listen on the connection
connection.listen();
