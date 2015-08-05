var fs = require('fs'),
    EventEmitter = require('events').EventEmitter,
    watcher = require('chokidar'),
    path = require('path'),
    util = require('../util'),
    bigSync = require('../big-sync'),
    config = util.getConfig(),
    ignored = config.excludes,
    isPaused = false,
    fswatcher = null,
    events = new EventEmitter();

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

    events.emit('file-change', {
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

module.exports = {
    on: events.on.bind(events),
    start: function() {
        util.log('Bringing remote up to date');

        bigSync(function() {
            util.log(('Connected to ' + config.hostname + (config.prefersEncrypted ? ' using' : ' not using') + ' encryption').green);
            startFileWatch();
        });
    }
};