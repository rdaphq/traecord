// test-discord-rpc.js
const rpc = require('discord-rpc');
const client = new rpc.Client({ transport: 'ipc' });

client.on('ready', () => {
  console.log('Connected to Discord!');
  client.setActivity({
    details: 'Editing styles.css',
    state: 'In a workspace',
    smallImageKey: 'trae',
    smallImageText: 'Trae',
    startTimestamp: new Date(),
    largeImageKey: 'css',
    largeImageText: `Editing a CSS file`,
  });
});

client.login({ clientId: '817458228731576390' }).catch(console.error);