var WebSocket = require('ws'),
    EventEmitter = require('events').EventEmitter,
    util = require('./util'),
    crypt = require('./crypt'),
    remote = require('./remote-util'),
    config = util.getConfig(),
    events = null,
    ws = null,
    hostUrl = null;

function WSClient(params) {
    hostUrl = params.url;
    events = new EventEmitter();

    ws = new WebSocket(hostUrl);
    ws.on('open', onConnect);
    ws.on('message', onMessage);
    ws.on('close', onDisconnect);
    ws.on('error', reconnect);

    return {
        send: send,
        on: events.on.bind(events)
    };
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
        return reconnect();
    }

    process.exit();
}

function reconnect() {
    var remote = remote.awake();
    util.log('resuming sicksync @', config.hostname);

    remote.on('message', function(message) {

    });
}

module.exports = WSClient;
