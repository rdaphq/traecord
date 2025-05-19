const rpc = require('discord-rpc');
const process = require('node:process');

const clientId = '817458228731576390';
let client = new rpc.Client({ transport: 'ipc' });

client.on('ready', () => {
	process.send?.({ type: 'ready' });

    process.stdout.write('[rpc-client] Started\n');

});

process.on('message', (message) => {
    if (message.type === 'setActivity') {
        console.log('[rpc-client] Setting activity', message.data);
        console.log(JSON.stringify(message.data, null, 2));
        try {
            client.setActivity(message.data);
        } catch (error) {
            console.error(`[rpc-client] Error setting activity: ${error}`);
            process.exit(1);
        }
    } else if (message.type === 'clear') {
        client.clearActivity();
    } else if (message.type === 'disconnect') {
        client.clearActivity();
        client.destroy();
        process.exit();
    }
})

client.login({ clientId }).catch(err => {
	process.send?.({ type:'error', error: err.message });
});