// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand('comment-style-toggle.toggleCommentStyle', () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const document = editor.document;
      const selection = editor.selection;
      const currentLineNumber = selection.active.line;
      const { text } = document.lineAt(currentLineNumber);
      const lines: Line[] = [{ lineNumber: currentLineNumber, text }];
      const textTrimmed = text.trim();

      if (textTrimmed.startsWith('/**')) {
        lines.push(...getLinesBelow(currentLineNumber + 1, document));
      } else if (textTrimmed.startsWith('*/')) {
        lines.push(...getLinesAbove(currentLineNumber - 1, document));
      } else if (textTrimmed.startsWith('*')) {
        lines.push(...getLinesBelow(currentLineNumber + 1, document));
        lines.push(...getLinesAbove(currentLineNumber - 1, document));
      } else {
        // not a comment, return
        return;
      }

      editor.edit((editBuilder) => {
        lines.forEach((line) => {
          if (line.text.trim().startsWith('/*') || line.text.trim().startsWith('*/')) {
            const range = document.lineAt(line.lineNumber).rangeIncludingLineBreak;
            editBuilder.delete(range);
          } else {
            const range = document.lineAt(line.lineNumber).range;

            const lineText = line.text.replace(' *', '//');
            editBuilder.replace(range, lineText);
          }
        });
      });
    }
  });

  context.subscriptions.push(disposable);
}

interface Line {
  lineNumber: number;
  text: string;
}

function getLinesAbove(startingLineNumber: number, document: vscode.TextDocument): Line[] {
  const lines: Line[] = [];
  let foundTop = false;
  let lineNumber = startingLineNumber;

  while (!foundTop) {
    const { text } = document.lineAt(lineNumber);
    const textTrimmed = text.trim();

    lines.push({ text, lineNumber });
    if (textTrimmed.startsWith('/**')) {
      foundTop = true;
    }
    lineNumber--;
  }

  return lines;
}

function getLinesBelow(startingLineNumber: number, document: vscode.TextDocument): Line[] {
  const lines: Line[] = [];
  let foundBottom = false;
  let lineNumber = startingLineNumber;

  while (!foundBottom) {
    const { text } = document.lineAt(lineNumber);
    const textTrimmed = text.trim();

    lines.push({ text, lineNumber });
    if (textTrimmed.startsWith('*/')) {
      foundBottom = true;
    }
    lineNumber++;
  }

  return lines;
}

// this method is called when your extension is deactivated
export function deactivate() {}
