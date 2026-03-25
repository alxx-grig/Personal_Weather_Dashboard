const http = require('http');
const https = require('https');

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const targetUrl = 'https://ucf.transloc.com/Services/JSONPRelay.svc/GetStopArrivalTimes?apiKey=8882812681&stopIds=54&version=2';

    https.get(targetUrl, (apiRes) => {
        let body = '';
        apiRes.on('data', chunk => body += chunk);
        apiRes.on('end', () => {
            res.setHeader('Content-Type', 'application/json');
            res.end(body);
        });
    }).on('error', (err) => {
        res.writeHead(500);
        res.end('Error: ' + err.message);
    });
});

server.listen(3001, () => console.log('Proxy running on http://localhost:3001'));