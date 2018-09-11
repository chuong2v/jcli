var Issues = require("./issues");
var Notes = require("./notes");

exports.config = require("./config");
exports.utils = require("./utils");
exports.issues = new Issues();
exports.notes = new Notes();