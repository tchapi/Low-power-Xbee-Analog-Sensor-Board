var xbee_api = require('xbee-api')
var C = xbee_api.constants
var serialport = require("serialport")
var SerialPort = serialport.SerialPort

// Node Identifier command
var NI_command = { // AT Request to be sent to 
  type: C.FRAME_TYPE.AT_COMMAND,
  command: "NI", // Node identifier
  commandParameter: [],
}

XBeeDriver = function(options) {

  this.log = options.logger.log
  this.config = options.config
  this.callback = options.callback

  this.xbeeAPI = new xbee_api.XBeeAPI({
    api_mode: this.config.get('xbee').api_mode
  })

  // Flag to know if the Xbee is ready to receive frames
  this.ready = false

  this.initiateXBeeCommunication()

}

var p = XBeeDriver.prototype


// Creates a serial port for the Xbee
p.initiateXBeeCommunication = function() {

  this.sp = new SerialPort(this.config.get('xbee').port, {
    baudrate: 9600,
    parser: this.xbeeAPI.rawParser()
  })

  // A handler in case of error
  this.sp.on( "error", (function(msg) {
      this.log("error", msg.toString('utf8'))
      process.exit() // Bye bye
  }).bind(this));

  // Open the connection
  this.sp.on("open", (function() {
    this.log('info', "Port " + this.config.get('xbee').port + " open")
    this.getRadioName()
  }).bind(this))

}

p.getRadioName = function() {

  this.xbeeAPI.on("frame_object", (function(frame) { 

    if (frame.type == C.FRAME_TYPE.AT_COMMAND_RESPONSE && frame.command == "NI" && frame.commandStatus == 0x00 ) {
      // The Xbee has given its name, let's display it and
      this.ready = true;
      this.name = frame.commandData.toString('utf8')
      this.log('success', "Xbee " + this.name + " is ready.\n\r")

      this.xbeeAPI.removeAllListeners()

      this.log('info', "Starting listening to XBee Radio ...")
      this.startListening()
    }

  }).bind(this));

  this.sp.write(this.xbeeAPI.buildFrame(NI_command))

}

p.startListening = function() {

  // All frames parsed by the XBee will be emitted here
  this.xbeeAPI.on("frame_object", (function(frame) { 

      if (frame.type == C.FRAME_TYPE.ZIGBEE_EXPLICIT_RX) {

        frameAsString = frame.data.slice(6).toString('utf8') // We have to take the first 6 bytes out
        frameAsArray = frameAsString.split('\n\r')[0].split(',')

        // Look for an id
        if (typeof frameAsArray[1] !== 'undefined') {

          current_frame = {
            "type": frameAsArray[0],
            "id": parseInt(frameAsArray[1]),
            "value": parseFloat(frameAsArray[2]),
            "ref_voltage": parseInt(frameAsArray[3]),
            "offset": parseInt(frameAsArray[4])
          }
          
          this.log('info', "Data frame from " + current_frame.type + current_frame.id)

          // Manage offset here ? TODO

          this.callback(current_frame)

        } else {

          this.log('warn', "Received a non-data frame : " + frameAsString)

        }

      }

  }).bind(this))

}


module.exports = XBeeDriver
