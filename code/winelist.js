
; (function () {
  var log = require('./logging.js');
  var Firebase = require('firebase');
  var iterator = require('./string_iterator.js');
  var config = require('./config.js');
  var agent = require('superagent');
  var q = require('q');
  var _ = require('underscore');

  var myRootRef = new Firebase(config.firebase.url);
  var winelistRef = myRootRef.child(config.firebase.winelistField);

  exports.rootRef = myRootRef;

  exports.saveData = function(data) {
    log.debug("saveData started ");
    var deferred = q.defer();

    if (!data ||
        !data.length) {
      // no data
      log.debug("saveData: finish query");
      deferred.resolve({cmd: "finish query"});
      return deferred.promise;
    }

    var promisesArray = [];

    _.each(data, function(name) {
      var promise = q.spread([name], exports.addWine);
      promisesArray.push(promise);
    });

    q.allSettled(promisesArray)
    .then(function(){
      log.debug("saveData: after delay");
      if (data.length === 100) {
        log.debug("saveData: next page");
        deferred.resolve({cmd: "next page", data: data});
      } else {
        log.debug("saveData: finish query");
        deferred.resolve({cmd: "finish query"});
      }
    });

    return deferred.promise;
  };

  exports.addWine = function(name) {
    var deferred = q.defer();
    log.debug("addWine " + name);

    winelistRef.child(name).set(true, function(error) {
      log.debug("Wine added " + name);
      deferred.resolve({});
    });

    return deferred.promise;
  };

}).call(this);