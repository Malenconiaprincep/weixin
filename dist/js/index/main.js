
/* @source js/libs/oz.js */;

/**
 * OzJS: microkernel for modular javascript
 * compatible with AMD (Asynchronous Module Definition)
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
(function() {

    var window = this,
        _toString = Object.prototype.toString,
        _RE_PLUGIN = /(.*)!(.+)/,
        _RE_DEPS = /\Wrequire\((['"]).+?\1\)/g,
        _RE_SUFFIX = /\.(js|json)$/,
        _RE_RELPATH = /^\.+?\/.+/,
        _RE_DOT = /(^|\/)\.\//g,
        _RE_ALIAS_IN_MID = /^([\w\-]+)\//,
        _builtin_mods = {
            "require": 1,
            "exports": 1,
            "module": 1,
            "host": 1,
            "finish": 1
        },

        _config = {
            mods: {}
        },
        _scripts = {},
        _delays = {},
        _refers = {},
        _waitings = {},
        _latest_mod,
        _scope,
        _resets = {},

        forEach = Array.prototype.forEach || function(fn, sc) {
            for (var i = 0, l = this.length; i < l; i++) {
                if (i in this)
                    fn.call(sc, this[i], i, this);
            }
        };

    /**
     * @public define / register a module and its meta information
     * @param {string} module name. optional as unique module in a script file
     * @param {string[]} dependencies
     * @param {function} module code, execute only once on the first call
     *
     * @note
     *
     * define('', [""], func)
     * define([""], func)
     * define('', func)
     * define(func)
     *
     * define('', "")
     * define('', [""], "")
     * define('', [""])
     *
     */
    function define(name, deps, block) {
        var is_remote = typeof block === 'string';
        if (!block) {
            if (deps) {
                if (isArray(deps)) {
                    block = filesuffix(realname(basename(name)));
                } else {
                    block = deps;
                    deps = null;
                }
            } else {
                block = name;
                name = "";
            }
            if (typeof name !== 'string') {
                deps = name;
                name = "";
            } else {
                is_remote = typeof block === 'string';
                if (!is_remote && !deps) {
                    deps = seek(block);
                }
            }
        }
        name = name && realname(name);
        var mod = name && _config.mods[name];
        if (!_config.debug && mod && mod.name && (is_remote && mod.loaded == 2 || mod.exports)) {
            return;
        }
        if (is_remote && _config.enable_ozma) {
            deps = null;
        }
        var host = isWindow(this) ? this : window;
        mod = _config.mods[name] = {
            name: name,
            url: mod && mod.url,
            host: host,
            deps: deps || []
        };
        if (name === "") { // capture anonymous module
            _latest_mod = mod;
        }
        if (typeof block !== 'string') {
            mod.block = block;
            mod.loaded = 2;
        } else { // remote module
            var alias = _config.aliases;
            if (alias) {
                block = block.replace(/\{(\w+)\}/g, function(e1, e2) {
                    return alias[e2] || "";
                });
            }
            mod.url = block;
        }
        if (mod.block && !isFunction(mod.block)) { // json module
            mod.exports = block;
        }
    }

    /**
     * @public run a code block its dependencies
     * @param {string[]} [module name] dependencies
     * @param {function}
     */
    function require(deps, block, _self_mod) {
        if (typeof deps === 'string') {
            if (!block) {
                return (_config.mods[realname(basename(deps, _scope))] || {}).exports;
            }
            deps = [deps];
        } else if (!block) {
            block = deps;
            deps = seek(block);
        }
        var host = isWindow(this) ? this : window;
        if (!_self_mod) {
            _self_mod = {
                url: _scope && _scope.url
            };
        }
        var m, remotes = 0, // counter for remote scripts
            list = scan.call(host, deps, _self_mod); // calculate dependencies, find all required modules
        for (var i = 0, l = list.length; i < l; i++) {
            m = list[i];
            if (m.is_reset) {
                m = _config.mods[m.name];
            }
            if (m.url && m.loaded !== 2) { // remote module
                remotes++;
                m.loaded = 1; // status: loading
                fetch(m, function() {
                    this.loaded = 2; // status: loaded 
                    var lm = _latest_mod;
                    if (lm) { // capture anonymous module
                        lm.name = this.name;
                        lm.url = this.url;
                        _config.mods[this.name] = lm;
                        _latest_mod = null;
                    }
                    // loaded all modules, calculate dependencies all over again
                    if (--remotes <= 0) {
                        require.call(host, deps, block, _self_mod);
                    }
                });
            }
        }
        if (!remotes) {
            _self_mod.deps = deps;
            _self_mod.host = host;
            _self_mod.block = block;
            setTimeout(function() {
                tidy(deps, _self_mod);
                list.push(_self_mod);
                exec(list.reverse());
            }, 0);
        }
    }

    /**
     * @private execute modules in a sequence of dependency
     * @param {object[]} [module object]
     */
    function exec(list) {
        var mod, mid, tid, result, isAsync, deps,
            depObjs, exportObj, moduleObj, rmod,
            wt = _waitings;
        while (mod = list.pop()) {
            if (mod.is_reset) {
                rmod = clone(_config.mods[mod.name]);
                rmod.host = mod.host;
                rmod.newname = mod.newname;
                mod = rmod;
                if (!_resets[mod.newname]) {
                    _resets[mod.newname] = [];
                }
                _resets[mod.newname].push(mod);
                mod.exports = undefined;
            } else if (mod.name) {
                mod = _config.mods[mod.name] || mod;
            }
            if (!mod.block || !mod.running && mod.exports !== undefined) {
                continue;
            }
            depObjs = [];
            exportObj = {}; // for "exports" module
            moduleObj = {
                id: mod.name,
                filename: mod.url,
                exports: exportObj
            };
            deps = mod.deps.slice();
            deps[mod.block.hiddenDeps ? 'unshift' : 'push']("require", "exports", "module");
            for (var i = 0, l = deps.length; i < l; i++) {
                mid = deps[i];
                switch (mid) {
                    case 'require':
                        depObjs.push(require);
                        break;
                    case 'exports':
                        depObjs.push(exportObj);
                        break;
                    case 'module':
                        depObjs.push(moduleObj);
                        break;
                    case 'host': // deprecated
                        depObjs.push(mod.host);
                        break;
                    case 'finish': // execute asynchronously
                        tid = mod.name;
                        if (!wt[tid]) // for delay execute
                            wt[tid] = [list];
                        else
                            wt[tid].push(list);
                        depObjs.push(function(result) {
                            // HACK: no guarantee that this function will be invoked after while() loop termination in Chrome/Safari 
                            setTimeout(function() {
                                // 'mod' equal to 'list[list.length-1]'
                                if (result !== undefined) {
                                    mod.exports = result;
                                }
                                if (!wt[tid])
                                    return;
                                forEach.call(wt[tid], function(list) {
                                    this(list);
                                }, exec);
                                delete wt[tid];
                                mod.running = 0;
                            }, 0);
                        });
                        isAsync = 1;
                        break;
                    default:
                        depObjs.push((
                            (_resets[mid] || []).pop() || _config.mods[realname(mid)] || {}
                        ).exports);
                        break;
                }
            }
            if (!mod.running) {
                // execute module code. arguments: [dep1, dep2, ..., require, exports, module]
                _scope = mod;
                result = mod.block.apply(mod.host, depObjs) || null;
                _scope = false;
                exportObj = moduleObj.exports;
                mod.exports = result !== undefined ? result : exportObj; // use empty exportObj for "finish"
                for (var v in exportObj) {
                    if (v) {
                        mod.exports = exportObj;
                    }
                    break;
                }
            }
            if (isAsync) { // skip, wait for finish() 
                mod.running = 1;
                break;
            }
        }
    }

    /**
     * @private observer for script loader, prevent duplicate requests
     * @param {object} module object
     * @param {function} callback
     */
    function fetch(m, cb) {
        var url = m.url,
            observers = _scripts[url];
        if (!observers) {
            var mname = m.name,
                delays = _delays;
            if (m.deps && m.deps.length && delays[mname] !== 1) {
                delays[mname] = [m.deps.length, cb];
                m.deps.forEach(function(dep) {
                    var d = _config.mods[realname(dep)];
                    if (this[dep] !== 1 && d.url && d.loaded !== 2) {
                        if (!this[dep]) {
                            this[dep] = [];
                        }
                        this[dep].push(m);
                    } else {
                        delays[mname][0]--;
                    }
                }, _refers);
                if (delays[mname][0] > 0) {
                    return;
                } else {
                    delays[mname] = 1;
                }
            }
            observers = _scripts[url] = [
                [cb, m]
            ];
            var true_url = /^\w+:\/\//.test(url) ? url : (_config.enable_ozma && _config.distUrl || _config.baseUrl || '') + (_config.enableAutoSuffix ? namesuffix(url) : url);
            getScript.call(m.host || this, true_url, function() {
                forEach.call(observers, function(args) {
                    args[0].call(args[1]);
                });
                _scripts[url] = 1;
                if (_refers[mname] && _refers[mname] !== 1) {
                    _refers[mname].forEach(function(dm) {
                        var b = this[dm.name];
                        if (--b[0] <= 0) {
                            this[dm.name] = 1;
                            fetch(dm, b[1]);
                        }
                    }, delays);
                    _refers[mname] = 1;
                }
            });
        } else if (observers === 1) {
            cb.call(m);
        } else {
            observers.push([cb, m]);
        }
    }

    /**
     * @private search and sequence all dependencies, based on DFS
     * @param {string[]} a set of module names
     * @param {object[]}
     * @param {object[]} a sequence of modules, for recursion
     * @return {object[]} a sequence of modules
     */
    function scan(m, file_mod, list) {
        list = list || [];
        if (!m[0]) {
            return list;
        }
        var deps,
            history = list.history;
        if (!history) {
            history = list.history = {};
        }
        if (m[1]) {
            deps = m;
            m = false;
        } else {
            var truename,
                _mid = m[0],
                plugin = _RE_PLUGIN.exec(_mid);
            if (plugin) {
                _mid = plugin[2];
                plugin = plugin[1];
            }
            var mid = realname(_mid);
            if (!_config.mods[mid] && !_builtin_mods[mid]) {
                var true_mid = realname(basename(_mid, file_mod));
                if (mid !== true_mid) {
                    _config.mods[file_mod.url + ':' + mid] = true_mid;
                    mid = true_mid;
                }
                if (!_config.mods[true_mid]) {
                    define(true_mid, filesuffix(true_mid));
                }
            }
            m = file_mod = _config.mods[mid];
            if (m) {
                if (plugin === "new") {
                    m = {
                        is_reset: true,
                        deps: m.deps,
                        name: mid,
                        newname: plugin + "!" + mid,
                        host: this
                    };
                } else {
                    truename = m.name;
                }
                if (history[truename]) {
                    return list;
                }
            } else {
                return list;
            }
            if (!history[truename]) {
                deps = m.deps || [];
                // find require information within the code
                // for server-side style module
                //deps = deps.concat(seek(m));
                if (truename) {
                    history[truename] = true;
                }
            } else {
                deps = [];
            }
        }
        for (var i = deps.length - 1; i >= 0; i--) {
            if (!history[deps[i]]) {
                scan.call(this, [deps[i]], file_mod, list);
            }
        }
        if (m) {
            tidy(deps, m);
            list.push(m);
        }
        return list;
    }

    /**
     * @experiment
     * @private analyse module code
     *          to find out dependencies which have no explicit declaration
     * @param {object} module object
     */
    function seek(block) {
        var hdeps = block.hiddenDeps || [];
        if (!block.hiddenDeps) {
            var code = block.toString(),
                h = null;
            hdeps = block.hiddenDeps = [];
            while (h = _RE_DEPS.exec(code)) {
                hdeps.push(h[0].slice(10, -2));
            }
        }
        return hdeps.slice();
    }

    function tidy(deps, m) {
        forEach.call(deps.slice(), function(dep, i) {
            var true_mid = this[m.url + ':' + realname(dep)];
            if (typeof true_mid === 'string') {
                deps[i] = true_mid;
            }
        }, _config.mods);
    }

    function config(opt) {
        for (var i in opt) {
            if (i === 'aliases') {
                if (!_config[i]) {
                    _config[i] = {};
                }
                for (var j in opt[i]) {
                    _config[i][j] = opt[i][j];
                }
                var mods = _config.mods;
                for (var k in mods) {
                    mods[k].name = realname(k);
                    mods[mods[k].name] = mods[k];
                }
            } else {
                _config[i] = opt[i];
            }
        }
    }

    /**
     * @note naming pattern:
     * _g_src.js
     * _g_combo.js
     *
     * jquery.js
     * jquery_pack.js
     *
     * _yy_src.pack.js
     * _yy_combo.js
     *
     * _yy_bak.pack.js
     * _yy_bak.pack_pack.js
     */
    function namesuffix(file) {
        return file.replace(/(.+?)(_src.*)?(\.\w+)$/, function($0, $1, $2, $3) {
            return $1 + ($2 && '_combo' || '_pack') + $3;
        });
    }

    function filesuffix(mid) {
        return _RE_SUFFIX.test(mid) ? mid : mid + '.js';
    }

    function realname(mid) {
        var alias = _config.aliases;
        if (alias) {
            mid = mid.replace(_RE_ALIAS_IN_MID, function(e1, e2) {
                return alias[e2] || (e2 + '/');
            });
        }
        return mid;
    }

    function basename(mid, file_mod) {
        var rel_path = _RE_RELPATH.exec(mid);
        if (rel_path && file_mod) { // resolve relative path in Module ID
            mid = (file_mod.url || '').replace(/[^\/]+$/, '') + rel_path[0];
        }
        return resolvename(mid);
    }

    function resolvename(url) {
        url = url.replace(_RE_DOT, '$1');
        var dots, dots_n, url_dup = url,
            RE_DOTS = /(\.\.\/)+/g;
        while (dots = (RE_DOTS.exec(url_dup) || [])[0]) {
            dots_n = dots.match(/\.\.\//g).length;
            url = url.replace(new RegExp('([^/\\.]+/){' + dots_n + '}' + dots), '');
        }
        return url.replace(/\/\//g, '/');
    }

    /**
     * @public non-blocking script loader
     * @param {string}
     * @param {object} config
     */
    function getScript(url, op) {
        var doc = isWindow(this) ? this.document : document,
            s = doc.createElement("script");
        s.type = "text/javascript";
        s.async = "async"; //for firefox3.6
        if (!op)
            op = {};
        else if (isFunction(op))
            op = {
                callback: op
            };
        if (op.charset)
            s.charset = op.charset;
        s.src = url;
        var h = doc.getElementsByTagName("head")[0];
        s.onload = s.onreadystatechange = function(__, isAbort) {
            if (isAbort || !s.readyState || /loaded|complete/.test(s.readyState)) {
                s.onload = s.onreadystatechange = null;
                if (h && s.parentNode) {
                    h.removeChild(s);
                }
                s = undefined;
                if (!isAbort && op.callback) {
                    op.callback();
                }
            }
        };
        h.insertBefore(s, h.firstChild);
    }

    function isFunction(obj) {
        return _toString.call(obj) === "[object Function]";
    }

    function isArray(obj) {
        return _toString.call(obj) === "[object Array]";
    }

    function isWindow(obj) {
        return "setInterval" in obj;
    }

    function clone(obj) { // be careful of using `delete`
        function NewObj() {}
        NewObj.prototype = obj;
        return new NewObj();
    }

    var oz = {
        VERSION: '2.5.1',
        define: define,
        require: require,
        config: config,
        seek: seek,
        fetch: fetch,
        realname: realname,
        basename: basename,
        filesuffix: filesuffix,
        namesuffix: namesuffix,
        // non-core
        _getScript: getScript,
        _clone: clone,
        _forEach: forEach,
        _isFunction: isFunction,
        _isWindow: isWindow
    };

    require.config = config;
    define.amd = {
        jQuery: true
    };

    if (!window.window) { // for nodejs
        exports.oz = oz;
        exports._config = _config;
        // hook for build tool
        for (var i in oz) {
            exports[i] = oz[i];
        }
        var hooking = function(fname) {
            return function() {
                return exports[fname].apply(this, arguments);
            };
        };
        exec = hooking('exec');
        fetch = hooking('fetch');
        require = hooking('require');
        require.config = config;
    } else {
        window.oz = oz;
        window.define = define;
        window.require = require;
    }

})();
require.config({ enable_ozma: true });


