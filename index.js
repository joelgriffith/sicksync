#! /usr/bin/env node

var fs = require('fs-extra'),
    program = require('commander'),
    util = require('./lib/util'),
    package = require('./package.json'),
    bigSync = require('./lib/big-sync'),
    configPath = util.getConfigPath(),
    hasSetup = fs.existsSync(configPath),
    config = null;

require('./commands/index')(program);

program
    .version(package.version)
    .parse(process.argv);
