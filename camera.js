var RaspiCam = require("raspicam");

var camera = new RaspiCam({ opts });

//to take a snapshot, start a timelapse or video recording
camera.start( );

//to stop a timelapse or video recording
camera.stop( );

//listen for the "start" event triggered when the start method has been successfully initiated
camera.on("start", function(){
	//do stuff
});

//listen for the "read" event triggered when each new photo/video is saved
camera.on("read", function(err, timestamp, filename){ 
	//do stuff
});

//listen for the "stop" event triggered when the stop method was called
camera.on("stop", function(){
	//do stuff
});

//listen for the process to exit when the timeout has been reached
camera.on("exit", function(){
	const inFilename = "/home/pi/temp/video/video.h264";
	const outFilename = "/home/pi/temp/video/" + filename + ".mp4";


});

class Camera_mod{
	constructor(width, height, mode, output) {
		this.width = width;
		this.height = height;
		this.mode = mode;
		this.output = output;
	}
}