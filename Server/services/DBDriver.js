var sqlite3 = require('sqlite3').verbose()

DBDriver = function(options) {

  try {
    this.db = new sqlite3.Database(options.config.get('db').path)
  } catch(e) {
    throw e
  }

  this.log = options.logger.log

  // Create table if not exist
  this.log("info", "Creating data points table if it doesn't exist ...")
  this.db.run("CREATE TABLE IF NOT EXISTS " + options.config.get('db').table_name + " (id int, date DATETIME, type VARCHAR(2), endpoint_id INT, value FLOAT, ref_voltage INT)")

}

var p = DBDriver.prototype

p.insertFrame = function(frame) {

  var stmt = this.db.prepare("INSERT INTO datapoints ('date', 'type', 'endpoint_id', 'value', 'ref_voltage') VALUES (?, ?, ?, ?, ?)")
  stmt.run(now(), frame.type, frame.id, frame.value, frame.ref_voltage, (function() {
    this.log("success", "Frame inserted.")
  }).bind(this))

  stmt.finalize()
          
} 

p.getSensorList = function(data, options) {

  this.db.each("SELECT `type`, `endpoint_id`, case when `date` > ? then 1 else 0 end as active FROM datapoints GROUP BY `type`, `endpoint_id`", options.since, function(err, row) {
      
      if (!(row.type in data)) {
        data[row.type] = []
      }
      data[row.type].push({'id': row.endpoint_id, 'active': (row.active==1)?true:false })

  }, options.callback)
          
} 

p.getAllData = function(data, options) {

  var tmp = []

  this.db.each("SELECT `type`, `endpoint_id`, `value`, `date` FROM datapoints WHERE `date` > ?", options.since, function(err, row) {

      if (!(row.type in tmp)) {
        tmp[row.type] = []
        tmp[row.type][row.endpoint_id] = {
          "values": []
        }
      }

      // Then insert
      tmp[row.type][row.endpoint_id]["values"].push({'value': row.value, 'timestamp': row.date})

  }, function() {

    // Reformat
    for (type in tmp) {
      data[type] = []
      for (endpoint_id in tmp[type]) {
          data[type].push({
            "label": endpoint_id,
            "values": tmp[type][endpoint_id]["values"]
          })
      }
    }

    options.callback()

  })
          
} 

module.exports = DBDriver
