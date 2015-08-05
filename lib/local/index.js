var WebSocketClient = require('./ws-client'),
    fsHelper = require('./fs-helper');

module.exports.start = function() {
    var ws = new WebSocketClient(); // TODO: Implement port detection...

    ws.on('authorized', function() {
        fsHelper.start();
        fsHelper.on('file-change', ws.send);
    });
};
