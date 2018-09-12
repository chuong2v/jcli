var log = console.log;
var chalk = require("chalk");
var config = require("./config");

exports.checkCredentials = function () {
  if (!config.isValid) {
    log(chalk.red("\nMissing credentials info.\n"));
    log("Set up your credential by below command:\n");
    log(chalk.italic("\tjlient config.host <host>"));
    log(chalk.italic("\tjlient config.user <user name>"));
    log(chalk.italic("\tjlient config.pass <password>"));
    process.exit(1);
  }
};