const videoStream = require('./videoStream');
const fs = require('fs');
const app = require('express')();
const http = require('http').Server(app);
const port = 3000;
const io = require('socket.io')(http);

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  io.emit('stream', videoStream.acceptConnections(app, {
    width: 1280,
    height: 720,
    fps: 10,
    encoding: 'JPEG',
    quality: 7 // lower is faster, less quality
  },
    '/stream.mjpg', false));
});

//app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/client.html');
});

app.get('/stream', (req, res) => {
  res.sendFile(__dirname + '/stream.html');
})

http.listen(port, () => console.log(`Example app listening on port ${port}! In your web browser, navigate to http://<IP_ADDRESS_OF_THIS_SERVER>:3000`));
