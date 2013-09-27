var path = require('path');
//
//
; (function () {

  // logging configuration
  exports.loggingCfg = {
    // logging folder
    logsFolder: path.join(__dirname, 'logs'),

    // filename for logging
    logsFile: 'logs[START TIME].txt',

    // If true, messages will be logged as JSON
    jsonFormat: false,

    // Max size in bytes of the logfile, if the size is exceeded then a new file is created
    maxsize: 1024 * 1024,

    // Limit the number of files created when the size of the logfile is exceeded
    maxFiles: 10,

    // 1 == log to console
    logsToConsole: 1,

    // default logging level
    // warning: about log levels
    // it is don't work like syslog
    // see https://github.com/flatiron/winston/issues/89
    //
    // level changed to debug
    //  debug: debug
    //  error: error
    //
    // level changed to info
    //  debug: debug
    //  info: info
    //  warn: warn
    //  error: error
    //
    // level changed to warn
    //  debug: debug
    //  warn: warn
    //  error: error
    //
    // level changed to error
    //  error: error

    defaultLogLevel: 'debug'
  };

  exports.firebase = {
    url: 'https://igorsalsita.firebaseio.com/',
    cruveeField: 'cruvee',
    winelistField: 'winelist'
  };


  exports.cruvee = {
    host: 'api.avin.cc',
    urlBegin: '/rest/v1.0/GetWinesByName/',
    urlEnd: '/&key=5877e795dad0649a36c7&page='
  };
}).call(this);
