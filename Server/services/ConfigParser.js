var fs = require('fs')

ConfigParser = function(options) {

  try {

    // Read config file
    var data = fs.readFileSync('config.json')

    options.logger.log('info', 'Loading config file...')
    this.config = JSON.parse(data)

  } catch (err) {

    options.logger.log('error', 'There has been an error parsing the config file.')
    throw err

  }

}

ConfigParser.prototype.get = function(key) {
  // error catching ?
  return this.config[key]
}

module.exports = ConfigParser