var request = require('request-promise');
var debug = require('debug');
var qs = require('querystring');
var chalk = require('chalk');
var log = console.log;
var config = require('./config')

module.exports = function () {

  this.fetch = options => {
    var queryStr = `assignee=currentuser()`;
    var filters = ['project', 'sprint', 'status'];

    var defaultFilter = config.default;

    filters.forEach(filter => {
      if (options[filter]) {
        queryStr += ` AND ${filter}='${options[filter]}'`;
      } else if (!options.ignoreDefaults && defaultFilter[filter]) {
        queryStr += ` AND ${filter}='${defaultFilter[filter]}'`;
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
    }).then(result => {
      debug('QI:issues')('result: ', result);
      JSON.parse(result).issues.forEach(issue => {
        debug('QI:issues:issue')("[" + issue.key + "]" + issue.fields.summary)
        log("[" + issue.key + "]" + issue.fields.summary)
      })
    }).catch(error => {
      debug('QI:issues')('error: ', (error));
      if (error.statusCode == 403) {
        log('error: ', error.statusCode);
        log(chalk.red('Invalid host or authentication failed.'))
        log(chalk.red("Set up your credentials by below command:\n"));
        log(chalk.red(chalk.italic("\tjira config -u <username> -p <password> -h <host>\n")));
      }
    })
  }

  this.get = (issueId, options) => {
    var queryObj;
    if(options.fields != "*"){
      queryObj = {
        fields: options.fields
      }
    }
    return request(config.host + "/rest/api/2/issue/" + issueId, {
      qs: queryObj,
      auth: config.auth
    }).then(result => {
      debug('QI:issue:result')('result: ', result);
      log('result: ', result);
    }).catch(error => {
      debug('QI:issue:error')('error: ', (error));
      log('error: ', error.toString());
    })
  }
}