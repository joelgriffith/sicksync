var local = require('../lib/local/index'),
    util = require('../lib/util');

module.exports = function onceCommand(program) {
    program
        .command('start')
        .description('Runs the continuous sicksync process')
        .action(function(/*name, command*/) {
            local.start();
        });
};
