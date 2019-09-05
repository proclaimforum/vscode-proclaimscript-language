# Change Log

All notable changes to the "proclaimscript" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

## [0.1.1] - 2019-08-13
### Initial release

## [0.1.2] - 2019-08-14
### Added
- more snippets from Git - WHILE loops, TABLE commands and PUT etc. 

## [0.1.3] - 2019-08-14
### Added
- more snippets from Git - STATUS/OPEN/CLOSE etc, including best practice example of updating linked file

## [0.1.4] - 2019-08-22
### Fixed
- variable highlighting where variable name contained numeric or arithmetic symbol

## [0.2.0] - 2019-01-09
### Added
- merged branch LSP_TEST:
- migrated to LSP client/server model to allow future expansion
- Outline symbol detection of DB fields and strings (helps debug typos)
- webpack vsix for cleaner install

## [0.2.1] - 2019-05-09
### Added
 - syntax check list of variables, DB fields and strings, outputs to tab or QuickFix
 -- see package configuration options: enableSyntaxCheckTab and enableSyntaxCheckCodeAction
 ### Fixed
 - variable name symbols where keyword formed part of the symbol (in both client tmLanguage and parser)

## [0.2.2] - 2019-05-09
### Fixed
- minor language definition errors

## [0.2.3] - 2019-05-09
### Fixed
- minor language definition errors

## [0.2.4] - 2019-05-09
### Fixed
- change syntaxcheck.txt to save to current workspace folder of .pro file