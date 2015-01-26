var DB = require('../lib/mongodb');
var logger = require('log4js').getLogger('page:index');
var resetctx = require('../lib/resetctx');
var response = require('../lib/response');
var ObjectID = require('mongodb').ObjectID;
var _ = require('underscore');
var request = require('request');
var db = new DB({
  database: 'browser'
});

var sign = require('../lib/sign.js');


var appId = 'wx021658577f951072';
var appSecret = 'fb46e607c25aff850c6c5d65efbe4a00'
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
var token;
var ticket;
var access_token = function() {
  return function(done) {
    var token_url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appId + '&secret=' + appSecret
    var self = this;
    request(token_url, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        logger.info('access_token');
        logger.info(body);
        token = JSON.parse(body).access_token;
      }
      done();
    })
  }
}


var get_jsapi_ticket = function() {
  return function(done) {
    var jsapi_ticket_url = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + token + '&type=jsapi';
    request(jsapi_ticket_url, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        logger.info('get_jsapi_ticket');
        logger.info(body);
        ticket = JSON.parse(body).ticket;
        done();
      }
    })
  }
}



var fetch = function() {
  return function(done) {
    var config = sign(ticket, 'http://piaoshihuang.cn');
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
        yield access_token.call(this);
        yield get_jsapi_ticket.call(this);
        yield fetch.call(this);
        yield response.call(this, 'index');
      }),
      app.route('/demo$').get(function*(next) {
        yield resetctx.call(this);
        yield access_token.call(this);
        yield get_jsapi_ticket.call(this);
        yield fetch.call(this);
        yield response.call(this, 'weixin');
      })
    ];
  },
  unload: function(app) {
    this.routes.forEach(function(route) {
      app.unroute(route);
    });
  }
};