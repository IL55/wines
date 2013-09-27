//
// start/stop server
//
var cruvee = require('./cruvee.js');
var log = require('./logging.js');
var config = require('./config.js');
var agent = require('superagent');
var _ = require('underscore');

; (function () {

  process.on('uncaughtException', function (err) {
    log.debug( "UNCAUGHT EXCEPTION " );
    log.debug( "[Inside 'uncaughtException' event] " + err.stack || err.message );
  });

  // start main processing
  exports.start = function() {
    log.info("Main started");

    cruvee.init();
  };

  exports.start();



}).call(this);