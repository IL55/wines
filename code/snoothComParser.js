
; (function () {
  var log = require('./logging.js');
  var config = require('./config.js');
  var Q = require('q');
  var ws = require('./winelist.js');
  var _ = require('underscore');
  var common = require('./common.js');
  var iterator = require('./string_iterator.js');
  var cheerio = require("cheerio");

  var myRootRef = ws.rootRef;
  var snoothComServerConfig = null;
  var cfg = null;

  // start get information
  exports.start = function(query, page, previousData) {
    var deferred = Q.defer();
    log.debug("snoothCom started for query " + query + " page " + page);

    exports.requestData(query, page)
    .then(ws.saveData)
    .then(function (res) {
      log.debug("ws.saveData returns " + res.cmd);

      if (res.data.length > (cfg.itemsOnPage-1)) {
        if (previousData &&
            (previousData[0] == res.data[0]) &&
            (previousData[1] == res.data[1])) {
          log.info('start: go to new query');
          // go to new query
          var newQueryValue = exports.update(query);
          if (newQueryValue === iterator.begin(cfg.lengthOfStringIterator)) {
            log.info('Task finished 2');
            deferred.resolve(res);
            return;
          }
          // recursion
          exports.start(newQueryValue, cfg.startPage);
          deferred.resolve(res);
          return;
        }
        // go to next page
        log.info('start: go to next page');
        exports.start(query, page + 1, res.data);
      } else {
        log.info('start: go to new query');
        // go to new query
        var newQueryValue1 = exports.update(query);
        if (newQueryValue1 === iterator.begin(cfg.lengthOfStringIterator)) {
          log.info('Task finished 2');
          deferred.resolve(res);
          return;
        }
        // recursion
        exports.start(newQueryValue1, cfg.startPage);
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
    var url = cfg.urlBegin + query + cfg.urlEnd + page;
    log.debug("requestData: http://" + cfg.host + url);

    var options = {
        host: cfg.host,
        port: 80,
        path: url,
        method: 'GET'
    };

    common.getHTML(options, function(statusCode, html) {
      log.debug("requestData: html.length=" + html.length);
      var wines = [];
      var $ = cheerio.load(html);
      var strongList = $(cfg.selector);
      if (strongList) {
        strongList.each(function(index, element) {
          var name = $(element).text();
          name = name.replace(/\./g, ' ');
          wines.push(name);
        });
      }

      log.debug("requestData: wines.length=" + wines.length);
      deferred.resolve(wines);
    });

    return deferred.promise;
  };

  exports.update = function(query) {

    var newQueryValue = iterator.next(query);
    if (newQueryValue === iterator.begin(cfg.lengthOfStringIterator)) {
      log.info('update: Task finished');
      return newQueryValue;
    }

    // update last accessed string
    snoothComServerConfig.set(newQueryValue, function(error) {
      if (error) {
        log.info('update: Data could not be saved.' + error);
      }
    });
    return newQueryValue;
  };


  exports.init = function (localConfig) {
    cfg = localConfig;
    snoothComServerConfig = myRootRef.child(cfg.firebaseIteratorName);
    log.debug("init: snoothCom init" + JSON.stringify(cfg));
    snoothComServerConfig.once('value', function(snapshot) {
      var newQueryValue;
      if(snapshot.val() === null) {
        newQueryValue = iterator.begin(cfg.lengthOfStringIterator);
      }
      else {
        // continue from previous
        newQueryValue = snapshot.val();
      }

      // update last accessed string
      snoothComServerConfig.set(newQueryValue, function(error) {
        if (error) {
          log.info('init: Data could not be saved.' + error);
        }
      });
      exports.start(newQueryValue, cfg.startPage)
      .then(function(res) {
        log.info("init: start finished: " + res.cmd);
      });
    });
  };
}).call(this);