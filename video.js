// require module
const raspberryPiCamera = require('raspberry-pi-camera-native');
const fs = require('fs');
const app = require('express')();
const http = require('http').Server(app);
const port = 3000;
const io = require('socket.io')(http);

// add frame data event listener
raspberryPiCamera.on('frame', (frameData) => {
    // frameData is a Node.js Buffer
    // ...
    console.log(frameData);
    base64_decode(frameData, './stream/image_stream.jpg');
});

//app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    const cameraOptions = {
        width: 1280,
        height: 720,
        fps: 10,
        encoding: 'JPEG',
        quality: 75
    }

    // start capture
    raspberryPiCamera.start(cameraOptions);

    res.sendFile(__dirname + '/stream.html');
});

http.listen(port, () => console.log(`Example app listening on port ${port}! In your web browser, navigate to http://<IP_ADDRESS_OF_THIS_SERVER>:3000`));