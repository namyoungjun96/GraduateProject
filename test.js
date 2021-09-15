/*var NodeWebcam = require( "node-webcam" );
//Default options

var opts = {
    //Picture related
    width: 1280,
    height: 720,
    quality: 100,
    // Number of frames to capture
    // More the frames, longer it takes to capture
    // Use higher framerate for quality. Ex: 60
    frames: 60,
    //Delay in seconds to take shot
    //if the platform supports miliseconds
    //use a float (0.1)
    //Currently only on windows
    delay: 0,
    //Save shots in memory
    saveShots: true,
    // [jpeg, png] support varies
    // Webcam.OutputTypes
    output: "jpeg",
    //Which camera to use
    //Use Webcam.list() for results
    //false for default device
    device: false,
    // [location, buffer, base64]
    // Webcam.CallbackReturnTypes
    callbackReturn: "location",
    //Logging
    verbose: false
};

//Creates webcam instance
var Webcam = NodeWebcam.create( opts );

//Will automatically append location output type
Webcam.capture( "test_picture", function( err, data ) {} );

//Also available for quick use
NodeWebcam.capture( "test_picture", opts, function( err, data ) {
});

//Get list of cameras
Webcam.list( function( list ) {
    //Use another device
    var anotherCam = NodeWebcam.create( { device: list[ 0 ] } );
});

//Return type with base 64 image
var opts = {
    callbackReturn: "base64"
};

NodeWebcam.capture( "test_picture", opts, function( err, data ) {
    var image = "<img src='" + data + "'>";
});*/

var http = require('http');
var url = require('url');

var MP4Box = require('mp4box'); // Or whatever import method you prefer.
var mp4boxfile = MP4Box.createFile();

var ffmpeg = require('ffmpeg');

var camera = ffmpeg()
  .input('/dev/video0')
  .inputFormat('mov')
  .input('/home/pi/temp/file.avi')
  .inputFormat('avi');

http.createServer(function (req, res) {
    var parsedUrl = url.parse(req.url);
    // 2. parsing 된 url 중에 서버URI에 해당하는 pathname 만 따로 저장
    response = parsedUrl.pathname;

    if(response == '/test'){
        console.log("camera start");
        console.log(camera);
        console.log("camera end");

        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end("Hello World!");
    }
}).listen(8080);

//ffmpeg -f video4linux2 -r 25 -s 640x480 -t 00:10 -i /dev/video0 out.avi

mp4boxfile.onReady = function (info) {
    

	console.log("Received File Information");
}

