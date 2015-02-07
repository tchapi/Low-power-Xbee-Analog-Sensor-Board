var colors = require('colors')

var DEFAULT_DEBUG_LEVEL = 'warn'
var LEVELS = ['error', 'warn', 'info', 'success']
var PREFIXES = {
  'error': "Error".red.bold,
  'warn': "Warning".yellow,
  'info': "Info".blue,
  'success': "Success".green,
}

Logger = function () {
  this.debugLevel = DEFAULT_DEBUG_LEVEL
}

var p = Logger.prototype

p.log = function(level, message) {

  if (LEVELS.indexOf(level) >= LEVELS.indexOf(this.debugLevel) ) {
    if (typeof message !== 'string') {
      message = JSON.stringify(message)
    }
    console.log(PREFIXES[level] + ' : ' + message)
  }

}

module.exports = new Logger()
