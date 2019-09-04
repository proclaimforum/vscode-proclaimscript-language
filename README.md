# Proclaim Maths Script VSCode Language Extension

A Visual Studio Code Language Server Extension
for Eclipse Proclaim Maths Script

(C)  Burnside Consulting Ltd 2019

## Features

* Syntax highlighting, including Proclaim Maths Keywords featured in versions up to 3.4.02
* IF THEN ELSE code folding and indentation
* Snippets framework for example maths layouts
* OUTLINE Symbol detection for DB fields, variables and strings
* Basic Syntax Checking - list all DB fields, variables and strings (helpful in spotting typos)

## Installation

This extension is available on the Visual Studio Code Marketplace.
Search for "Proclaim Maths"

To install a development version directly from the GIT respository files:
1. Create a directory  %userprofile%/.vscode/extensions/proclaimscript
2. Copy/clone contents of this repository into it, restart VSCode
3. Create a blank file, and save it with extension .pro (or load one previously saved from Proclaim Maths editor). The syntax highlighter will then recognise and parse the code.

## Requirements

Written on VS Code version 1.36.0 Node.js 10.11.0.

## Extension Settings

- enableSyntaxCheckTab:
if true, then a new tab is opened called 'syntaxcheck' that lists all DB fields, variables and strings. 

- enableSyntaxCheckCodeAction: 
if true, then the syntax check tab is only opened/refreshed when you click the QuickAction lighbulb inline and choose 'Check Syntax'

## Known Issues

* IF ELSE autocompletion competition with C/C++ LSP makes writing IF ELSE blocks a little clunky
* autocomplete / folding of IF ELSE is case sensitive.

## Release Notes

See CHANGELOG.md for recent changes, or Git repository for more detail
First release 0.1.1 on 13/08/2019

## TODO

* theme/colouring to match Proclaim editor when VSCode theme is white background
* more snippets for sample keywords, based on Example Maths from ProclaimForum.co.uk
* Intellisense / autocomplete for inline help for keywords
* improve DocumentSymbol parsing to include variables.
* 'Problems' LSP for e.g. mismatched 
* create new Command to replicate the old 'syntax check' output that displays a summary of all DB fields, variables and strings.
* hook into live Proclaim system to syntax check DB field names


## Contributing

Pull requests welcomed

### Developer Hints:

* Syntax highlighting rules are defined in pro.tmlLanguage.json
* Indentation rules are defined in language-configuration.json
* Snippets (sample code/Intellisense) are defined in snippets.json
* Symbol parsing (for OUTLINE view) are defined in  in server/src/parser.ts
* In Proclaim v3.4+, the definition of the built-in syntax highlighter (CodeJock Syntax Edit) is stored in ConfigEditor/Schemas/_Proclaim.schclass
* To see how the extension has parsed a specific line/keywork, go View-->Command Palette.. Developer: Inspect TM Scopes
* For contributing/making changes to the extension, instead of 'installing' the script into your extensions directory try running the extension in the VSCode Extension Development Host 
1. copy /proclaimscript into %userprofile/proclaimscript
2. open launch.json in VSCode
3. hit F5 to open the Extension Development Host
4. open the examples/test.pro file to test out syntax highlighting. 
5. make changes to the extension in the main VSCode window, reloading to see the effect on the extension

## Acknowledgements
Framework inspired by https://github.com/chriscamicas/vscode-abl

## License
GNU GPL v3.0 
See LICENSE file for full details