/* @source js/views/base.js */;

define("js/views/base", function() {
  var templates = {};

  var View = Backbone.View.extend({
    __base: staticBase + 'template/modules/',
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
    module: function(name, callback) {
      var $module = $('[data-module=' + name + ']');
      if ($module.length > 0) {
        var module = $module.data('view');
        if (module) {
          callback(module);
        } else {
          $module.one('viewbind', function() {
            callback($module.data('view'));
          });
        }
      } else {
        callback(null);
      }
    },
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
/* @source modules/weixin/view.js */;

define("modules/weixin/view", [
  "js/views/base"
], function(Base) {
    var View = Base.extend({
        moduleName: "weixin",
        init: function() {
            /*
             * 注意：
             * 1. 所有的JS接口只能在公众号绑定的域名下调用，公众号开发者需要先登录微信公众平台进入“公众号设置”的“功能设置”里填写“JS接口安全域名”。
             * 2. 如果发现在 Android 不能分享自定义内容，请到官网下载最新的包覆盖安装，Android 自定义分享接口需升级至 6.0.2.58 版本及以上。
             * 3. 完整 JS-SDK 文档地址：http://mp.weixin.qq.com/wiki/7/aaa137b55fb2e0456bf8dd9148dd613f.html
             *
             * 如有问题请通过以下渠道反馈：
             * 邮箱地址：weixin-open@qq.com
             * 邮件主题：【微信JS-SDK反馈】具体问题
             * 邮件内容说明：用简明的语言描述问题所在，并交代清楚遇到该问题的场景，可附上截屏图片，微信团队会尽快处理你的反馈。
             */
            wx.ready(function() {
                alert('wx_ready');
                // 1 判断当前版本是否支持指定 JS 接口，支持批量判断

                document.querySelector('#checkJsApi').onclick = function() {
                    alert('checkJsApi');
                    wx.checkJsApi({
                        jsApiList: [
                            'getNetworkType',
                            'previewImage'
                        ],
                        success: function(res) {
                            alert(JSON.stringify(res));
                        }
                    });
                };

                // 2. 分享接口
                // 2.1 监听“分享给朋友”，按钮点击、自定义分享内容及分享结果接口
                document.querySelector('#onMenuShareAppMessage').onclick = function() {
                    wx.onMenuShareAppMessage({
                        title: '互联网之子',
                        desc: '在长大的过程中，我才慢慢发现，我身边的所有事，别人跟我说的所有事，那些所谓本来如此，注定如此的事，它们其实没有非得如此，事情是可以改变的。更重要的是，有些事既然错了，那就该做出改变。',
                        link: 'http://movie.douban.com/subject/25785114/',
                        imgUrl: 'http://img3.douban.com/view/movie_poster_cover/spst/public/p2166127561.jpg',
                        trigger: function(res) {
                            alert('用户点击发送给朋友');
                        },
                        success: function(res) {
                            alert('已分享');
                        },
                        cancel: function(res) {
                            alert('已取消');
                        },
                        fail: function(res) {
                            alert(JSON.stringify(res));
                        }
                    });
                    alert('已注册获取“发送给朋友”状态事件');
                };

                // 2.2 监听“分享到朋友圈”按钮点击、自定义分享内容及分享结果接口
                document.querySelector('#onMenuShareTimeline').onclick = function() {
                    wx.onMenuShareTimeline({
                        title: '互联网之子',
                        link: 'http://movie.douban.com/subject/25785114/',
                        imgUrl: 'http://img3.douban.com/view/movie_poster_cover/spst/public/p2166127561.jpg',
                        trigger: function(res) {
                            alert('用户点击分享到朋友圈');
                        },
                        success: function(res) {
                            alert('已分享');
                        },
                        cancel: function(res) {
                            alert('已取消');
                        },
                        fail: function(res) {
                            alert(JSON.stringify(res));
                        }
                    });
                    alert('已注册获取“分享到朋友圈”状态事件');
                };

                // 2.3 监听“分享到QQ”按钮点击、自定义分享内容及分享结果接口
                document.querySelector('#onMenuShareQQ').onclick = function() {
                    wx.onMenuShareQQ({
                        title: '互联网之子',
                        desc: '在长大的过程中，我才慢慢发现，我身边的所有事，别人跟我说的所有事，那些所谓本来如此，注定如此的事，它们其实没有非得如此，事情是可以改变的。更重要的是，有些事既然错了，那就该做出改变。',
                        link: 'http://movie.douban.com/subject/25785114/',
                        imgUrl: 'http://img3.douban.com/view/movie_poster_cover/spst/public/p2166127561.jpg',
                        trigger: function(res) {
                            alert('用户点击分享到QQ');
                        },
                        complete: function(res) {
                            alert(JSON.stringify(res));
                        },
                        success: function(res) {
                            alert('已分享');
                        },
                        cancel: function(res) {
                            alert('已取消');
                        },
                        fail: function(res) {
                            alert(JSON.stringify(res));
                        }
                    });
                    alert('已注册获取“分享到 QQ”状态事件');
                };

                // 2.4 监听“分享到微博”按钮点击、自定义分享内容及分享结果接口
                document.querySelector('#onMenuShareWeibo').onclick = function() {
                    wx.onMenuShareWeibo({
                        title: '互联网之子',
                        desc: '在长大的过程中，我才慢慢发现，我身边的所有事，别人跟我说的所有事，那些所谓本来如此，注定如此的事，它们其实没有非得如此，事情是可以改变的。更重要的是，有些事既然错了，那就该做出改变。',
                        link: 'http://movie.douban.com/subject/25785114/',
                        imgUrl: 'http://img3.douban.com/view/movie_poster_cover/spst/public/p2166127561.jpg',
                        trigger: function(res) {
                            alert('用户点击分享到微博');
                        },
                        complete: function(res) {
                            alert(JSON.stringify(res));
                        },
                        success: function(res) {
                            alert('已分享');
                        },
                        cancel: function(res) {
                            alert('已取消');
                        },
                        fail: function(res) {
                            alert(JSON.stringify(res));
                        }
                    });
                    alert('已注册获取“分享到微博”状态事件');
                };


                // 3 智能接口
                var voice = {
                    localId: '',
                    serverId: ''
                };
                // 3.1 识别音频并返回识别结果
                document.querySelector('#translateVoice').onclick = function() {
                    if (voice.localId == '') {
                        alert('请先使用 startRecord 接口录制一段声音');
                        return;
                    }
                    wx.translateVoice({
                        localId: voice.localId,
                        complete: function(res) {
                            if (res.hasOwnProperty('translateResult')) {
                                alert('识别结果：' + res.translateResult);
                            } else {
                                alert('无法识别');
                            }
                        }
                    });
                };


                // 4 音频接口
                // 4.2 开始录音
                document.querySelector('#startRecord').onclick = function() {
                    wx.startRecord({
                        cancel: function() {
                            alert('用户拒绝授权录音');
                        }
                    });
                };

                // 4.3 停止录音
                document.querySelector('#stopRecord').onclick = function() {
                    wx.stopRecord({
                        success: function(res) {
                            voice.localId = res.localId;
                        },
                        fail: function(res) {
                            alert(JSON.stringify(res));
                        }
                    });
                };

                // 4.4 监听录音自动停止
                wx.onVoiceRecordEnd({
                    complete: function(res) {
                        voice.localId = res.localId;
                        alert('录音时间已超过一分钟');
                    }
                });

                // 4.5 播放音频
                document.querySelector('#playVoice').onclick = function() {
                    if (voice.localId == '') {
                        alert('请先使用 startRecord 接口录制一段声音');
                        return;
                    }
                    wx.playVoice({
                        localId: voice.localId
                    });
                };

                // 4.6 暂停播放音频
                document.querySelector('#pauseVoice').onclick = function() {
                    wx.pauseVoice({
                        localId: voice.localId
                    });
                };

                // 4.7 停止播放音频
                document.querySelector('#stopVoice').onclick = function() {
                    wx.stopVoice({
                        localId: voice.localId
                    });
                };

                // 4.8 监听录音播放停止
                wx.onVoicePlayEnd({
                    complete: function(res) {
                        alert('录音（' + res.localId + '）播放结束');
                    }
                });

                // 4.8 上传语音
                document.querySelector('#uploadVoice').onclick = function() {
                    if (voice.localId == '') {
                        alert('请先使用 startRecord 接口录制一段声音');
                        return;
                    }
                    wx.uploadVoice({
                        localId: voice.localId,
                        success: function(res) {
                            alert('上传语音成功，serverId 为' + res.serverId);
                            voice.serverId = res.serverId;
                        }
                    });
                };

                // 4.9 下载语音
                document.querySelector('#downloadVoice').onclick = function() {
                    if (voice.serverId == '') {
                        alert('请先使用 uploadVoice 上传声音');
                        return;
                    }
                    wx.downloadVoice({
                        serverId: voice.serverId,
                        success: function(res) {
                            alert('下载语音成功，localId 为' + res.localId);
                            voice.localId = res.localId;
                        }
                    });
                };

                // 5 图片接口
                // 5.1 拍照、本地选图
                var images = {
                    localId: [],
                    serverId: []
                };
                document.querySelector('#chooseImage').onclick = function() {
                    wx.chooseImage({
                        success: function(res) {
                            images.localId = res.localIds;
                            alert('已选择 ' + res.localIds.length + ' 张图片');
                        }
                    });
                };

                // 5.2 图片预览
                document.querySelector('#previewImage').onclick = function() {
                    wx.previewImage({
                        current: 'http://img5.douban.com/view/photo/photo/public/p1353993776.jpg',
                        urls: [
                            'http://img3.douban.com/view/photo/photo/public/p2152117150.jpg',
                            'http://img5.douban.com/view/photo/photo/public/p1353993776.jpg',
                            'http://img3.douban.com/view/photo/photo/public/p2152134700.jpg'
                        ]
                    });
                };

                // 5.3 上传图片
                document.querySelector('#uploadImage').onclick = function() {
                    if (images.localId.length == 0) {
                        alert('请先使用 chooseImage 接口选择图片');
                        return;
                    }
                    var i = 0,
                        length = images.localId.length;
                    images.serverId = [];

                    function upload() {
                        wx.uploadImage({
                            localId: images.localId[i],
                            success: function(res) {
                                i++;
                                alert('已上传：' + i + '/' + length);
                                images.serverId.push(res.serverId);
                                if (i < length) {
                                    upload();
                                }
                            },
                            fail: function(res) {
                                alert(JSON.stringify(res));
                            }
                        });
                    }
                    upload();
                };

                // 5.4 下载图片
                document.querySelector('#downloadImage').onclick = function() {
                    if (images.serverId.length === 0) {
                        alert('请先使用 uploadImage 上传图片');
                        return;
                    }
                    var i = 0,
                        length = images.serverId.length;
                    images.localId = [];

                    function download() {
                        wx.downloadImage({
                            serverId: images.serverId[i],
                            success: function(res) {
                                i++;
                                alert('已下载：' + i + '/' + length);
                                images.localId.push(res.localId);
                                if (i < length) {
                                    download();
                                }
                            }
                        });
                    }
                    download();
                };

                // 6 设备信息接口
                // 6.1 获取当前网络状态
                document.querySelector('#getNetworkType').onclick = function() {
                    wx.getNetworkType({
                        success: function(res) {
                            alert(res.networkType);
                        },
                        fail: function(res) {
                            alert(JSON.stringify(res));
                        }
                    });
                };

                // 7 地理位置接口
                // 7.1 查看地理位置
                document.querySelector('#openLocation').onclick = function() {
                    wx.openLocation({
                        latitude: 23.099994,
                        longitude: 113.324520,
                        name: 'TIT 创意园',
                        address: '广州市海珠区新港中路 397 号',
                        scale: 14,
                        infoUrl: 'http://weixin.qq.com'
                    });
                };

                // 7.2 获取当前地理位置
                document.querySelector('#getLocation').onclick = function() {
                    wx.getLocation({
                        success: function(res) {
                            alert(JSON.stringify(res));
                        },
                        cancel: function(res) {
                            alert('用户拒绝授权获取地理位置');
                        }
                    });
                };

                // 8 界面操作接口
                // 8.1 隐藏右上角菜单
                document.querySelector('#hideOptionMenu').onclick = function() {
                    wx.hideOptionMenu();
                };

                // 8.2 显示右上角菜单
                document.querySelector('#showOptionMenu').onclick = function() {
                    wx.showOptionMenu();
                };

                // 8.3 批量隐藏菜单项
                document.querySelector('#hideMenuItems').onclick = function() {
                    wx.hideMenuItems({
                        menuList: [
                            'menuItem:readMode', // 阅读模式
                            'menuItem:share:timeline', // 分享到朋友圈
                            'menuItem:copyUrl' // 复制链接
                        ],
                        success: function(res) {
                            alert('已隐藏“阅读模式”，“分享到朋友圈”，“复制链接”等按钮');
                        },
                        fail: function(res) {
                            alert(JSON.stringify(res));
                        }
                    });
                };

                // 8.4 批量显示菜单项
                document.querySelector('#showMenuItems').onclick = function() {
                    wx.showMenuItems({
                        menuList: [
                            'menuItem:readMode', // 阅读模式
                            'menuItem:share:timeline', // 分享到朋友圈
                            'menuItem:copyUrl' // 复制链接
                        ],
                        success: function(res) {
                            alert('已显示“阅读模式”，“分享到朋友圈”，“复制链接”等按钮');
                        },
                        fail: function(res) {
                            alert(JSON.stringify(res));
                        }
                    });
                };

                // 8.5 隐藏所有非基本菜单项
                document.querySelector('#hideAllNonBaseMenuItem').onclick = function() {
                    wx.hideAllNonBaseMenuItem({
                        success: function() {
                            alert('已隐藏所有非基本菜单项');
                        }
                    });
                };

                // 8.6 显示所有被隐藏的非基本菜单项
                document.querySelector('#showAllNonBaseMenuItem').onclick = function() {
                    wx.showAllNonBaseMenuItem({
                        success: function() {
                            alert('已显示所有非基本菜单项');
                        }
                    });
                };

                // 8.7 关闭当前窗口
                document.querySelector('#closeWindow').onclick = function() {
                    wx.closeWindow();
                };

                // 9 微信原生接口
                // 9.1.1 扫描二维码并返回结果
                document.querySelector('#scanQRCode0').onclick = function() {
                    wx.scanQRCode();
                };
                // 9.1.2 扫描二维码并返回结果
                document.querySelector('#scanQRCode1').onclick = function() {
                    wx.scanQRCode({
                        needResult: 1,
                        desc: 'scanQRCode desc',
                        success: function(res) {
                            alert(JSON.stringify(res));
                        }
                    });
                };

                // 10 微信支付接口
                // 10.1 发起一个支付请求
                document.querySelector('#chooseWXPay').onclick = function() {
                    // 注意：此 Demo 使用 2.7 版本支付接口实现，建议使用此接口时参考微信支付相关最新文档。
                    wx.chooseWXPay({
                        timestamp: 1414723227,
                        nonceStr: 'noncestr',
                        package: 'addition=action_id%3dgaby1234%26limit_pay%3d&bank_type=WX&body=innertest&fee_type=1&input_charset=GBK&notify_url=http%3A%2F%2F120.204.206.246%2Fcgi-bin%2Fmmsupport-bin%2Fnotifypay&out_trade_no=1414723227818375338&partner=1900000109&spbill_create_ip=127.0.0.1&total_fee=1&sign=432B647FE95C7BF73BCD177CEECBEF8D',
                        signType: 'SHA1', // 注意：新版支付接口使用 MD5 加密
                        paySign: 'bd5b1933cda6e9548862944836a9b52e8c9a2b69'
                    });
                };

                // 11.3  跳转微信商品页
                document.querySelector('#openProductSpecificView').onclick = function() {
                    wx.openProductSpecificView({
                        productId: 'pDF3iY_m2M7EQ5EKKKWd95kAxfNw'
                    });
                };

                // 12 微信卡券接口
                // 12.1 添加卡券
                document.querySelector('#addCard').onclick = function() {
                    wx.addCard({
                        cardList: [{
                            cardId: 'pDF3iY9tv9zCGCj4jTXFOo1DxHdo',
                            cardExt: '{"code": "", "openid": "", "timestamp": "1418301401", "signature":"64e6a7cc85c6e84b726f2d1cbef1b36e9b0f9750"}'
                        }, {
                            cardId: 'pDF3iY9tv9zCGCj4jTXFOo1DxHdo',
                            cardExt: '{"code": "", "openid": "", "timestamp": "1418301401", "signature":"64e6a7cc85c6e84b726f2d1cbef1b36e9b0f9750"}'
                        }],
                        success: function(res) {
                            alert('已添加卡券：' + JSON.stringify(res.cardList));
                        }
                    });
                };

                // 12.2 选择卡券
                document.querySelector('#chooseCard').onclick = function() {
                    wx.chooseCard({
                        cardSign: '97e9c5e58aab3bdf6fd6150e599d7e5806e5cb91',
                        timestamp: 1417504553,
                        nonceStr: 'k0hGdSXKZEj3Min5',
                        success: function(res) {
                            alert('已选择卡券：' + JSON.stringify(res.cardList));
                        }
                    });
                };

                // 12.3 查看卡券
                document.querySelector('#openCard').onclick = function() {
                    alert('您没有该公众号的卡券无法打开卡券。');
                    wx.openCard({
                        cardList: []
                    });
                };

                var shareData = {
                    title: '微信JS-SDK Demo',
                    desc: '微信JS-SDK,帮助第三方为用户提供更优质的移动web服务',
                    link: 'http://demo.open.weixin.qq.com/jssdk/',
                    imgUrl: 'http://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRt8Qia4lv7k3M9J1SKqKCImxJCt7j9rHYicKDI45jRPBxdzdyREWnk0ia0N5TMnMfth7SdxtzMvVgXg/0'
                };
                wx.onMenuShareAppMessage(shareData);
                wx.onMenuShareTimeline(shareData);
            });

            wx.error(function(res) {
                alert(res.errMsg);
            });

        }
    });
    return View;
});
/* @source modules/weixin/index.js */;

define("modules/weixin/index", [
  "modules/weixin/view"
], function(View) {
    return {
        init: function(el) {
            var view = new View({
                el: el
            });
        }
    };
});
/* @source js/common/domWatcher.js */;

define("js/common/domWatcher", function() {
  window.Element && function(ElementPrototype) {
    ElementPrototype.matchesSelector = ElementPrototype.matchesSelector ||
      ElementPrototype.mozMatchesSelector ||
      ElementPrototype.msMatchesSelector ||
      ElementPrototype.oMatchesSelector ||
      ElementPrototype.webkitMatchesSelector;
  }(Element.prototype);
  var DomWatcher = function(options) {
    options = options || {};
    this.$el = $(options.el || document);
  };
  DomWatcher.prototype.exist = function(selector, callback) {
    var el = this.$el.find(selector);
    if (el.length > 0) {
      callback(el);
    }
    this.onadd(selector, callback);
  };
  DomWatcher.prototype.onadd = function(selector, callback) {
    var self = this;
    this.$el.on('DOMNodeInserted', function(e) {
      var target = e.target;
      var el = self._find(target, selector);
      if (el.length > 0) {
        callback(el);
      }
    });
  };
  DomWatcher.prototype.onremove = function(selector, callback) {
    var self = this;
    this.$el.on('DOMNodeRemoved', function(e) {
      var target = e.target;
      var el = self._find(target, selector);
      if (el.length > 0) {
        callback(el);
      }
    });
  };
  DomWatcher.prototype._find = function(inserted, selector) {
    var els = [];
    //只检查element元素
    if (inserted.nodeType === 1) {
      //先看子元素中是否包含满足条件的元素
      var el = $(inserted).find(selector);
      if (el.length > 0) {
        els = Array.prototype.slice.call(el, 0);
      }
      //再检查当前被插入的元素是否满足条件
      if (inserted.matchesSelector(selector)) {
        els.push(inserted);
      }
    }
    return $(els);
  };
  return DomWatcher;
});
/* @source js/common/moduleRunner.js */;

define("js/common/moduleRunner", [
  "js/common/domWatcher"
], function(DomWatcher) {
  //当组件从页面中摘除时，需要取消组件的事件监听
  new DomWatcher().onremove('[data-module]', function(els) {
    els.each(function(i, el) {
      var view = el.__view;
      //当$(el).data('view')存在时，说明并不是要真正摘除这个节点，可能是append到另外的地方，因此不能取消事件监听
      if (view && !$(el).data('view')) {
        view.stopListening();
      }
    });
  });
  return {
    run: function(modules) {
      for (var name in modules) {
        var module = modules[name];
        if (!module) continue;
        try {
          if (module.init) {
            (function(module) {
              new DomWatcher().exist('[data-module="' + name + '"]', function(el) {
                if (!el.data('view')) {
                  module.init(el);
                }
              });
            })(module);
          }
        } catch (e) {
          console.error(e.stack);
        }
      }
    }
  }
});
/* @source js/index/modules.js */;

define("js/index/modules", [
  "js/common/moduleRunner",
  "modules/weixin/index"
], function(ModuleRunner, weixin) {
    var modules = {
        weixin: weixin
    };
    ModuleRunner.run(modules);
});
/* @source  */;

require(['js/index/modules'], function() {});