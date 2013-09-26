//
// start/stop server
//
var cruvee = require('./cruvee.js');

var log = require('./logging.js');
; (function () {

  // start main processing
  exports.start = function() {
    log.info("Main started");
  };

  exports.start();

}).call(this);