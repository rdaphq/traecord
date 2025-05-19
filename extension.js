const vscode = require('vscode');
const rpc = require('discord-rpc');
const path = require('path');

let client;
let startTimestamp = new Date();

function activate(context) {
	const clientId = '817458228731576390';

	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	statusBarItem.text = '$(plug) Traecord';
	statusBarItem.tooltip = 'Connecting';
	statusBarItem.show();

	client = new rpc.Client({ transport: 'ipc' });

	client.on('ready', () => {
		console.log('Connected to Discord.');
		statusBarItem.text = '$(check) Traecord';
		statusBarItem.tooltip = 'Connected';
		updatePresence();
	});

	client.login({ clientId }).catch(err => {
		console.error(err);
		statusBarItem.text = '$(alert) Traecord';
		statusBarItem.tooltip = 'Could not connect';
	});

	vscode.window.onDidChangeActiveTextEditor(updatePresence);
	vscode.workspace.onDidChangeTextDocument(updatePresence);

	context.subscriptions.push(statusBarItem);


	// UPDATING PRESENCE
	function updatePresence() {
		const config = vscode.workspace.getConfiguration('traecord');
		const showFileName = config.get('showFileName');
		const showWorkspace = config.get('showWorkspace');

		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			statusBarItem.text = '$(eye-closed) Traecord';

			client.setActivity({
				details: 'Idling',
				startTimestamp,
				largeImageKey: 'idle',
				largeImageText: 'Idling',
				smallImageKey: 'trae',
				smallImageText: 'Trae',
			})
			return;
		};

		const fileName = path.basename(editor.document.fileName);
		const workspace = vscode.workspace.name || 'No workspace';
		const language = editor.document.languageId;
		const languageText = `Editing a ${language} file`;

		const details = showFileName ? `Editing ${fileName}` : 'Idling';
		const state = showWorkspace ? `In ${workspace}` : 'No workspace';

		client.setActivity({
			details: details,
			state: state,
			startTimestamp,
			largeImageKey: language,
			largeImageText: languageText,
			smallImageKey: 'trae',
			smallImageText: 'Trae',
		});

		console.log(`Updated presence: ${language}`);
	}
}

function deactivate() {
	if (client) {
		client.clearActivity();
		client.destroy();
	}
}

module.exports = {
	activate,
	deactivate
};
