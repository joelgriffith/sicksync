var WebSocketClient = require('./ws-client'),
    fsHelper = require('./fs-helper');

module.exports.start = function() {
    var ws = new WebSocketClient();

    ws.on('authorized', function() {
        fsHelper.start();
        fsHelper.on('file-change', ws.send);
    });
};
