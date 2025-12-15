const http = require('http');
const WebSocket = require('ws');
const url = require('url');

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    const parsedUrl = url.parse(req.url, true);

    if (req.method === 'GET' && parsedUrl.pathname === '/disconnect') {
        const userId = parsedUrl.query.id;

        if (userId) {
            let found = false;
            
            wss.clients.forEach((client) => {
                if (client.userId === userId && client.readyState === WebSocket.OPEN) {
                    client.close();
                    found = true;
                }
            });

            if (found) {
                res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('Вас успішно відключено від чату.');
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('Користувача не знайдено або вже відключено.');
            }
        } else {
            res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Не вказано ID користувача.');
        }
    } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('WebSocket Chat Server Running');
    }
});

const wss = new WebSocket.Server({ server });

function broadcast(message) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

wss.on('connection', (ws) => {
    const userId = Math.random().toString(36).substring(2, 9);
    ws.userId = userId;

    console.log(`Користувач приєднався (ID: ${userId})`);
    
    ws.send(JSON.stringify({ type: 'system', action: 'init', id: userId }));

    broadcast(' Новий користувач приєднався до чату');

    ws.on('message', (message) => {
        const msgString = message.toString();
        console.log(`Повідомлення від ${userId}:`, msgString);
        broadcast(msgString);
    });

    ws.on('close', () => {
        console.log(`Користувач ${userId} від’єднався`);
        broadcast('<<< Користувач залишив чат');
    });

    ws.on('error', (err) => {
        console.error('Помилка з’єднання з клієнтом:', err);
    });
});

server.listen(3000, () => {
    console.log('Сервер чату запущено на http://localhost:3000');
});