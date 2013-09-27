var sinon = require('sinon');
var chai = require("chai");
var should = chai.Should();
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var fs = require('fs');

var rootSrcFolder = '../../code/';
var iterator = require(rootSrcFolder + 'string_iterator.js');

describe('Check string iterator functionality', function () {
  var sb;
  before(function () {
    sb = sinon.sandbox.create();
  });
  after(function () {
    sb.restore();
  });


  it("check nextChar a ==> b", function () {
    iterator.nextChar('a').should.be.equal('b');
  });

  it("increment iterator aaa => aab", function () {
    iterator.next('aaa').should.be.equal('aab');
  });

  it("increment iterator aaz => aba", function () {
    iterator.next('aaz').should.be.equal('aba');
  });

  it("increment iterator aba => abb", function () {
    iterator.next('aba').should.be.equal('abb');
  });

  it("increment iterator azz => baa", function () {
    iterator.next('azz').should.be.equal('baa');
  });

  it("increment iterator zzz => aaa", function () {
    iterator.next('zzz').should.be.equal('aaa');
  });

  it("begin iterator", function () {
    iterator.begin(3).should.be.equal('aaa');
  });

});