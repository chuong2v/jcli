var log = console.log;
var chalk = require("chalk");
var config = require("./config");
var path = require("path");
var jconfig = require(path.resolve(__dirname, "../package.json"));
var appName = jconfig.name;

exports.checkCredentials = function () {
  if (!config.isValid) {
    log(chalk.red("\nMissing credentials info.\n"));
    log("Set up your credential by below command:\n");
    log(chalk.italic(`\t${appName} config.host <host>`));
    log(chalk.italic(`\t${appName} config.user <user name>`));
    log(chalk.italic(`\t${appName} config.pass <password>\n`));
    process.exit(1);
  }
};