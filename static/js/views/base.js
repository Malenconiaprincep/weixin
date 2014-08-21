define(function() {
  var templates = {};

  var View = Backbone.View.extend({
    __base: '/template/modules/',
    loadTemplate: function(template, callback) {
      if (arguments.length === 1) {
        callback = template;
        template = null;
      }
      var tmplKey = this.moduleName + '/' + (template || this.template);
      if (templates[tmplKey]) {
        callback(templates[tmplKey]);
      } else {
        $.getScript(this.__base + tmplKey + '.js', function() {
          var keys = Object.keys(jade.templates);
          templates[tmplKey] = jade.templates[keys[0]];
          delete jade.templates[keys[0]];
          callback(templates[tmplKey]);
        }.bind(this));
      }
    },
    $: function() {
      return this.$el.find.apply(this.$el, arguments);
    },
    $doc: $(document),
    $body: $(document.body),
    initialize: function() {
      this.$el.data('view', this);
      this.$el[0].__view = this;
      this.init.apply(this, arguments);
      this.$el.trigger({
        type: 'viewbind',
        view: this
      });
      View.views.push(this);
    },
    init: function() {},
    render: function() {
      var self = this;
      this.buildHtml(function(html) {
        self.$el.html(html);
        self.trigger('afterrender');
      }.bind(this));
    },
    renderTo: function(selector) {
      var self = this;
      this.buildHtml(function(html) {
        self.$el.find(selector).html(html);
        self.trigger('afterrender');
      }.bind(this));
    },
    buildHtml: function(callback) {
      var dataSource = this.model || this.collection;
      var self = this;
      this.loadTemplate(function(template) {
        var renderData = {};
        var originData = dataSource.toJSON();
        if (originData.__combined) {
          renderData = originData
        } else {
          renderData[dataSource.action] = originData;
        }
        callback(template(renderData));
      });
    }
  });

  //PC端
  if (!window.wpa) {
    $(document).on('keydown', function(e) {
      View.views.forEach(function(view) {
        view.trigger('keydown', {
          keyCode: e.keyCode
        });
      });
    });
  }

  window.__tv_keydown = function(code) {
    var keyMap = {
      '21': 37,
      '19': 38,
      '22': 39,
      '20': 40
    };
    code = keyMap[code];
    if (code) {
      View.views.forEach(function(view) {
        view.trigger('keydown', {
          keyCode: code
        });
      });
    }
  };

  View.views = [];

  return View;
});