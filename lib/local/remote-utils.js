var spawn = require('child_process').spawn,
    util = require('../util'),
    config = util.getConfig();

module.exports.awake = function() {
    var server = spawn('ssh', [
        config.userName + '@' + config.hostname, 
        '"sicksync-remote"'
    ]);

    return server;
};