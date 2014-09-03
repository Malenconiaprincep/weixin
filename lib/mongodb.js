var MongoClient = require('mongodb').MongoClient;
var _ = require('underscore');
var format = require('util').format;

function DB(options) {
  options = options || {};
  if (process.env.NODE_ENV === 'production') {
    this.options = _.extend({
      host: '192.168.1.3',
      port: 27017,
    }, options);
  } else if (process.env.NODE_ENV === 'test') {
    this.options = _.extend({
      host: 'localhost',
      port: 27017,
    }, options);
  } else {
    this.options = _.extend({
      host: 'localhost',
      port: 27017
    }, options);
  }
}

DB.prototype.db = function(callback) {
  if (this._db) {
    callback(null, this._db);
  } else {
    this.connect(callback);
  }
};

DB.prototype.connect = function(callback) {
  var self = this;
  MongoClient.connect(format('mongodb://%s:%s/%s', this.options.host, this.options.port, this.options.database), function(err, db) {
    if (!err) {
      // if (process.env.NODE_ENV === 'production') {
      // db.authenticate(self.options.user, self.options.password, function(err) {
      //   if (!err) {
      self._db = db;
      callback(err, db);
      //   } else {
      //     callback(err);
      //   }
      // })
      // } else {
      //   self._db = db;
      //   callback(err, db);
      // }
    } else {
      callback(err);
    }
  });
};

module.exports = DB;