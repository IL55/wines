
; (function () {
  var log = require('./logging.js');
  var iterator = require('./string_iterator.js');
  var config = require('./config.js');
  var agent = require('superagent');
  var Q = require('q');
  var ws = require('./winelist.js');
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
      console.log("rest::getJSON");

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
          output = output.replace(/\\'/g, "'");
          var obj = JSON.parse(output);
          onResult(res.statusCode, obj);
        });
      });

      req.on('error', function(err) {
          //res.send('error: ' + err.message);
      });

      req.end();
  };

// /  var request = require('request');

  var myRootRef = ws.rootRef;
  var cruveeServerConfig = myRootRef.child(config.firebase.cruveeField);

  // start get information
  exports.start = function(query, page, previousData) {
    var deferred = Q.defer();
    log.debug("cruvee started for query " + query + " page " + page + " data" + previousData);
    exports.requestData(query, page)
    .then(ws.saveData)
    .then(function (res) {
      log.debug("ws.saveData returns " + res.cmd);
      if (res.cmd === "finish query") {
        var newQueryValue = exports.update(query);
        if (newQueryValue === iterator.begin(3)) {
          log.info('Task finished');
          return;
        }
        // recursion
        exports.start(newQueryValue, 1);
      } else if (res.cmd === "next page") {
        // recursion
        if (previousData &&
            previousData.response.aml.wines.wine &&
            previousData.response.aml.wines.wine[0] &&
            previousData.response.aml.wines.wine[0].avin == res.data.response.aml.wines.wine[0].avin
            )
        {
          // got to new query
          var newQueryValue1 = exports.update(query);
          if (newQueryValue1 === iterator.begin(3)) {
            log.info('Task finished');
            return;
          }
          // recursion
          exports.start(newQueryValue1, 1);
        } else {
          // go to new page
          exports.start(query, page + 1, res.data);
        }
      }

      deferred.resolve(res);
    },
    function (err) {
      log.debug("query rejected, wait 1 hour ");
      // wait for 1 hour
      Q.delay(1000 * 60 * 60)
      .then(function() {
        exports.start(query, page, previousData);
      });
      return;
    });

    return deferred.promise;
  };

  exports.end = function(from) {
    log.debug("cruvee ended");
  };

  exports.requestData = function(query, page) {
    var deferred = Q.defer();
    var url = config.cruvee.urlBegin + query + config.cruvee.urlEnd + page;
    log.debug("requestData: " + url);

    var options = {
        host: config.cruvee.host,
        port: 80,
        path: url,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    exports.getJSON(options, function(statusCode, result) {
      if (result.response.aml.error) {
        deferred.reject(result);
        return;
      }
      log.debug("requestData: count " + result.response.aml.wines.count);
      deferred.resolve(result);
    });
    return deferred.promise;
  };

  exports.update = function(query) {

    var newQueryValue = iterator.next(query);
    if (newQueryValue === iterator.begin(3)) {
      log.info('Task finished');
      return newQueryValue;
    }

    // update last accessed string
    cruveeServerConfig.set(newQueryValue, function(error) {
      if (error) {
        log.info('Data could not be saved.' + error);
      }
    });
    return newQueryValue;
  };

  exports.init = function () {
    cruveeServerConfig.once('value', function(snapshot) {
      var newQueryValue;
      if(snapshot.val() === null) {
        newQueryValue = iterator.begin(3);
      }
      else {
        newQueryValue = iterator.next(snapshot.val());

        if (newQueryValue === iterator.begin(3)) {
          log.info('Task finished');
          return;
        }
      }

      // update last accessed string
      cruveeServerConfig.set(newQueryValue, function(error) {
        if (error) {
          log.info('Data could not be saved.' + error);
        }
      });
      exports.start(newQueryValue, 1)
      .then(function(res) {
        log.info("start finished: " + res.cmd);
      });
    });
  };

}).call(this);