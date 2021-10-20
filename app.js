const fs = require("fs");
const cors = require("cors");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
const requestIp = require("request-ip");
const mime = require("mime");
const Gpio = require("onoff").Gpio;
const LED1 = new Gpio(23, "out");
const LED2 = new Gpio(24, "out");

const RaspiCam = require("raspicam");

const videoOptions = {
  width: 1920,
  height: 1080,
  mode: "video", // 동영상 촬영 모드
  output: "/home/pi/temp/video/video.h264",
  //timeout: ,        촬영 시간
};

const video = new RaspiCam(videoOptions);

const ffmpeg = require("fluent-ffmpeg");
//to take a snapshot, start a timelapse or video recording

const port = 3000;
var cameraCheck = 0;
var num = 0;

const { StreamCamera, Codec, SensorMode } = require("pi-camera-connect");
var videoStream;
var writeStream;

const cameraOptions = {
  fps: 15,
  codec: Codec.MJPEG,
  sensorMode: 5,
  bitRate: 12000000,
  //bitRate: 17000000,
};

app.use(cors());

app.get("/", (req, res) => {
  console.log("client IP: " + requestIp.getClientIp(req));
  res.sendFile(__dirname + "/index.html");
});

app.get("/request", (req, res) => {
  streamCamera.stopCapture();
  //streamCamera.on("end", endCamera);
  console.log("camera stop");

  const date = new Date();
  const filename = "userVideo";
  console.log("camera start");
  console.log("cameraOptions mode : " + videoOptions.mode);
  video.start();

  video.once("exit", function () {
    const inFilename = "/home/pi/temp/video/video.h264";
    const outFilename = filename + ".mp4";

    console.log("convert start");

    ffmpeg(inFilename)
      .outputOptions("-c:v", "copy") // this will copy the data instead or reencode it
      .save(outFilename)
      .once("end", function () {
        endCamera("stop");
        console.log("convert end");

        console.log("push video start");
        const videoMime = mime.getType(outFilename);
        fs.readFile(outFilename, function (error, data) {
          if (error) {
            console.log("file error");
            res.writeHead(500, { "Content-Type": "text/html" });
            res.end("500 Internal Server " + error);
          } else {
            console.log("file success");
            // 6. Content-Type 에 4번에서 추출한 mime type 을 입력
            res.writeHead(200, {
              "Content-Disposition": "attachment;filename=" + outFilename,
              "Content-Type": videoMime,
            });
            res.end(data);
          }
        });
        console.log("push video end");
      });
    console.log("camera END ");
  });
});

app.post("/led1State", function (req, res) {
  res.send(String(LED1.readSync()));
  //res.writeHead(200, { "Content-Type": "text/html" });
  //res.end();
});

app.post("/led2State", function (req, res) {
  res.send(String(LED2.readSync()));
  //res.writeHead(200, { "Content-Type": "text/html" });
  //res.end();
});

app.get("/led1On", function (req, res) {
  console.log("call led1On");
  ledOn(LED1);
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end();
});

app.get("/led1Off", function (req, res) {
  console.log("call led1Off");
  ledOff(LED1);
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end();
});

app.get("/led2On", function (req, res) {
  console.log("call led2On");
  ledOn(LED2);
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end();
});

app.get("/led2Off", function (req, res) {
  console.log("call led2Off");
  ledOff(LED2);
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end();
});

server.listen(port, function () {
  console.log("listening on * : " + port);
  startCamera();
});

var sockets = {};

io.on("connection", function (socket) {
  sockets[socket.id] = socket;
  console.log("Total clients connected : ", Object.keys(sockets).length);
  var i = 0;

  socket.on("disconnect", function () {
    delete sockets[socket.id];
    //raspberryPiCamera.stop();

    // no more sockets, kill the stream
  });

  socket.on("start-stream", function () {
    /*if (app.get('watchingFile')) {
            io.sockets.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 100000));
            return;
        }*/

    if (cameraCheck == 0) {
      // start capture
      cameraCheck = 1;
      streamCamera.startCapture();
      streamCamera.on("frame", dataToBuffer);
    }

    app.set("watchingFile", true);
  });
});

function dataToBuffer(data) {
  //console.log("data : " + data);

  io.sockets.emit("liveStream", {
    image: true,
    buffer: data.toString("base64"),
  });
}

function endCamera(data) {
  if (Object.keys(sockets).length > 0) {
    streamCamera.startCapture();
  }
}

function ledOn(led) {
  led.writeSync(1);
  // LED상태 켜기
}

function ledOff(led) {
  led.writeSync(0);
  // LED상태 끄기
}

function startCamera() {
  streamCamera = new StreamCamera(cameraOptions);
  videoStream = streamCamera.createStream();
  writeStream = fs.createWriteStream("video-stream.h264");
  videoStream.pipe(writeStream);
}
