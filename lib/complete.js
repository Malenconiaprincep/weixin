// var DB = require('../lib/mongodb');
// var logger = require('log4js').getLogger('page:index');
// var resetctx = require('../lib/resetctx');
// var response = require('../lib/response');
// var ObjectID = require('mongodb').ObjectID;
// var _ = require('underscore');
// var request = require('request');
// var db = new DB({
//   database: 'browser'
// });
// var cache = {};

// var sign = require('../lib/sign.js');


// var appId = 'wx021658577f951072';
// var appSecret = 'fb46e607c25aff850c6c5d65efbe4a00'
//   /*
//    *something like this
//    *{
//    *  jsapi_ticket: 'jsapi_ticket',
//    *  nonceStr: '82zklqj7ycoywrk',
//    *  timestamp: '1415171822',
//    *  url: 'http://example.com',
//    *  signature: '1316ed92e0827786cfda3ae355f33760c4f70c1f'
//    *}
//    */
// var token;
// var ticket;
// var resp;

// var access_token = function() {
//   return function(done) {
//     var token_url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appId + '&secret=' + appSecret;
//     request(token_url, function(error, response, body) {
//       if (!error && response.statusCode == 200) {
//         resp = JSON.parse(body);
//       }
//       done(null, resp);
//     })
//   }
// }


// var get_jsapi_ticket = function(resp) {
//   return function(done) {
//     var self = this;
//     var jsapi_ticket_url = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + resp.access_token + '&type=jsapi';
//     request(jsapi_ticket_url, function(error, response, body) {
//       if (!error && response.statusCode == 200) {
//         resp = JSON.parse(body);
//       }
//       var ticket = resp.ticket;
//       var url = 'http://piaoshihuang.cn/';
//       var config = sign(ticket, url);
//       logger.info(config);

//       self.set('Access-Control-Allow-Origin', '*');
//       self.set('Access-Control-Allow-Credentials', 'true');
//       self.result = {
//         nonceStr: config.nonceStr,
//         timestamp: config.timestamp,
//         appid: appId,
//         signature: config.signature,
//         url: url
//       };
//       done();
//     })
//   }
// }



// var fetch = function() {
//   return function(done) {
//     if (!cache.config) {
//       cache.config = sign(ticket, 'http://piaoshihuang.cn/');
//     }
//     this.set('Access-Control-Allow-Origin', '*');
//     this.set('Access-Control-Allow-Credentials', 'true');
//     this.result = {
//       ret_code: 0,
//       config: _.extend(cache.config, {
//         appid: appId
//       })
//     };

//     done();
//   }
// };

// module.exports = {
//   init: function(app) {
//     this.routes = [
//       app.route('/$').get(function*(next) {
//         yield resetctx.call(this);
//         this.json = true;
//         if (!ticket) {
//           var resp =
//             yield access_token.call(this);
//           yield get_jsapi_ticket.call(this, resp);
//         }
//         // yield fetch.call(this);
//         yield response.call(this);
//       }),
//       app.route('/demo$').get(function*(next) {
//         yield resetctx.call(this);
//         if (!ticket) {
//           yield access_token.call(this);
//           yield get_jsapi_ticket.call(this);
//         }
//         yield fetch.call(this);
//         yield response.call(this, 'weixin');
//       })
//     ];
//   },
//   unload: function(app) {
//     this.routes.forEach(function(route) {
//       app.unroute(route);
//     });
//   }
// };