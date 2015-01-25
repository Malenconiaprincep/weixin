define([ "js/common/moduleRunner", "modules/weixin/index" ], function(ModuleRunner, weixin) {
    var modules = {
        weixin: weixin
    };
    ModuleRunner.run(modules);
});