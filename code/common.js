; (function () {
  var log = require('./logging.js');
  var config = require('./config.js');
  var Q = require('q');
  var _ = require('underscore');

  var http = require("http");
  var https = require("https");

  /**
   * getJSON:  REST get request returning JSON object(s)
   * @param options: http options object
   * @param callback: callback to pass the results JSON object(s) back
   */
  exports.getJSON = function(options, onResult)
  {
      log.debug("rest::getJSON");

      var prot = options.port == 443 ? https : http;
      var req = prot.request(options, function(res)
      {
        var output = '';
        log.debug(options.host + ':' + res.statusCode);
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
          output += chunk;
        });

        res.on('end', function() {
          // due to JSON.parse crashes with two simbols: \'
          var obj = {};
          output = output.replace(/\\'/g, "'");
          try {
            obj = JSON.parse(output);
          }
          catch(error) {
            log.debug("problem with JSON.parse url=" + options.path + " error " + error);
            obj = {};
          }

          onResult(res.statusCode, obj);
        });
      });

      req.setTimeout(10000, function() {
        log.debug("rest::getJSON timeout");
        return exports.getJSON(options, onResult);
      });

      req.on('error', function(err) {
        log.debug("rest::getJSON error" + err.message);
        return exports.getJSON(options, onResult);
      });

      req.end();
  };

  /**
   * getJSON:  REST get request returning JSON object(s)
   * @param options: http options object
   * @param callback: callback to pass the results JSON object(s) back
   */
  exports.getHTML = function(options, onResult) {
      log.debug("getHTML http://" + options.host + options.path);

      var prot = options.port == 443 ? https : http;
      var req = prot.request(options, function(res)
      {
        var output = '';
        log.debug(options.host + ':' + res.statusCode);
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
          output += chunk;
        });

        res.on('end', function() {
          onResult(res.statusCode, output);
        });
      });

      req.setTimeout(10000, function() {
        log.debug("rest::getJSON timeout");
        return exports.getJSON(options, onResult);
      });

      req.on('error', function(err) {
        log.debug("rest::getJSON error" + err.message);
        return exports.getJSON(options, onResult);
      });

      req.end();
  };



}).call(this);