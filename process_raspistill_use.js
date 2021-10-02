var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var path = require('path');
var requestIp = require('request-ip');
var mime = require('mime');
var cameraCheck = 0;
const Gpio = require('onoff').Gpio;
const LED = new Gpio(18, 'out');
// n번포트 사용

var checkNum=0;

var spawn = require('child_process').spawn;
var proc;

app.use('/', express.static(path.join(__dirname, 'stream')));

app.get('/', function (req, res) {
    console.log("client IP: " + requestIp.getClientIp(req));
    res.sendFile(__dirname + '/index.html');
});

app.get('/request_behavior', function (req, res) {
    var imgPath = "./stream/image_stream.jpg";
    var imgMime = mime.getType(imgPath);

    fs.readFile(imgPath, function (error, data) {
        if (error) {
            console.log("file error");
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end('500 Internal Server ' + error);
        } else {
            console.log("file success");
            // 6. Content-Type 에 4번에서 추출한 mime type 을 입력
            res.writeHead(200, {
                "Content-Disposition": "attachment;filename=img_stream.jpg",
                'Content-Type': imgMime
            });
            res.end(data);
        }
    });
})

var sockets = {};

io.on('connection', function (socket) {

    sockets[socket.id] = socket;
    console.log("Total clients connected : ", Object.keys(sockets).length);

    socket.on('disconnect', function () {
        delete sockets[socket.id];

        // no more sockets, kill the stream
        stopStreaming();
    });

    socket.on('start-stream', function () {
        startStreaming(io);
    });

    socket.on('onFinger', function () {
        ledOn();
    })

    socket.on('offFinger', function () {
        ledOff();
    })
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});

function stopStreaming() {
    if (Object.keys(sockets).length == 0) {
        app.set('watchingFile', false);
        if (proc) proc.kill();
        fs.unwatchFile('./stream/image_stream.jpg');
        cameraCheck = 0;
        console.log('Watching for changes... : '+cameraCheck);
    }
}

function startStreaming(io) {
    if (app.get('watchingFile')) {
        io.sockets.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 100000));
        return;
    }

    if (cameraCheck == 0) {
        var args = ["-w", "640", "-h", "480", "-vf", "-o", "./stream/image_stream.jpg", "-t", "999999999", "-tl", "50"];
        proc = spawn('raspistill', args);

        cameraCheck = 1;
    }

    console.log('Watching for changes... : '+cameraCheck);
    app.set('watchingFile', true);

    fs.watchFile('./stream/image_stream.jpg', { bigint: false, persistent: true, interval: 1000 }, function (current, previous) {
        // 파일을 base 64로 인코딩 하기  
        var base64str = base64_encode('./stream/image_stream.jpg');
        io.sockets.emit('liveStream', { image: true, buffer: base64str });
        const trade_date = new Date().toLocaleString()
        checkNum++;
        console.log(checkNum + ", " + trade_date);
    })
}

// 파일시스템 모듈을 이용하여 이미지를 읽은후 base64로 인코딩하기  
function base64_encode(file) {
    // 바이너리 데이터 읽기 file 에는 파일의 경로를 지정  
    var bitmap = fs.readFileSync(file);
    //바이너리 데이터를 base64 포멧으로 인코딩하여 스트링 획등  
    return new Buffer(bitmap).toString('base64');
}

function isLED() {
    if (LED.readSync() == 0) {
        // LED가 꺼져있을 경우
        console.log("LED ON");
        LED.writeSync(1);
    } else {
        console.log("LED off");
        LED.writeSync(0);
    }
}

function ledOn() {
    LED.writeSync(1);
}

function ledOff() {
    LED.writeSync(0);
}

