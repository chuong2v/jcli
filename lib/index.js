var chalk = require('chalk');
var fs = require('fs');
var log = console.log;

var Config = require('./config');
var Issues = require('./issues');
var Utils = require('./utils');

var config = {};

exports.config = Config;
exports.issues = new Issues();
exports.utils = new Utils();