var request = require("request-promise");
var debug = require("debug");
var lodash = require("lodash");
var qs = require("querystring");
var chalk = require("chalk");
var log = console.log;
var config = require("./config");

module.exports = function () {
  this.mappings = {
    data: (options) => {
      var obj = {
        assignee: {
          name: options.assignee
        },
        project: {
          key: options.project
        },
        summary: options.summary,
        description: options.description,
        issuetype: {
          name: options.issuetype
        },
        components: (options.components || config.default.component || "").split(",").map(lodash.trim).map(name => ({ name })),
        versions: (options.versions || config.default.version || "").split(",").map(lodash.trim).map(name => ({ name })),
        timetracking: {
          originalEstimate: options.originalEstimate,
          remainingEstimate: options.remainingEstimate
        },
        duedate: options.duedate
      };

      if (options.parent) {
        obj.parent = { key: options.parent };
      }
      return obj;
    },
  };

  this.fetch = options => {
    var queryStr;
    if (options.query) {
      queryStr = options.query;
    } else {
      var queryArr = [];
      if (options.myIssues) {
        queryArr.push("assignee=currentuser()");
      }

      var filters = ["project", "sprint", "status", "component"];
      var defaultFilter = config.default;

      filters.forEach(filter => {
        var opts = [];
        if (options[filter]) {
          opts = options[filter].split(",").map(value => `'${value.trim()}'`);
        } else if (!options.ignoreDefaults && defaultFilter[filter]) {
          opts = defaultFilter[filter].split(",").map(value => `'${value.trim()}'`);
        }
        opts.length && queryArr.push(`${filter} IN (${opts.join(",")})`);
      });

      queryStr = queryArr.join(" AND ");
    }

    var queryObj = {
      jql: queryStr,
      fields: "summary",
      maxResults: options.maxResults || 10,
      startAt: options.startAt || 0
    };
    var qsStr = qs.stringify(queryObj);
    debug("QI:issues")("qsStr: ", qsStr);

    return request(config.host + "/rest/api/2/search", {
      qs: queryObj,
      auth: config.auth
    }).then(result => {
      debug("QI:issues")("result: ", result);
      JSON.parse(result).issues.forEach(issue => {
        debug("QI:issues:issue")("[" + issue.key + "]" + issue.fields.summary);
        log("[" + issue.key + "]" + issue.fields.summary);
      });
    }).catch(error => {
      debug("QI:issues")("error: ", (error));
      if (error.statusCode == 403) {
        log("error: ", error.statusCode);
        log(chalk.red("Invalid host or authentication failed."));
        log(chalk.red("Check your config or reset your credentials by below command:\n"));
        log(chalk.italic("\tjira config.host <host>"));
        log(chalk.italic("\tjira config.user <user name>"));
        log(chalk.italic("\tjira config.pass <password>"));
      }
    });
  };

  this.get = (issueId, options) => {
    var queryObj;
    if (options.fields != "*") {
      queryObj = {
        fields: options.fields
      };
    }
    return request(config.host + "/rest/api/2/issue/" + issueId, {
      qs: queryObj,
      auth: config.auth
    }).then(result => {
      debug("QI:issue:result")("result: ", result);
      log("result: ", result);
    }).catch(error => {
      debug("QI:issue:error")("error: ", (error));
      log("error: ", error.toString());
    });
  };

  this.create = options => {
    var body = {
      fields: this.mappings.data(options)
    };

    return request({
      method: "POST",
      uri: config.host + "/rest/api/2/issue/",
      auth: config.auth,
      json: true,
      headers: {
        "content-type": "application/json"
      },
      body: body
    }).then(result => {
      debug("QI:issue:create:result")("result: ", result);
      log("result: ", result);
    }).catch(error => {
      debug("QI:issue:create:error")("error: ", (error));
      log("error: ", error.toString());
    });
  };
};