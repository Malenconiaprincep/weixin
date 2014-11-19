var fs = require('fs');
var io;
var path = require('path');
var logger = require('log4js').getLogger('page:index');
var _ = require('underscore');

module.exports = {
    init: function(host) {
        var modulePath = path.join(__dirname, 'modules');
        var moduleNames = fs.readdirSync(modulePath);
        host.loadModule(moduleNames);
    },
    unload: function(app) {

    }
}