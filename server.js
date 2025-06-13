const OSC = require('osc-js');
const WebSocket = require('ws');

const WS_PORT = process.env.WS_PORT || 8080;
const OSC_HOST = process.env.OSC_HOST || '127.0.0.1';
const OSC_PORT = process.env.OSC_PORT || 8000;
const PING_INTERVAL = 5000; // 5 секунд

const wss = new WebSocket.Server({ port: WS_PORT });

console.log('Server started. Listening for connections: ws://0.0.0.0:%d', WS_PORT);
console.log('OSC expected on %s:%d', OSC_HOST, OSC_PORT);


// --- ping/pong блок ---
function noop() {}

function heartbeat() {
    console.log('heartbeat');
    this.isAlive = true;
}

// Глобальный интервал для всех клиентов
const pingInterval = setInterval(() => {
    wss.clients.forEach(function each(ws) {
        if (ws.isAlive === false) {
            console.log('Terminating dead client connection');
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping(noop);
    });
}, PING_INTERVAL);

wss.on('connection', function connection(ws) {
    console.log('Client connected');

    // ping/pong механизм
    ws.isAlive = true;
    ws.on('pong', heartbeat);

    ws.on('message', function incoming(message) {
        console.log('Message received: %s', message);

        try {
            const buffer = Buffer.from(message);
            const arrayBuffer = new Uint8Array(buffer).buffer;
            const dataView = new DataView(arrayBuffer);

            const oscMessage = new OSC.Message();
            oscMessage.unpack(dataView);

            console.log('OSC Address:', oscMessage.address);
            console.log('OSC Args:', oscMessage.args);

            const stringData = oscMessage.args[0];

            console.log('String received via WebSocket:', stringData);

            const oscClient = new OSC({
                plugin: new OSC.DatagramPlugin({ send: { port: Number(OSC_PORT), host: OSC_HOST } })
            });

            oscClient.send(new OSC.Message(oscMessage.address, stringData));

            console.log(
                'Message "%s" sent to OSC: %s:%d on address: %s',
                stringData, OSC_HOST, OSC_PORT, oscMessage.address
            );
        } catch (e) {
            console.error('Error unpacking OSC message:', e);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Очищаем ping interval при завершении процесса
process.on('SIGTERM', () => {
    clearInterval(pingInterval);
    wss.close(() => process.exit(0));
});
process.on('SIGINT', () => {
    clearInterval(pingInterval);
    wss.close(() => process.exit(0));
});
