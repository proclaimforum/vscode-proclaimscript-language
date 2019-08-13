# vscode-proclaimscript-language
Proclaim Script VSCode Language Extension

A Visual Studio Code Language Extension
for Eclipse Proclaim

Including Syntax Highlighter, snippets autocompletion and other VSCode Intellisense objects

(C) Copyright Burnside Consulting Ltd 2019

## Features

* Syntax highlighting. 
* IF THEN ELSE code folding
* Code snippets using samples from ProclaimForum.co.uk (TODO)
* inline documentation (TODO) based on samples from ProclaimForum.co.uk 

## Installation
1. Create a directory  %userprofile%/.vscode/extensions/proclaimscript
2. Copy contents of this repository into it, restart VSCode
3. Create a blank file, and save it with extension .pro (or load one previously saved from Proclaim Maths editor). The syntax highlighter will then recognise and parse the code.

## Requirements

Written on VS Code version 1.36.1 Node.js 10.11.0

## Extension Settings

No specific settings at this time

## Known Issues

* Overlap of IF ELSE autocompletion with C/C++ makes writing IF ELSE blocks a little clunky

## TODO
* Code folding for WHILE DO loop structures
* theme/colouring to match Proclaim editor when VSCode theme is white background
* more snippets for sample keywords, much like the Proclaim Maths Editor dropdown
* Intellisense / autocomplete for inline help for keywords

## Release Notes

### 1.0.0 

7/8/2019 first release - syntax highlighter basics working, plus sample snippet.


## Contributing
Pull requests welcomed
