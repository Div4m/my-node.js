const http = require('http');

const server = http.createServer((req,res) =>{
    if (req.url === '/'){
        res.writeHead(200,{'Content-Type':'text/plain'});
        res.end('Welcome to home page');
    }else if (req.url === '/about'){
        res.writeHead(200,{'Content-Type':'text/plain'});
        res.end('Welcome to about page');
    }else {
        res.writeHead(404,{'Content-Type':'text/plain'});
        res.end('page not found');
    }
});
const PORT  = 3000;
server.listen(PORT,'localhost',() =>{
      console.log("Server is running on http://localhost:3000");
});