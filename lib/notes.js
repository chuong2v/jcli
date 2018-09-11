var request = require("request-promise");
var debug = require("debug");
var lodash = require("lodash");
var qs = require("querystring");
var chalk = require("chalk");
var path = require("path");
var fs = require("fs");
var log = console.log;
var config = require("./config");
var mime = require("mime");
var Promise = require("bluebird");

module.exports = function () {
  this.issues = function () {
    return fs.readdirSync(path.resolve(__dirname, "../.jira/notes")).reduce(function (list, file) {
      if (mime.getType(file) === "application/json") {
        var issue = require(path.resolve(__dirname, "../.jira/notes", file));
        var fileName = file.slice(0, -5);
        log(`[${fileName}]${issue.summary}`);
        return list.concat(fileName);
      } else {
        return list;
      }
    }, []);
  };
};