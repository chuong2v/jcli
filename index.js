#!/usr/bin/env node
'use strict';
var request = require('request-promise');
var lodash = require('lodash');
var debug = require('debug');
var qs = require('querystring');
var chalk = require('chalk');
var appCfg = require('./package.json');

var program = require('commander');
var fs = require('fs');
var configPath = process.env.NODE_CONFIG_PATH || './.jira/config.json';
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
  fs.writeFile(configPath, JSON.stringify(config), function (err) {
    if (err) return console.log(err);
    console.log('Your configurations has been initial successfully.');
  });
}

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
      console.log('Host: ', config.host);
      console.log('User: ', config.auth.user);
      return;
    }
    if (options.host || options.user || options.pass) {
      if (options.host) {
        console.log('Host: ', options.host);
        lodash.set(config, "host", options.host);
      }
      if (options.user) {
        console.log('User: ', options.user);
        lodash.set(config, "auth.user", options.user);
      }
      if (options.pass) {
        lodash.set(config, "auth.pass", options.pass);
      }
      fs.writeFile(process.env.NODE_CONFIG_DIR + '/default.json', JSON.stringify(config), function (err) {
        if (err) return console.log(err);
        console.log('Your configurations has been saved successfully.');
      });
    }
  })

program.on('command:issues', function () {
  if(!(config.host || config.auth.user || config.auth.pass)){
    console.log("Missing credential info.\n");
    console.log("Set up your credential by below command:\n");
    console.log(chalk.italic("\tjira config -u username -p password -h host\n"));
  }
  process.exit(1);
});

program
  .command('issues [issueId]')
  .description('Get issue(s)')
  .option('-s, --status <status>', 'Filter by status')
  .option('-p, --project <project>', 'Filter by project')
  .option('-sp, --sprint <sprint>', 'Filter by sprint')
  .action(function (issueId, options) {
    if (issueId) {
      console.log('issueId: ', issueId);
      issue(issueId);
    } else {
      issues(options);
    }
  });

program.parse(process.argv);

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
    maxResults: 100,
    startAt: 0
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
      console.log("[" + issue.key + "]" + issue.fields.summary)
    })
  }).catch(function (error) {
    debug('QI:issues')('error: ', (error));
    console.log('error: ', error.toString());
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
    console.log('result: ', result);
  }).catch(function (error) {
    debug('QI:issue:error')('error: ', (error));
    console.log('error: ', error.toString());
  })
}

