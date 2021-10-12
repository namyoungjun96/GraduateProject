// require module
const raspberryPiCamera = require("raspberry-pi-camera-native");
const fs = require("fs");
const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const requestIp = require("request-ip");
const mime = require("mime");
const Gpio = require("onoff").Gpio;
const LED1 = new Gpio(23, "out");
const LED2 = new Gpio(24, "out");

const port = 3000;
var cameraCheck = 0;
var num = 0;

const cameraOptions = {
  width: 320,
  height: 240,
  fps: 2,
  encoding: "JPEG",
  quality: 80,
};

//app.use(express.static(__dirname + '/public'));

app.get("/", (req, res) => {
  console.log("client IP: " + requestIp.getClientIp(req));
  res.sendFile(__dirname + "/index.html");
});

app.get("/request_behavior", function (req, res) {
  var imgPath = "./image_stream.jpg";
  var imgMime = mime.getType(imgPath);

  fs.readFile(imgPath, function (error, data) {
    if (error) {
      console.log("file error");
      res.writeHead(500, { "Content-Type": "text/html" });
      res.end("500 Internal Server " + error);
    } else {
      console.log("file success");
      // 6. Content-Type 에 4번에서 추출한 mime type 을 입력
      res.writeHead(200, {
        "Content-Disposition": "attachment;filename=img_stream.jpg",
        "Content-Type": imgMime,
      });
      res.end(data);
    }
  });
});

app.get("/led1On", function (req, res) {
  console.log("call led1On");
  console.log("led status :" + LED1.readSync());
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

http.listen(port, function () {
  console.log("listening on * : " + port);
});

var sockets = {};

io.on("connection", function (socket) {
  sockets[socket.id] = socket;
  console.log("Total clients connected : ", Object.keys(sockets).length);

  socket.emit("storeImage");

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
      raspberryPiCamera.start(cameraOptions, function () {
        console.log("camera start");
      });
      cameraCheck = 1;
    }

    app.set("watchingFile", true);

    fs.watchFile(
      "./image_stream.jpg",
      { bigint: false, persistent: true, interval: 500 },
      function (current, previous) {
        // 파일을 base 64로 인코딩 하기
        var base64str = base64_encode("./image_stream.jpg");

        io.sockets.emit("liveStream", { image: true, buffer: base64str });
        /*const trade_date = new Date().toLocaleString()
            checkNum++;
            console.log(checkNum + ", " + trade_date);*/
      }
    );
  });
});

// add frame data event listener
raspberryPiCamera.on("frame", (photo) => {
  // frameData is a Node.js Buffer
  // ...
  fs.writeFile("./image_stream.jpg", photo, (err) => {
    if (err) return console.error(err);
  });
});

function base64_encode(file) {
  // 바이너리 데이터 읽기 file 에는 파일의 경로를 지정
  var bitmap = fs.readFileSync(file);
  //바이너리 데이터를 base64 포멧으로 인코딩하여 스트링 획등
  return new Buffer(bitmap).toString("base64");
}

function ledOn(led) {
  led.writeSync(1);
  // LED상태 켜기
}

function ledOff(led) {
  led.writeSync(0);
  // LED상태 끄기
}
