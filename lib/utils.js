var log = console.log;
var chalk = require("chalk");
var config = require("./config");

exports.checkCredentials = function () {
  if (!config.isValid) {
    log(chalk.red("\nMissing credentials info.\n"));
    log("Set up your credential by below command:\n");
    log(chalk.italic("\tjira config.host <host>"));
    log(chalk.italic("\tjira config.user <user name>"));
    log(chalk.italic("\tjira config.pass <password>"));
    process.exit(1);
  }
};