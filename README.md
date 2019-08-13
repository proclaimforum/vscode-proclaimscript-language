# Proclaim Maths Script VSCode Language Extension

A Visual Studio Code Language Extension
for Eclipse Proclaim Maths Script

(C)  Burnside Consulting Ltd 2019

## Features

* Syntax highlighting, including Proclaim Maths Keywords featured in versions up to 3.4.02
* IF THEN ELSE code folding and indentation
* Snippets framework for example maths layouts, plus sample snippet for IF ELSEIF ELSE END


## Installation

This extension is available on the Visual Studio Code Marketplace.
Search for "Proclaim Maths"

To install a development version directly from the GIT respository files:
1. Create a directory  %userprofile%/.vscode/extensions/proclaimscript
2. Copy contents of this repository into it, restart VSCode
3. Create a blank file, and save it with extension .pro (or load one previously saved from Proclaim Maths editor). The syntax highlighter will then recognise and parse the code.

## Requirements

Written on VS Code version 1.36.0 Node.js 10.11.0

## Extension Settings

No specific settings at this time.

## Known Issues

* Numeric characters inside variable names are not correctly colour coded. (the aim is to emphasise which strings Proclaim will interpret as a variable name)
* IF ELSE autocompletion competition with C/C++ makes writing IF ELSE blocks a little clunky
* autocomplete / folding of IF ELSE is case sensitive.

## Release Notes

### 0.1.1 
10/08/2019 first release - syntax highlighter, some code folding and indentation basics working, plus sample snippet.

## TODO
* Code folding for WHILE DO loop structures
* theme/colouring to match Proclaim editor when VSCode theme is white background
* more snippets for sample keywords, based on Example Maths from ProclaimForum.co.uk
* Intellisense / autocomplete for inline help for keywords


## Contributing
Pull requests welcomed

### Developer Hints:
* Syntax highlighting rules are defined in pro.tmlLanguage.json
* Indentation rules are defined in language-configuration.json
* In Proclaim v3.4+, the definition of the built-in syntax highlighter (CodeJock Syntax Edit) is stored in ConfigEditor/Schemas/_Proclaim.schclass
* To see how the extension has parsed a specific line/keywork, go View-->Command Palette.. Developer: Inspect TM Scopes
* For contributing/making changes to the extension, instead of 'installing' the script into your extensions directory try running the extension in the VSCode Extension Development Host 
1. copy /proclaimscript into %userprofile/proclaimscript
2. open launch.json in VSCode
3. hit F5 to open the Extension Development Host
4. open the examples/test.pro file to test out syntax highlighting. 
5. make changes to the extension in the main VSCode window, reloading to see the effect on the extension

## License
GNU GPL v3.0 
See LICENSE file for full details
