define([ "js/collections/base", "./model" ], function(Base, Model) {
    var Colletion = Base.extend({
        model: Model,
        moduleName: "applist"
    });
    return Colletion;
});