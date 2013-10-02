
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
      deferred.resolve({cmd: "finish query", data: []});
      return deferred.promise;
    }

    var promisesArray = [];

    _.each(data, function(name) {
      var promise = q.spread([name], exports.addWine);
      promisesArray.push(promise);
    });

    q.allSettled(promisesArray)
    .then(function(resultArray){

      for (i = 0; i < resultArray.length; i++) {
        if (resultArray[i].state !== "fulfilled") {
          log.debug("Wine not added " + data[i]);
        }
      }

      if (data.length === 100) {
        deferred.resolve({cmd: "next page", data: data});
      } else {
        deferred.resolve({cmd: "finish query", data: data});
      }
    });

    return deferred.promise;
  };

  exports.addWine = function(name) {
    var deferred = q.defer();
    log.debug("addWine " + name);

    winelistRef.child(name).set(true, function(error) {
      if (error) {
        log.debug("Wine not added " + name);
        deferred.resolve({status:"nok"});
      }
      else {
        log.debug("Wine added " + name);
        deferred.resolve({status:"ok"});
      }

    });

    return deferred.promise;
  };

}).call(this);