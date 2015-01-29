var sqlite3 = require('sqlite3').verbose()

// Useful stuff
var now = function() { return Math.ceil((new Date).getTime() / 1000); }

DBDriver = function(options) {

  try {
    this.db = new sqlite3.Database(options.config.get('db').path)
  } catch(e) {
    throw e
  }

  this.log = options.logger.log

  // Create table if not exist
  this.log("info", "Creating data points table if it doesn't exist ...")
  this.db.run("CREATE TABLE IF NOT EXISTS datapoints (id int, date DATETIME, type VARCHAR(2), endpoint_id INT, value FLOAT, ref_voltage INT)")

}

var p = DBDriver.prototype

p.insertFrame = function(frame) {

  var stmt = this.db.prepare("INSERT INTO datapoints ('date', 'type', 'endpoint_id', 'value', 'ref_voltage') VALUES (?, ?, ?, ?, ?)")
  stmt.run(now(), frame.type, frame.id, frame.value, frame.ref_voltage)
  
  this.log("success", "Frame inserted.")

  return stmt.finalize()
          
} 

module.exports = DBDriver
