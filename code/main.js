//
// start/stop server
//
var log = require('./logging.js');
var config = require('./config.js');
var agent = require('superagent');
var _ = require('underscore');

var cruvee = require('./cruvee.js');
var wsc = require('./wsc.js');
var wineISParser = require('./wineISParser.js');

var cellTracker = require('./celltracker.js');

var wineComParser = require('./wineComParser.js');

var vivinoComParser = require('./vivinoComParser.js');

var snoothComParser = require('./snoothComParser.js');

var iwinedb = require('./iwinedb.js');

; (function () {

  process.on('uncaughtException', function (err) {
    log.debug( "UNCAUGHT EXCEPTION " );
    log.debug( "[Inside 'uncaughtException' event] " + err.stack || err.message );
  });

  // start main processing
  exports.start = function() {
    log.info("Main started");

    //cruvee.init();
    //wsc.init();
    //wineISParser.init();
    //cellTracker.init();
    //wineComParser.init();
    //vivinoComParser.init();
    //snoothComParser.init(config.snoothCom);
    iwinedb.init();
  };

  exports.start();



}).call(this);