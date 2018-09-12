var Issues = require("./issues");
var Notes = require("./notes");

var issues = new Issues();

exports.config = require("./config");
exports.utils = require("./utils");
exports.issues = issues;
exports.notes = new Notes(issues);