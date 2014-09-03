var fs = require('fs');
var io;
var path = require('path');
var logger = require('log4js').getLogger('page:index');
var _ = require('underscore');
require('ozjs');

module.exports = {
    init: function(host) {
        var modulePath = path.join(__dirname, 'modules');
        var moduleNames = fs.readdirSync(modulePath);
        host.loadModule(moduleNames);
    },
    watch: function() {
        logger.debug('Watching...');
        var watching = false;
        io.sockets.on('connection', function(socket) {
            if (!watching) {
                var list = ['dist/css', 'dist/js', 'views'];
                list.forEach(function(files) {
                    fs.watch(path.join(__dirname, files), function() {
                        io.sockets.emit('change');
                    });
                });
                watching = true;
            }
        });
    },
    unload: function(app) {

    }
}
