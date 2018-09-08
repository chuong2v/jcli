var log = console.log;
var chalk = require('chalk');
var config = require('./config');

module.exports = function () {
  this.checkCredentials = function () {
    if (!config.isValid) {
      log(chalk.red("\nMissing credentials info.\n"));
      log(chalk.red("Set up your credentials by below command:\n"));
      log(chalk.red(chalk.italic("\tjira config -u <username> -p <password> -h <host>\n")));
      process.exit(1);
    }
  };
}