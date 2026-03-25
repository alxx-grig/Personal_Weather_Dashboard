const http = require('http'); // Dashboard talks to this
const https = require('https'); // UCF website talks to this

const server = http.createServer((req, res) => { // Sets up a "listener" that waits for the dashboard to send a request to the server to run the code
    res.setHeader('Access-Control-Allow-Origin', '*'); // Acts as the 'permission slip' that tells the browser that it is okay to send the information (CORS killer)

    const targetUrl = 'https://ucf.transloc.com/Services/JSONPRelay.svc/GetStopArrivalTimes?apiKey=8882812681&stopIds=54&version=2';

    https.get(targetUrl, (apiRes) => {
        let body = '';
        apiRes.on('data', chunk => body += chunk); // Adds the chunks together that come from the internet into the 'body' variable
        apiRes.on('end', () => {
            res.setHeader('Content-Type', 'application/json'); 
            res.end(body); // Once all of the chunks are recieved, tell the dashboard it's getting info, and the send that info
        });
    }).on('error', (err) => { // Error handling, prevents crashing
        res.writeHead(500);
        res.end('Error: ' + err.message);
    });
});

// Places proxxy server in port 3001 and sends a message in console to let us know it's up
server.listen(3001, () => console.log('Proxy running on http://localhost:3001'));