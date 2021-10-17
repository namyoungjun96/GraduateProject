const events = require("events");

const RaspberryPiCameraNative = require("bindings")(
  "raspberry-pi-camera"
).Native;

class RaspberryPiCamera extends events.EventEmitter {
  constructor() {
    super();

    this._native = new RaspberryPiCameraNative((data) => this._onData(data));
    this._frameData = [];
  }

  start(options, callback) {
    let err = undefined;

    try {
      this._native.start(options);
    } catch (e) {
      e = err;
    }

    if (callback) {
      process.nextTick(() => {
        callback(err);
      });
    } else if (err) {
      throw err;
    }
  }

  pause(callback) {
    let err = undefined;

    try {
      this._native.pause();
    } catch (e) {
      e = err;
    }

    if (callback) {
      process.nextTick(() => {
        callback(err);
      });
    } else if (err) {
      throw err;
    }
  }

  resume() {
    let err = undefined;

    try {
      this._native.resume();
    } catch (e) {
      e = err;
    }

    if (callback) {
      process.nextTick(() => {
        callback(err);
      });
    } else if (err) {
      throw err;
    }
  }

  stop(callback) {
    let err = undefined;

    try {
      console.log("try start");
      this._native.stop();
      console.log("try stop");
    } catch (e) {
      console.log("catch error");
      e = err;
    }

    if (callback) {
      process.nextTick(() => {
        console.log("if callback error");
        callback(err);
      });
    } else if (err) {
      console.log("else if error");
      throw err;
    }
  }

  _onData(data) {
    this.emit("data", data);

    this._frameData.push(data);

    if (data.length < 81920) {
      let frame = Buffer.concat(this._frameData);

      this.emit("frame", frame);

      this._frameData = [];
    }
  }
}

module.exports = RaspberryPiCamera;
