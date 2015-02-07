// Bootstrap an Express app
var express = require('express')
var app = express()

// Consolidate, to make beautiful templates in nunjucks
var cons = require('consolidate');

// Assign the swig engine to .html files
app.engine('html', cons.nunjucks);

// Set .html as the default extension
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

// Add Logger
var logger = require('./services/Logger')

// Add config module
var CONFIG = require('./services/ConfigParser')
var config = new CONFIG({ 'logger': logger })

// Add DB Driver
var DB = require('./services/DBDriver');
var db = new DB({ 'logger': logger, 'config': config })

// Add DB Driver
var XBEE = require('./xbee/XBeeDriver');
var xbee = new XBEE({ 'logger': logger, 'config': config, 'callback': function(frame) { db.insertFrame(frame); } })

// Useful stuff
now = function() { return Math.ceil((new Date).getTime()); }

// Time window
var time_window = 30 * 60 * 1000 // (30 minutes)

logger.log('info', now())

/* **** HOME ****
  Should display : 
    - list of sensors (with ID / Name) that are supposed "alive" (= that sent a packet recently)
    - The graphed data, combined
*/
app.get('/', function(req, res, next) {

  var complete = function() {

    callbacks += 1

    if (callbacks == 2) {
      req.sensors = sensors
      req.data = data
      next()
    }
  
  }

  var callbacks = 0

 // Get all sensors, by type
  var sensors = {}
  db.getSensorList(sensors, { 'since' : now() - time_window, callback: complete })

  // Get the graph data
  var data = {}
  db.getAllData(data, { 'since' : now() - time_window, callback: complete })

},
function (req, res) {

    res.render('index', {
      title: 'Home',
      time_window: int(time_window/1000),
      sensors: req.sensors,
      data: JSON.stringify(req.data)
    })

})

// Start application
var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  logger.log('success', 'Low Power Analog Sensor Network Server is starting at http://' + host + ':' + port)

})
