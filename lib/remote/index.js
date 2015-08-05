// TODO: Pull out FS code here
var fs = require('fs-extra'),
    Server = require('./ws-server'),
    util = require('../util'),
    debug = true;

module.exports.start = function() {
    function addFile(message) {
        fs.outputFile(message.location, message.contents);
    }

    function addDir(message) {
        fs.mkdirs(message.location);
    }

    function removePath(message) {
        fs.delete(message.location);
    }
    server = new Server();
    server.on('file-change', function(message) {
        if (debug) util.log(message.changeType, '<', message.location);

        switch (message.changeType) {
            case 'add':
                addFile(message);
                break;
            case 'addDir':
                addDir(message);
                break;
            case 'change':
                addFile(message);
                break;
            case 'unlink':
                removePath(message);
                break;
            case 'unlinkDir':
                removePath(message);
                break;
            default:
                break;
        }
    });
    server.on('connection-closed', function() {
        util.log('connection lost, closing');
        process.exit();
    });
}
