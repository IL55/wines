
; (function () {
  var log = require('./logging.js');
  var config = require('./config.js');
  var Q = require('q');
  var ws = require('./winelist.js');
  var _ = require('underscore');
  var common = require('./common.js');
  var iterator = require('./string_iterator.js');

  var myRootRef = ws.rootRef;
  var wineISServerConfig = myRootRef.child(config.firebase.wineIS);
  var cheerio = require("cheerio");

  // start get information
  exports.start = function(query, page) {
    var deferred = Q.defer();
    log.debug("wineIS started for query " + query + " page " + page);

    exports.requestData(query, page)
    .then(ws.saveData)
    .then(function (res) {
      log.debug("ws.saveData returns " + res.cmd);

      // for debug
      return;


      if (res.cmd === "finish query") {
        var newQueryValue = exports.update(query);
        if (newQueryValue === iterator.begin(1)) {
          log.info('Task finished 1');
          return;
        }
        // recursion
        exports.start(newQueryValue, 0);
      } else if (res.cmd === "next page") {
        // recursion
        if (previousData &&
            previousData[0].name == res.data.response.aml.wines.wine[0].name
            )
        {
          // got to new query
          var newQueryValue1 = exports.update(query);
          if (newQueryValue1 === iterator.begin(1)) {
            log.info('Task finished 2');
            return;
          }
          // recursion
          exports.start(newQueryValue1, 0);
        } else {
          // go to new page
          exports.start(query, page + 21, res.data);
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

  exports.requestData = function(query, page) {
    var deferred = Q.defer();
    var url = config.wineIS.urlBegin + query + config.wineIS.urlEnd + page;
    log.debug("requestData: http://" + config.wineIS.host + url);

    var options = {
        host: config.wineIS.host,
        port: 80,
        path: url,
        method: 'GET'
    };

    jsdom.env(
      "http://nodejs.org/dist/",
      ["http://code.jquery.com/jquery.js"],
      function (errors, window) {
        console.log("there have been", window.$("a").length, "nodejs releases!");
      }
    );

    common.getHTML(options, function(statusCode, html) {
      log.debug("requestData: html " + html);
      var wines = [];
      deferred.resolve(wines);
    });


    return deferred.promise;
  };

  exports.update = function(query) {

    var newQueryValue = iterator.next(query);
    if (newQueryValue === iterator.begin(1)) {
      log.info('Task finished');
      return newQueryValue;
    }

    // update last accessed string
    wineISServerConfig.set(newQueryValue, function(error) {
      if (error) {
        log.info('Data could not be saved.' + error);
      }
    });
    return newQueryValue;
  };


  exports.init = function () {
    log.debug("wineIS init");
    wineISServerConfig.once('value', function(snapshot) {
      var newQueryValue;
      if(snapshot.val() === null) {
        newQueryValue = iterator.begin(1);
      }
      else {
        // continue from previous
        newQueryValue = snapshot.val();

        if (newQueryValue === iterator.begin(1)) {
          log.info('Task finished 3');
          return;
        }
      }

      // update last accessed string
      wineISServerConfig.set(newQueryValue, function(error) {
        if (error) {
          log.info('Data could not be saved.' + error);
        }
      });
      exports.start(newQueryValue, 0)
      .then(function(res) {
        log.info("start finished: " + res.cmd);
      });
    });
  };
}).call(this);