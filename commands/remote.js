var remote = require('../lib/remote');

module.exports = function sicksyncRemoteCommand(program) {
	program
        .command('remote')
        .option('-s, --secret <secret>', 'A secret used to block unkown subscribers (should match with config.secret).')
        .option('-p, --port <port>', 'The port in which to listen for incoming sync messages.')
        .option('-d, --debug', 'Show debug messages')
        .option('-e, --encrypt', 'Enable encryption on messages')
        .action(remote);
};