// require module
const raspberryPiCamera = require('raspberry-pi-camera-native');
const express = require('express')
const app = express();
const port = 3000;

options = {
  width: 1280,
  height: 720,
  fps: 30,
  encoding: 'JPEG',
  quality: 75
}

app.get('/', (req, res) => {
  // start capture
  raspberryPiCamera.start(options);

  resourcePath = '/stream.mjpg';

  res.writeHead(200, {
    'Cache-Control': 'no-store, no-cache, must-revalidate, pre-check=0, post-check=0, max-age=0',
    Pragma: 'no-cache',
    Connection: 'close',
    'Content-Type': 'multipart/x-mixed-replace; boundary=--myboundary'
  })
})

app.use(express.static(__dirname + '/public'));
app.listen(port, () => console.log(`Example app listening on port ${port}! In your web browser, navigate to http://<IP_ADDRESS_OF_THIS_SERVER>:3000`));
