var DB = require('../lib/mongodb');
var logger = require('log4js').getLogger('page:index');
var resetctx = require('../lib/resetctx');
var response = require('../lib/response');
var ObjectID = require('mongodb').ObjectID;
var _ = require('underscore');
var db = new DB({
  database: 'browser'
});

var sign = require('../lib/sign.js');


var appId = 'wx021658577f951072';

/*
 *something like this
 *{
 *  jsapi_ticket: 'jsapi_ticket',
 *  nonceStr: '82zklqj7ycoywrk',
 *  timestamp: '1415171822',
 *  url: 'http://example.com',
 *  signature: '1316ed92e0827786cfda3ae355f33760c4f70c1f'
 *}
 */



var fetch = function() {
  return function(done) {
    var config = sign('jsapi_ticket', 'http://www.piaoshihuang.cn');
    this.result = {
      ret_code: 0,
      config: _.extend(config, {
        appId: appId
      })
    };

    done();
  }
};

module.exports = {
  init: function(app) {
    this.routes = [
      app.route('/$').get(function*(next) {
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