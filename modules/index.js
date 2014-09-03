var DB = require('../lib/mongodb');
var logger = require('log4js').getLogger('page:index');
var resetctx = require('../lib/resetctx');
var response = require('../lib/response');
var ObjectID = require('mongodb').ObjectID;
var db = new DB({
  database: 'browser'
});

var fetch = function() {
  return function(done) {
    this.locals = {
      ret_code: 0
    };
    done();
  }
};

module.exports = {
  init: function(app) {
    this.routes = [
      app.route('/$').get(function * (next) {
        yield resetctx.call(this);
        yield fetch.call(this);
        yield response.call(this, 'index');
      })
    ];
  },
  unload: function(app) {
    this.routes.forEach(function(route) {
      app.unroute(route);
    });
  }
};