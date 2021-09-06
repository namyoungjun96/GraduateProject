var http = require('http');
var url = require('url');

http.createServer(function (req, res) {
    var parsedUrl = url.parse(req.url);
    // 2. parsing 된 url 중에 서버URI에 해당하는 pathname 만 따로 저장
    response = parsedUrl.pathname;

    if(response == '/request_behavior') {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end("Hello World!");
    }
}).listen(80);