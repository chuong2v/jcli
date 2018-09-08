#!/usr/bin/env node
'use strict';
var appCfg = require('./package.json');
var lib = require('./lib');
var lodash = require('lodash');

var program = require('commander');

// error on unknown commands
program.on('command:*', () => {
  console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
  process.exit(1);
});

program
  .version(appCfg.version, '-v, --version');

program
  .command('config').description('Get JIRA host and account')
  .action(() => lib.config.show);

program
  .command('config.user <username>').description('Setup JIRA user name')
  .action(username => lib.config.user = username);

program
  .command('config.pass <password>').description('Setup JIRA password')
  .action(pass => lib.config.pass = pass);

program
  .command('config.host <host>').description('Setup JIRA host')
  .action(host => lib.config.host = host);

program
  .command('config.project <project>').description('Set default project')
  .action(project => lib.config.project = project);

program
  .command('config.sprint <sprint>').description('Set default sprint')
  .action(sprint => lib.config.sprint = sprint);

program
  .command('issues [issueId]')
  .option('-s, --status <status>', 'Filter by status')
  .option('-p, --project <project>', 'Filter by project')
  .option('-P, --sprint <sprint>', 'Filter by sprint')
  .option('-l, --max-results <maxResults>', 'set max results')
  .option('-S, --start-at <startAt>', 'start at')
  .option('-f, --fields <fields>', 'Fields', 'summary')
  .option('--ignore-defaults', 'ignore default value')
  .description('Get issue(s)')
  .action((issueId, options) => {
    lib.utils.checkCredentials();
    if (issueId) {
      lib.issues.get(issueId, options);
    } else {
      lib.issues.fetch(options);
    }
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}