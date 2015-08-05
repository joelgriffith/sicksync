var _ = require('lodash'),
    WebSocket = require('ws'),
    EventEmitter = require('events').EventEmitter,
    util = require('../util'),
    crypt = require('../crypt'),
    remoteUtil = require('./remote-utils'),
    config = util.getConfig(),
    events = null,
    ws = null,
    hostUrl = null,
    port = null;

function WSClient() {
    hostUrl = config.hostname;
    events = new EventEmitter();
    updateAndWakeRemote();

    return {
        send: send,
        on: events.on.bind(events)
    };
}

function connect(port) {
    ws = new WebSocket(hostUrl + ':' + port);
    ws.on('open', onConnect);
    ws.on('message', onMessage);
    ws.on('close', onDisconnect);
    ws.on('error', updateAndWakeRemote);
}

function send(obj) {
    ws.send(crypt.stringifyAndEncrypt(obj));
}

function onConnect() {
    send({
        subject: 'handshake',
        token: config.secret
    });
}

function onMessage(message) {
    var parsedMessage = crypt.decryptAndParse(message);

    if (parsedMessage.subject === 'handshake' && parsedMessage.isAllowed) {
        events.emit('authorized');
    }
}

function onDisconnect() {
    util.log('connection with', config.hostname, 'was lost');

    if (config.retryOnDisconnect) {
        return updateAndWakeRemote();
    }

    process.exit();
}

function updateAndWakeRemote() {
    var remote = remoteUtil.awake();
    util.log('resuming sicksync @', config.hostname);

    // TODO: Flush out remote messages
    remote.stdout.on('data', function(data) {
        var message = data.toString() || '';
        if (_.contains(message, 'READY')) {
            port = message.replace('READY:', '');
            return connect(port);
        }

        if (_.contains(message, 'CLOSED')) {
            return onDisconnect();
        }

        util.log(data);
    });

    remote.stderr.on('data', function(data) {
        util.log(data.toString());
    });

    remote.on('close', function (code) {
        util.log('closed with code: ' + code);
    });
}

module.exports = WSClient;
