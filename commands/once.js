var bigSync = require('../lib/big-sync'),
    util = require('../lib/util');

module.exports = function onceCommand(program) {
    program
        .command('once')
        .description('Runs a one-time sync')
        .action(function(/*name, command*/) {
            bigSync(function() {
                util.log('Complete!');
            });
        });
};
