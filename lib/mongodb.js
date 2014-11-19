var MongoClient = require('mongodb').MongoClient;
var extend = require('node.extend');
var format = require('util').format;

function DB(options) {
  options = options || {};
  if (process.env.NODE_ENV === 'production') {
    this.options = extend({
      host: ['192.168.1.7:27017', '192.168.1.8:27017', '192.168.1.5:27017'],
    }, options);
  } else if (process.env.NODE_ENV === 'test') {
    this.options = extend({
      host: ['localhost:27017'],
    }, options);
  } else {
    this.options = extend({
      host: ['localhost:27017'],
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
  var constr = format('mongodb://%s/%s', this.options.host.join(','), this.options.database);
  MongoClient.connect(constr, {
    db: {
      w: this.options.host.length,
      readPreference: 'secondary'
    }
  }, function(err, db) {
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