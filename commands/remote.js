var remote = require('../lib/remote/index'),
    util = require('../lib/util');

module.exports = function onceCommand(program) {
    program
        .command('remote')
        .description('Runs the remote portion of sicksync')
        .action(function(/*name, command*/) {
            remote.start();
        });
};
