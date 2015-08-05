var fs = require('fs'),
    watcher = require('chokidar'),
    path = require('path'),
    util = require('../lib/util'),
    WebSocketClient = require('../lib/ws-client'),
    bigSync = require('../lib/big-sync'),
    config = util.getConfig(),
    ignored = config.excludes,
    isPaused = false,
    devbox = null,
    fswatcher = null;

var NUM_FILES_FOR_LARGE_SEND = 10;
var FILE_CHANGE_COOLDOWN_TIME = 10;

var rebouncedFileChange = util.rebounce(onFileChange, onBigTransfer, NUM_FILES_FOR_LARGE_SEND, FILE_CHANGE_COOLDOWN_TIME);

function onBigTransfer() {
    if (config.debug) util.log('sending large change');

    bigSync(onBigTransferDone);
    isPaused = true;
}

function onBigTransferDone() {
    if (config.debug) {
        util.log('received large change');
    }
    isPaused = false;
}

function filterAndRebounce(evt, filepath) {
    var relativePath = filepath.replace(config.sourceLocation, '');

    if (util.isExcluded(relativePath, ignored) || isPaused) return false;

    rebouncedFileChange(evt, filepath);
}

function onFileChange(evt, filepath) {
    if (util.isExcluded(filepath, ignored) || isPaused) return false;
    var fileContents = null;
    var fullRemotePath = filepath.replace(config.sourceLocation, config.destinationLocation);
    var localPath = filepath.replace(config.sourceLocation, '');

    if (evt === 'add' || evt === 'change') {
        fileContents = fs.readFileSync(filepath).toString();
    }

    if (config.debug) {
        util.log(evt, '>', localPath);
    }

    devbox.send({
        subject: 'file',
        changeType: evt,
        location: fullRemotePath,
        contents: fileContents ? fileContents : null,
        name: path.basename(filepath)
    });
}

function startFileWatch() {
    if (fswatcher){
        fswatcher.close();
    }
    fswatcher = watcher.watch(config.sourceLocation, {
        ignored: ignored,
        persistent: true,
        followSymlinks: config.followSymlinks,
        ignoreInitial: true
    }).on('all', filterAndRebounce);
}

function onAuthorized() {
    util.log('Bringing remote up to date');

    bigSync(function() {
        util.log(('Connected to ' + config.hostname + (config.prefersEncrypted ? ' using' : ' not using') + ' encryption').green);
        startFileWatch();
    });
}

module.exports.start = function() {
    devbox = new WebSocketClient({
        url: 'ws://' + config.hostname + ':' + config.websocketPort
    });

    devbox.on('authorized', onAuthorized);
};
