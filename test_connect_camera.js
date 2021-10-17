const { StreamCamera, Codec } = require("pi-camera-connect");

const fs = require("fs");
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

const runApp = async () => {
  const streamCamera = new StreamCamera({
    codec: Codec.H264,
  });
  // streamCamera 객체를 만든다.

  const videoStream = streamCamera.createStream();

  const writeStream = fs.createWriteStream("video-stream.h264");
  // 비디오 스트림 파일을 h264형식으로 만든다.

  // Pipe the video stream to our video file
  videoStream.pipe(writeStream);

  await streamCamera.startCapture();

  // We can also listen to data events as they arrive
  videoStream.on("data", (data) => console.log("New data", data));
  // 버퍼 찍는다
  videoStream.on("end", (data) => console.log("Video stream has ended"));

  // Wait for 5 seconds
  //await new Promise((resolve) => setTimeout(() => resolve(), 5000));

  //await streamCamera.stopCapture();
};

runApp();
