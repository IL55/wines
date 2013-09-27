//
// string iterator
//
var log = require('./logging.js');
; (function () {

  // end of iteration
  exports.endSymbol = '#';

  // init iterator
  exports.begin = function(length) {
    if (length === 3) {
      return 'aaa';
    }

    if (length === 2) {
      return 'aa';
    }

    if (length === 1) {
      return 'a';
    }

    var res = '';
    for (var i = 0; i < length; i++) {
      res += letters[0];
    }

    return res;
  };

  exports.nextChar = function(c) {
    return String.fromCharCode(c.charCodeAt(0) + 1);
  };

  // cycling incremenet
  exports.next = function(word) {
    var symbols = word.split('');
    for (var i = symbols.length-1; i >=0; i--) {
      if (symbols[i] === 'z') {
        symbols[i] = 'a';
      }
      else {
        symbols[i] = exports.nextChar(symbols[i]);
        break;
      }
    }
    return symbols.join('');
  };

}).call(this);