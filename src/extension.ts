// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

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



		// step one: get project path
		let projectPath = vscode.workspace.workspaceFolders[0].uri.fsPath + '/';
		let jarPath = path.resolve(__dirname, '../plugin/PureAct-1.00-jar-with-dependencies.jar');
		let presetPath = path.resolve(__dirname, '../plugin/api-std-preset-json/');

		// step two: execute PureAct, display 
		var cmdStr = `java -jar ${jarPath} App -s ${projectPath} -m -c -askUser -p ${presetPath}`;
		console.log('Executed Command : ' + cmdStr);

		vscode.window.showInformationMessage('Start purity inference!');

		
		const process = require('child_process');
		let cwdPath = path.resolve(__dirname, '../plugin');
		process.exec(cmdStr, {cwd:cwdPath}, (err:any, stdout:any, stderr:any ) => {
			let logPanel = vscode.window.createWebviewPanel('PureAct', 'PureAct Log', vscode.ViewColumn.One);
			logPanel.webview.html = getLogHTML(stdout, stderr);

			let methPurityPable = vscode.window.createWebviewPanel('PureAct', 'PureAct Output', vscode.ViewColumn.One);
			methPurityPable.webview.html = getOutputHTML(cwdPath);
		});

	});

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('pureact-plugin.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('PureAct plugin is activated!');
	});

	context.subscriptions.push(inference);
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
	vscode.window.showInformationMessage('extension "pureact-plugin" is now deactive!');
}

/**
 * ?????? PureAct ?????????????????? WebView ????????? html ??????
 * @param stdout ???????????????
 * @param stderr ???????????????
 * @returns res, WebView ????????? html ??????
 */
function getLogHTML(stdout: any, stderr: any): string{
	let res = `<h1 style='color:#23a8f2;font-weight:bold;' title='PureAct'>PureAct ??????</h1>	
					<p style='font-size:15px;'>???????????? PureAct ???????????? (<span style='color:gray;'>???????????????</span>)???</p>
					<p style='font-size:15px'>${stdout}</p>`;  // ???????????????

	if(stderr){  // ???????????????
		res += `<div style='font-size:15px'>
						<h3>Error message</h3>
						<div style='font-size:15px'>${stderr}</div>
						<p>Oops, PureAct failed to infer the purity. Please check the format of arguments.</p></div>`;
	}

	return res;
}

function getOutputHTML(cwdPath: string): string{

	let PureMethList = getListHelper(`Pure Method Signatures`, `????????????????????????`, cwdPath + '/pureMeth.csv');
	let ImpureMethList = getListHelper(`Impure Method Signatures`, `???????????????????????????`,cwdPath + '/impureMeth.csv');
	let UnknownMethList = getListHelper(`Unknown Method Signatures`, `?????????????????????????????????`, cwdPath + '/unknownMeth.csv');

	let res = `<h1 style='color:#23a8f2;font-weight:bold;' title='PureAct Inference '>PureAct ????????????</h1>	
					<p style='font-size:15px;'>???????????? PureAct ??????????????????????????????????????????????????????:</p>
					<ol>
						<li>????????????</li>
						<li>???????????????</li>
						<li>?????????????????????</li>
					</ol>
					${PureMethList}${ImpureMethList}${UnknownMethList}`;
	return res;
}

function getListHelper(title:string, cnTitle: string, filePath: string) :string {
	let ul = '<ul>';
	fs.readFileSync(filePath)
						  .toString()
						  .split('\n')
						  .forEach((value: string, index: number, array: string[]) => {
							if(value.length !== 0)
								ul += `<li>${value}</li>`;
						  }, ul);
	// for(let i = 0; i < list.length; ++i) {
	// 	ul += `<li>${list[i]}</li>`
	// }

	ul += '</ul>';
	return `<h2 style='color:#23a8f2;font-weight:bold;' title=${title}> ${cnTitle} </h2>
	<p style='font-size:20px'>${ul}</p>`;;
}