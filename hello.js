var http = require('http');
var url = require('url');
const fs = require('fs');
var mime = require('mime');

var Gpio = require('onoff').Gpio;
var LED = new Gpio(18, 'out');
// n번포트 사용

var RaspiCam = require("raspicam");
const { sleep } = require('raspicam/lib/fn');

var cameraOptions = {
    width: 1920,
    height: 1080,
    mode: "video",      // 동영상 촬영 모드
    output: "/home/pi/temp/video/video.h264"
    //timeout: ,        촬영 시간
};

var camera = new RaspiCam(cameraOptions);

var ffmpeg = require("fluent-ffmpeg");
//to take a snapshot, start a timelapse or video recording

http.createServer(function (req, res) {
    var parsedUrl = url.parse(req.url);
    // 2. parsing 된 url 중에 서버URI에 해당하는 pathname 만 따로 저장
    response = parsedUrl.pathname;

    if (response == '/request_behavior') {
        const date = new Date();
        const filename = date.getFullYear() + "" + date.getMonth() + 1 + "" + date.getDate() + "" + date.getHours() + "" +
            date.getMinutes() + "" + date.getSeconds();
        console.log("camera start");
        console.log("cameraOptions mode : " + cameraOptions.mode);
        camera.start();

        camera.on("exit", function () {
            var inFilename = "/home/pi/temp/video/video.h264";
            var outFilename = "/home/pi/temp/video/" + filename + ".mp4";

            ffmpeg(inFilename)
                .outputOptions("-c:v", "copy") // this will copy the data instead or reencode it
                .save(outFilename)
                .on('end', function () {
                    console.log('Finished processing');

                    var videoMime = mime.getType(outFilename);
                    console.log('mime=' + videoMime);

                    fs.readFile(outFilename, function (error, data) {
                        if (error) {
                            console.log("file error");
                            res.writeHead(500, { 'Content-Type': 'text/html' });
                            res.end('500 Internal Server ' + error);
                        } else {
                            console.log("file success");
                            // 6. Content-Type 에 4번에서 추출한 mime type 을 입력
                            res.writeHead(200, { 'Content-Type': videoMime });
                            res.end(data);
                        }
                    });
                })

            console.log("camera END ");
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('404 Page Not Found');
    }

    if (response == '/on') {
        console.log("LED start");
        isLED();
        console.log("LED end");

        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end("Hello World!");
    }
}).listen(8080);

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