// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

let plugin_name = "pureact-plugin";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log(`Congratulations, your extension ${plugin_name} is now active!`);
	
	let inference = vscode.commands.registerCommand('pureact-plugin.infer', () => {
		// Must have workspace folder
		if(vscode.workspace.workspaceFolders === undefined){
			let message = `${plugin_name}: Working folder not found, open a folder and try again` ;
			
			vscode.window.showErrorMessage(message);
			
			return;
		}
		// Must have only one workspace folder
		if(vscode.workspace.workspaceFolders.length !== 1){
			let message = `${plugin_name}: Too many Working folders, open only one folder and try again` ;
			
			vscode.window.showErrorMessage(message);
			
			return;
		}



		// step one: get path
		let wf = vscode.workspace.workspaceFolders[0].uri.path ;
		let f = vscode.workspace.workspaceFolders[0].uri.fsPath ; 
		
		let message = `${plugin_name}: Path of source code folder: ${wf} - ${f}` ;
		vscode.window.showInformationMessage(message);
		let projectPath = f + '/';
		
		// step two: execute PureAct, display 
		let jarPath = path.resolve(__dirname, '../plugin/');
		let presetPath = path.resolve(__dirname, '../plugin/api-preset');
		// jarPath = jarPath.replace(/\\/gi, '\/');
		var cmdStr = `java -jar ${jarPath} -s ${projectPath} `;
		console.log('Executed Command : ' + cmdStr);

		const process = require('child_process');
		let cwdPath = path.resolve(__dirname, '../plugin');
		process.exec(cmdStr, {cwd:cwdPath}, (err:any, stdout:any, stderr:any ) => {
			// let panel = vscode.window.createWebviewPanel('CraTer', 'CraTer Result', vscode.ViewColumn.One);
			// panel.webview.html = getWebViewHTML(stdout, stderr);
		});

	});

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('pureact-plugin.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from PureAct-Plugin!');
	});

	context.subscriptions.push(inference);
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
	vscode.window.showInformationMessage('extension "pureact-plugin" is now deactive!');
}
