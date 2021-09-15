const http = require('http');
const fs = require('fs');
const mime = require('mime');

const Gpio = require('onoff').Gpio;
const LED = new Gpio(18, 'out');
// n번포트 사용

const RaspiCam = require("raspicam");
const { sleep } = require('raspicam/lib/fn');

const cameraOptions = {
    width: 1920,
    height: 1080,
    mode: "video",      // 동영상 촬영 모드
    output: "/home/pi/temp/video/video.h264"
    //timeout: ,        촬영 시간
};

const camera = new RaspiCam(cameraOptions);

const ffmpeg = require("fluent-ffmpeg");
const { runInNewContext } = require('vm');
//to take a snapshot, start a timelapse or video recording

const server = http.createServer()

server.on('request', (req, res) => {
    if (req.url == '/request_behavior') {
        const date = new Date();
        const filename = date.getFullYear() + "" + date.getMonth() + "" + date.getDate() + "" + date.getHours() + "" +
            date.getMinutes() + "" + date.getSeconds();
        console.log("camera start");
        console.log("cameraOptions mode : " + cameraOptions.mode);
        camera.start();

        camera.once("exit", function () {
            const inFilename = "/home/pi/temp/video/video.h264";
            const outFilename = "/home/pi/temp/video/" + filename + ".mp4";

            console.log("convert start");

            ffmpeg(inFilename)
                .outputOptions("-c:v", "copy") // this will copy the data instead or reencode it
                .save(outFilename)
                .once('end', function () {
                    console.log('convert end');
                    
                    console.log("push video start");
                    const videoMime = mime.getType(outFilename);
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
                    console.log("push video end");
                })
            console.log("camera END ");
        });
    } 

    else if (response == '/on') {
        console.log("LED start");
        isLED();
        console.log("LED end");

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end("Hello World!");
    } 

    else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('404 Page Not Found');
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