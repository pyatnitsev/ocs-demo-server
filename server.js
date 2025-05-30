const OSC = require('osc-js');
const WebSocket = require('ws');

const WS_PORT = process.env.WS_PORT || 8080;
const OSC_HOST = process.env.OSC_HOST || '127.0.0.1';
const OSC_PORT = process.env.OSC_PORT || 8000;

const wss = new WebSocket.Server({ port: WS_PORT });

console.log('Server started. Listening for connections: %s:%d', 'ws:\\\\localhost', WS_PORT);

wss.on('connection', function connection(ws) {
    console.log('Client connected');

    ws.on('message', function incoming(message) {
        console.log('Message received: %s', message);

        const buffer = Buffer.from(message);
        const arrayBuffer = new Uint8Array(buffer).buffer;
        const dataView = new DataView(arrayBuffer);

        try {
            const oscMessage = new OSC.Message();
            oscMessage.unpack(dataView);

            console.log('OSC Address:', oscMessage.address);
            console.log('OSC Args:', oscMessage.args);

            const stringData = oscMessage.args[0];

            console.log('String received via WebSocket:', stringData);

            const oscClient = new OSC({ plugin: new OSC.DatagramPlugin({ send: { port: Number(OSC_PORT), host: OSC_HOST } }) });

            oscClient.send(new OSC.Message(oscMessage.address, stringData));

            console.log('Message "%s" sent to OSC: %s:%d on address: %s', stringData, OSC_HOST, OSC_PORT, oscMessage.address);



        } catch (e) {
            console.error('Error unpacking OSC message:', e);
        }
    });
});
