const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 3000 });
const clients = new Set();

function broadcast(message) {
    for (let client of clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    }
}

server.on('connection', (ws) => {
    clients.add(ws);
    console.log('Користувач приєднався');
    
    broadcast(' Новий користувач приєднався до чату');

    ws.on('message', (message) => {
        const msgString = message.toString();
        console.log('Отримане повідомлення:', msgString);
        broadcast(msgString);
    });

    ws.on('close', () => {
        clients.delete(ws);
        console.log('Користувач від’єднався');
        broadcast('<<< Користувач залишив чат');
    });
    ws.on('error', (err) => {
        console.error('Помилка з’єднання з клієнтом:', err);
        clients.delete(ws);
    });
});

console.log('Сервер чату запущено на ws://localhost:3000');