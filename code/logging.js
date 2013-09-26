//
// wrapper for logging system
// as a logger we choose winston
// https://github.com/flatiron/winston
//
; (function () {

  var config = require('./config.js');
  var winston = require('winston');
  var path = require('path');
  var fs = require('fs');

  var startDate = new Date();
  var logFolder = config.loggingCfg.logsFolder;

  // if logs folder doesn't exist - create them
  // sync call is not important due to log starts at the begin of the process
  if (!fs.existsSync(logFolder)) {
    fs.mkdir(logFolder);
  }

  // generate log file name
  var logfileName = config.loggingCfg.logsFile.replace('[START TIME]', startDate.getTime());
  var logfile = path.join(logFolder, logfileName);

  // create log file transport
  var logFileTransport = new (winston.transports.File)({
    // If true, messages will be logged as JSON (default true).
    json: config.loggingCfg.jsonFormat,

    // The filename of the logfile to write output to.
    filename: logfile,

    // Max size in bytes of the logfile, if the size is exceeded then a new file is created.
    maxsize: config.loggingCfg.maxsize,

    // Limit the number of files created when the size of the logfile is exceeded.
    maxFiles: config.loggingCfg.maxFiles,

    // Level of messages that this transport should log.
    level: config.loggingCfg.defaultLogLevel
  });

  var logTransports = [logFileTransport];

  // add console transport if needed
  if (config.loggingCfg.logsToConsole) {
    var logConsoleTransport = new (winston.transports.Console)({
      // Level of messages that this transport should log.
      level: config.loggingCfg.defaultLogLevel,

      // Boolean flag indicating if we should prepend output with timestamps
      // (default false). If function is specified, its return value will be used instead of timestamps.
      timestamp: true
    });
    logTransports.push(logConsoleTransport);
  }

  var logger = new (winston.Logger)({
    transports: logTransports
  });

  // by default, winston will exit after logging an uncaughtException.
  // if this is not the behavior you want, set exitOnError = false
  logger.exitOnError = false;

  // we just wrap our logging system
  // for future changing
  exports.info = logger.info;
  exports.debug = logger.debug;
  exports.error = logger.error;
  exports.logfile = logfile;
}).call(this);