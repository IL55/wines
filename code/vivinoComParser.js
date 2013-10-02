
; (function () {
  var log = require('./logging.js');
  var config = require('./config.js');
  var Q = require('q');
  var ws = require('./winelist.js');
  var _ = require('underscore');
  var common = require('./common.js');
  var iterator = require('./string_iterator.js');

  var myRootRef = ws.rootRef;
  var vivinoComServerConfig = myRootRef.child(config.firebase.vivinoCom);
  var cheerio = require("cheerio");

  // start get information
  exports.start = function(query, page) {
    var deferred = Q.defer();
    log.debug("vivinoCom started for query " + query + " page " + page);

    exports.requestData(query, page)
    .then(ws.saveData)
    .then(function (res) {
      log.debug("ws.saveData returns " + res.cmd);

      if (res.data.length > 90) {
        // go to next page
        log.info('start: go to next page');
        exports.start(query, page + 1, res.data);
      } else {
        log.info('start: go to new query');
        // go to new query
        var newQueryValue1 = exports.update(query);
        if (newQueryValue1 === iterator.begin(3)) {
          log.info('Task finished 2');
          deferred.resolve(res);
          return;
        }
        // recursion
        exports.start(newQueryValue1, 1);
      }

      deferred.resolve(res);
    },
    function (err) {
      log.debug("query rejected, wait 1 hour ");
      // wait for 1 hour
      Q.delay(1000 * 60 * 60)
      .then(function() {
        exports.start(query, page);
      });
      return;
    });

    return deferred.promise;
  };

  exports.requestData = function(query, page) {
    var deferred = Q.defer();
    var url = config.vivinoCom.urlBegin + query + config.vivinoCom.urlEnd + page;
    log.debug("requestData: http://" + config.vivinoCom.host + url);

    var options = {
        host: config.vivinoCom.host,
        port: 80,
        path: url,
        method: 'GET'
    };

    common.getHTML(options, function(statusCode, html) {
      log.debug("requestData: html.length=" + html.length);
      var wines = [];
      var $ = cheerio.load(html);
      var wineList = $('.description a');
      if (wineList) {
        wineList.each(function(index, element) {
          wines.push($(element).text());
        });
      }

      log.debug("requestData: wines.length=" + wines.length);
      deferred.resolve(wines);
    });

    return deferred.promise;
  };

  exports.update = function(query) {

    var newQueryValue = iterator.next(query);
    if (newQueryValue === iterator.begin(3)) {
      log.info('update: Task finished');
      return newQueryValue;
    }

    // update last accessed string
    vivinoComServerConfig.set(newQueryValue, function(error) {
      if (error) {
        log.info('update: Data could not be saved.' + error);
      }
    });
    return newQueryValue;
  };


  exports.init = function () {
    log.debug("init: vivinoCom init");
    vivinoComServerConfig.once('value', function(snapshot) {
      var newQueryValue;
      if(snapshot.val() === null) {
        newQueryValue = iterator.begin(3);
      }
      else {
        // continue from previous
        newQueryValue = snapshot.val();

        if (newQueryValue === iterator.begin(3)) {
          log.info('init: Task finished 3');
          return;
        }
      }

      // update last accessed string
      vivinoComServerConfig.set(newQueryValue, function(error) {
        if (error) {
          log.info('init: Data could not be saved.' + error);
        }
      });
      exports.start(newQueryValue, 1)
      .then(function(res) {
        log.info("init: start finished: " + res.cmd);
      });
    });
  };
}).call(this);