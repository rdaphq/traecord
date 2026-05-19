const vscode = require('vscode');

let rpcProcess;
let isConnected = false;
let sessionStartTimestamp;

function activate(context) {
	if (!sessionStartTimestamp) sessionStartTimestamp = Date.now();
	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1000);
	statusBarItem.command = 'traecord.toggle';
	statusBarItem.text = '$(plug) Traecord';
	statusBarItem.show();

	const path = require('path');
	const { fork } = require('child_process');
	
	function connect() {
		if (rpcProcess) return;
		
		const scriptPath = path.resolve(__dirname, 'rpc-client.js');

		console.log('[Traecord] extension.js __dirname:', __dirname);

		rpcProcess = fork(scriptPath, { silent: false });

		rpcProcess.on('message', (message) => {
			console.log('[Traecord] RPC Message', message);

			if (message.type === 'ready') {
				isConnected = true;
				updateStatusBar();
				updatePresence();
				console.log('[Traecord] RPC Ready.');
			} else if (message.type === 'error') {
				console.error('Failed to connect to Discord:', message.error);
				vscode.window.showErrorMessage(`Failed to connect to Discord: ${message.error}`);
			}
		})

		rpcProcess.on('exit', (code) => {
			console.log(`[Traecord] RPC Process exited with code ${code}`);
			rpcProcess = null;
			isConnected = false;
			updateStatusBar();
		});
	}

	function disconnect() {
		if (!rpcProcess) return;

		rpcProcess.send({ type: 'disconnect' });
		
		rpcProcess = null;
		isConnected = false;
		updateStatusBar();

		console.log('[Traecord] Disconnected from Discord.');
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

	function updatePresence() {
		if (!rpcProcess) return;
		
		const config = vscode.workspace.getConfiguration('traecord');
		const showFileName = config.get('showFileName');
		const showWorkspace = config.get('showWorkspace');
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			rpcProcess.send({
				type: 'setActivity',
				data: {
					details: 'Idling',
					startTimestamp: sessionStartTimestamp,
					largeImageKey: 'idle',
					largeImageText: 'Idling',
					smallImageKey: 'trae',
					smallImageText: 'TRAE',
				}
			});

			return;
		}

		const fileName = path.basename(editor.document.fileName);
		const workspace = vscode.workspace.name || 'No workspace';
		const language = editor.document.languageId;

		const details = showFileName? `Editing ${fileName}` : 'Idling';
		const state = showWorkspace? `In ${workspace}` : 'No workspace';

		const languageText = `Editing a ${language} file`;

		console.log(`[Traecord] Sending payload: ${language}`);

		const payload = {
			details: details,
			state: state,
			startTimestamp: sessionStartTimestamp,
			largeImageKey: language,
			largeImageText: languageText,
			smallImageKey: 'trae',
			smallImageText: 'TRAE',
		}

		rpcProcess.send({
			type: 'setActivity',
			data: payload
		})

		console.log(`[Traecord] Status set.`);
	}

	vscode.window.onDidChangeActiveTextEditor(updatePresence);
	vscode.workspace.onDidChangeTextDocument(updatePresence);

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

	connect();
}

function deactivate() {
	if (rpcProcess) {
		rpcProcess.send({ type: 'disconnect' });
	}
}

module.exports = {
	activate,
	deactivate
};
