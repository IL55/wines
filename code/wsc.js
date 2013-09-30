// http://api.wine-searcher.com/wine-select-api.lml?Xkey=mrkbrn797699&Xversion=5&Xvintage=1802&Xautoexpand=Y&Xkeyword_mode=A&Xformat=J
; (function () {
  var log = require('./logging.js');
  var config = require('./config.js');
  var Q = require('q');
  var ws = require('./winelist.js');
  var _ = require('underscore');
  var common = require('./common.js');

  var myRootRef = ws.rootRef;
  var wcsServerConfig = myRootRef.child(config.firebase.wcs);

  // start get information
  exports.start = function(vintage) {
    var deferred = Q.defer();
    log.debug("wcs started for vintage " + vintage);
    exports.requestData(vintage)
    .then(ws.saveData)
    .then(function (res) {
      log.debug("ws.saveData returns " + res.cmd);

      var newQueryValue = exports.update(vintage);
      if (newQueryValue === 2014) {
        log.info('Task finished');
        return;
      }
      // recursion
      exports.start(newQueryValue);
      deferred.resolve(res);
    },
    function (err) {
      log.debug("query rejected, wait 1 hour ");
      // wait for 1 hour
      Q.delay(1000 * 60 * 60)
      .then(function() {
        exports.start(vintage);
      });
      return;
    });

    return deferred.promise;
  };

  exports.requestData = function(vintage) {
    var deferred = Q.defer();
    var url = config.wcs.url + vintage;
    log.debug("requestData: " + config.wcs.host + url);

    var options = {
        host: config.wcs.host,
        port: 80,
        path: url,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    common.getJSON(options, function(statusCode, result) {
      if (!result) {
        log.debug("requestData: error " + JSON.stringify(result, null, '\t'));
        deferred.reject(result);
        return;
      }

      var wines = [];

      if (result['wine-searcher']) {
        var ws = result['wine-searcher'];
        log.debug("ws['return-code'] " + ws['return-code']);
        if (ws.names) {
          _.each(ws.names, function(wine) {
            if (wine.name["wine-name"]) {
              wines.push(wine.name['wine-name']);
            }
          });
        }
      }

      log.debug("requestData: count " + wines.length);
      deferred.resolve(wines);
    });
    return deferred.promise;
  };

  exports.update = function(vintage) {

    var newQueryValue = vintage + 1;
    if (newQueryValue === 2014) {
      log.info('Task finished');
      return newQueryValue;
    }

    // update last accessed string
    wcsServerConfig.set(newQueryValue, function(error) {
      if (error) {
        log.info('Data could not be saved.' + error);
      }
    });
    return newQueryValue;
  };

  exports.init = function () {
    wcsServerConfig.once('value', function(snapshot) {
      var newQueryValue;
      if(snapshot.val() === null) {
        newQueryValue = 1800;
      }
      else {
        // continue from previous
        newQueryValue = snapshot.val();

        if (newQueryValue === 2014) {
          log.info('Task finished');
          return;
        }
      }

      // update last accessed string
      wcsServerConfig.set(newQueryValue, function(error) {
        if (error) {
          log.info('Data could not be saved.' + error);
        }
      });
      exports.start(newQueryValue)
      .then(function(res) {
        log.info("start finished: " + res.cmd);
      });
    });
  };

}).call(this);