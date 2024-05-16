const OSC = require('osc-js');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
    console.log('Client connected');

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);

        const buffer = Buffer.from(message);
        const arrayBuffer = new Uint8Array(buffer).buffer;
        const dataView = new DataView(arrayBuffer);


        try {
            // Создаем OSC сообщение и распаковываем с помощью DataView
            const oscMessage = new OSC.Message();
            oscMessage.unpack(dataView);

            console.log('OSC Address:', oscMessage.address);
            console.log('OSC Args:', oscMessage.args);

            // Получаем данные как текст если первый аргумент отправлен как строка
            const stringData = oscMessage.args[0]; // Нет необходимости проверять тип, так как это уже строка

            console.log('String received via WebSocket:', stringData);

            // Создание клиента OSC для отправки сообщения в локальной сети
            const oscClient = new OSC({ plugin: new OSC.DatagramPlugin({ send: { port: 41234, host: '192.168.1.106' } }) });

            // Отправка сообщения OSC в локальной сети
            oscClient.send(new OSC.Message('/sendText', stringData));
        } catch (e) {
            console.error('Error unpacking OSC message:', e);
        }
    });
});