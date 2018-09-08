#!/usr/bin/env node
'use strict';
var request = require('request-promise');
var lodash = require('lodash');
var debug = require('debug');
var qs = require('querystring');
var chalk = require('chalk');
var log = console.log;
var appCfg = require('./package.json');

var program = require('commander');
var fs = require('fs');
var configPath = process.env.NODE_CONFIG_PATH || (__dirname + '/.jira/config.json');
var config = {};

if (fs.existsSync(configPath)) {
  config = require(configPath);
} else {
  config = {
    host: "",
    auth: {
      user: "",
      pass: ""
    }
  };
  fs.writeFileSync(configPath, JSON.stringify(config));
  log(chalk.green('\nYour configuration file has been initial successfully.\n'));
  log("Set up your credential by below command:\n");
  log(chalk.italic("\tjira config -u <username> -p <password> -h <host>\n"));
}

// error on unknown commands
program.on('command:*', function () {
  console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
  process.exit(1);
});

program
  .version(appCfg.version, '-v, --version')
  .option('-mi, --my-issues', 'Fetch my issues')
  .option('-i, --issue <issueId>', 'Get issue')
  .option('-f, --fields <fields>', 'Fields', 'summary')
  .option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble');

program
  .command('config').description('Setup JIRA host and account')
  .option('-cd, --credential', 'Get JIRA config')
  .option('-h, --host <host>', 'JIRA host')
  .option('-u, --user <user>', 'JIRA user')
  .option('-p, --pass <pass>', 'JIRA password')
  .action(function (options) {
    if (options.credential) {
      log('Host: ', config.host);
      log('User: ', config.auth.user);
      return;
    }
    if (options.host || options.user || options.pass) {
      if (options.host) {
        log('Host: ', options.host);
        lodash.set(config, "host", options.host);
      }
      if (options.user) {
        log('User: ', options.user);
        lodash.set(config, "auth.user", options.user);
      }
      if (options.pass) {
        lodash.set(config, "auth.pass", options.pass);
      }
      fs.writeFile(configPath, JSON.stringify(config), function (err) {
        if (err) return log(err);
        log('Your configurations has been saved successfully.');
      });
    }
  })

program
  .command('issues [issueId]')
  .description('Get issue(s)')
  .option('-s, --status <status>', 'Filter by status')
  .option('-p, --project <project>', 'Filter by project')
  .option('-sp, --sprint <sprint>', 'Filter by sprint')
  .option('-l, --max-results <maxResults>', 'set max results')
  .option('-sa, --start-at <startAt>', 'start at')
  .action(function (issueId, options) {
    checkCredentials();
    if (issueId) {
      log('issueId: ', issueId);
      issue(issueId);
    } else {
      issues(options);
    }
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp(chalk.red);
}

function checkCredentials() {
  if (!(config.host || config.auth.user || config.auth.pass)) {
    log(chalk.red("\nMissing credentials info.\n"));
    log(chalk.red("Set up your credentials by below command:\n"));
    log(chalk.red(chalk.italic("\tjira config -u <username> -p <password> -h <host>\n")));
    process.exit(1);
  }
};

if (program.myIssues) {
  issues();
}
if (program.issue) {
  issue();
}
function issues(options) {
  var queryStr = `assignee=currentuser()`;
  var filters = ['project', 'sprint', 'status'];
  filters.forEach(function (filter) {
    if (options[filter]) {
      queryStr += ` AND ${filter}='${options[filter]}'`;
    }
  })
  var queryObj = {
    jql: queryStr,
    fields: "summary",
    maxResults: options.maxResults || 10,
    startAt: options.startAt || 0
  }
  var qsStr = qs.stringify(queryObj);
  debug('QI:issues')('qsStr: ', qsStr);
  return request(config.host + "/rest/api/2/search", {
    qs: queryObj,
    auth: config.auth
  }).then(function (result, body) {
    debug('QI:issues')('result: ', result);
    JSON.parse(result).issues.forEach(function (issue) {
      debug('QI:issues:issue')("[" + issue.key + "]" + issue.fields.summary)
      log("[" + issue.key + "]" + issue.fields.summary)
    })
  }).catch(function (error) {
    debug('QI:issues')('error: ', (error));
    if (error.statusCode == 403) {
      log('error: ', error.statusCode);
      log(chalk.red('Invalid host or authentication failed.'))
      log(chalk.red("Set up your credentials by below command:\n"));
      log(chalk.red(chalk.italic("\tjira config -u <username> -p <password> -h <host>\n")));
    }
  })
}

function issue(issueId) {
  var queryObj = {
    fields: program.fields
  }
  return request(config.host + "/rest/api/2/issue/" + (issueId || program.issue), {
    qs: queryObj,
    auth: config.auth
  }).then(function (result) {
    debug('QI:issue:result')('result: ', result);
    log('result: ', result);
  }).catch(function (error) {
    debug('QI:issue:error')('error: ', (error));
    log('error: ', error.toString());
  })
}