var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var path = require('path');
var requestIp = require('request-ip');

var spawn = require('child_process').spawn;
var proc;

app.use('/', express.static(path.join(__dirname, 'stream')));


app.get('/', function (req, res) {
    console.log("client IP: " +requestIp.getClientIp(req));
    res.sendFile(__dirname + '/index.html');
});

var sockets = {};

io.on('connection', function (socket) {

    sockets[socket.id] = socket;
    console.log("Total clients connected : ", Object.keys(sockets).length);

    socket.on('disconnect', function () {
        delete sockets[socket.id];

        // no more sockets, kill the stream
        if (Object.keys(sockets).length == 0) {
            app.set('watchingFile', false);
            if (proc) proc.kill();
            fs.unwatchFile('./stream/image_stream.jpg');
        }
    });

    socket.on('start-stream', function () {
        startStreaming(io);
    });

});

http.listen(3000, function () {
    console.log('listening on *:3000');
});

function stopStreaming() {
    if (Object.keys(sockets).length == 0) {
        app.set('watchingFile', false);
        if (proc) proc.kill();
        fs.unwatchFile('./stream/image_stream.jpg');
    }
}

function startStreaming(io) {

    if (app.get('watchingFile')) {
        io.sockets.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 100000));
        return;
    }

    var args = ["-w", "640", "-h", "480", "-o", "./stream/image_stream.jpg", "-t", "999999999", "-tl", "50"];
    proc = spawn('raspistill', args);

    console.log('Watching for changes...');

    app.set('watchingFile', true);

    fs.watchFile('./stream/image_stream.jpg', { bigint: false,persistent: true, interval: 1000}, function (current, previous) {
        // 파일을 base 64로 인코딩 하기  
        var base64str = base64_encode('./stream/image_stream.jpg');
        io.sockets.emit('liveStream', { image: true, buffer: base64str });
    })
}

// 파일시스템 모듈을 이용하여 이미지를 읽은후 base64로 인코딩하기  
function base64_encode(file) {
    // 바이너리 데이터 읽기 file 에는 파일의 경로를 지정  
    var bitmap = fs.readFileSync(file);
    //바이너리 데이터를 base64 포멧으로 인코딩하여 스트링 획등  
    return new Buffer(bitmap).toString('base64');
}

// base64포멧의 스트링을 디코딩하여 파일로 쓰는 함수  
function base64_decode(base64str, file) {
    // 버퍼 객체를 만든후 첫번째 인자로 base64 스트링, 두번째 인자는 파일 경로를 지정 파일이름만 있으면 프로젝트 root에 생성  
    var bitmap = new Buffer(base64str, 'base64');
    // 버퍼의 파일을 쓰기  
    fs.writeFileSync(file, bitmap);
    console.log('******** base64로 인코딩되었던 파일 쓰기 성공 ********');
}
