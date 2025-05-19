const vscode = require('vscode');
const rpc = require('discord-rpc');
const path = require('path');

let client;
let startTimestamp = new Date();

let isConnected = false;

function activate(context) {
	console.log('Activating Traecord extension.');

	const clientId = '817458228731576390';
	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	statusBarItem.command = 'traecord.toggle';
	statusBarItem.text = '$(plug) Traecord';
	statusBarItem.show();

	function connect() {
		if (client) return;

		client = new rpc.Client({ transport: 'ipc' });

		client.on('ready', () => {
			console.log('Connected to Discord.');
			isConnected = true;
			updatePresence();
			updateStatusBar();
		});
	
		client.login({ clientId }).catch(err => {
			console.error(err);
		});
	}

	function disconnect() {
		if (!client) return;

		client.clearActivity();
		client.destroy();
		client = null;

		isConnected = false;
		console.log('Disconnected from Discord.');
		updateStatusBar();
	}

	function updateStatusBar() {
		if (isConnected) {
			statusBarItem.text = '$(check) Traecord';
			statusBarItem.tooltip = 'Connected to Discord';
		} else {
			statusBarItem.text = '$(plug) Traecord';
			statusBarItem.tooltip = 'Click to connect to Discord';
		}
	}

	connect();

	vscode.window.onDidChangeActiveTextEditor(() => {
		if (isConnected) updatePresence();
	});
	vscode.workspace.onDidChangeTextDocument(() => {
		if (isConnected) updatePresence();
	});

	context.subscriptions.push(
		vscode.commands.registerCommand('traecord.toggle', () => {
			if (isConnected) {
				disconnect();
			} else {
				connect();
			}
			updateStatusBar();
		})
	);

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
