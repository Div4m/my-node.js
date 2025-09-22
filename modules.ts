import http, { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';

const __dirname = path.resolve(); 
const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
    if (req.url === '/') {
        const filePath = path.join(__dirname, 'hellos.txt');
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('error reading file');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(data);
        });
    } else if (req.url === '/home') {
        res.writeHead(200, { 'Content-Type': 'text/plain'});
        res.end('Welcome to the Home page');
    } else if (req.url === '/about') {
        res.writeHead(200, { 'Content-Type': 'text/plain'});
        res.end('Welcome to the About page');
    } else if (req.url === '/system') {
        const systemInfo = {
            platform: os.platform(),
            arch: os.arch(),
            freemem: os.freemem(),
            totalmem: os.totalmem(),
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(systemInfo, null, 2));
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('page not found');
    }
});
    const PORT = 4000;
    server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
