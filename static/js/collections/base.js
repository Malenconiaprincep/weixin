define(['../models/base'], function(Model) {
  var Colletion = Backbone.Collection.extend({
    model: Model,
    url: function() {
      return '/api/' + this.action;
    },
    initialize: function() {
      this.init.apply(this, arguments);
    },
    init: function() {},
    parse: function(res) {
      var module, action;
      if (res && res.page) {
        this.page = res.page;
      }
      if (res && res.ret_code === 0) {
        return res.data;
      }
      if (res && res.ret_code != 0) {
        this.trigger('error', res);
        return [];
      }
      return [];
    },
    fetch: function(options) {
      options = options || {};
      if (options.data) {
        _.extend(this.filter, options.data);
      }
      Backbone.Collection.prototype.fetch.apply(this, arguments);
    }
  });
  return Colletion;
});