var sinon = require('sinon');
var chai = require("chai");
var should = chai.Should();
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var fs = require('fs');
var request = require('supertest');

var rootSrcFolder = '../../code/';
var cruvee = require(rootSrcFolder + 'cruvee.js');

describe('Check cruvee functionality', function () {
  var sb;
  before(function () {
    sb = sinon.sandbox.create();
  });
  after(function () {
    sb.restore();
  });


  it("cruvee save data", function (done) {
    //var res = cruvee.requestData('aaa', 0);
    done();
  });

});