define([ "./view" ], function(View) {
    return {
        init: function() {
            var view = new View({
                el: $('[data-module="recommend"]')
            });
        }
    };
});