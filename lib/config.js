var log = console.log;
var chalk = require("chalk");
var fs = require("fs");
var lodash = require("lodash");

var path = require("path");
var configPath = process.env.NODE_CONFIG_PATH || path.resolve(__dirname, "../.jira/config.json");

var config;

if (fs.existsSync(configPath)) {
  config = require(configPath);
} else {
  config = {
    host: "",
    auth: {
      user: "",
      pass: ""
    },
    default: {
      project: "",
      sprint: ""
    }
  };
  fs.writeFileSync(configPath, JSON.stringify(config));
  // log(chalk.green('\nYour configuration file has been initial successfully.\n'));
  // log("Set up your credential by below command:\n");
  // log(chalk.italic("\tjlient config.host <host>"));
  // log(chalk.italic("\tjlient config.user <user name>"));
  // log(chalk.italic("\tjlient config.pass <password>"));
}

function updateConfig() {
  fs.writeFile(configPath, JSON.stringify(config), function (err) {
    if (err) return log("err", err);
    log("Your configurations has been saved successfully.");
  });
}

module.exports = {
  config: config,
  get default() {
    return config.default;
  },
  get show() {
    log("Host: ", chalk.yellow(config.host));
    log("User name: ", chalk.yellow(config.auth.user));
    log("Password: ", config.auth.pass && chalk.yellow("********") || "");
    config.default.project && log("Default project: ", chalk.yellow(config.default.project));
    config.default.sprint && log("Default sprint: ", chalk.yellow(config.default.sprint));
    return config;
  },
  get host() {
    return config.host;
  },
  get auth() {
    return config.auth;
  },
  get isValid() {
    return (config.host || config.auth.user || config.auth.pass);
  },
  set host(value) {
    if (value) {
      log("Host: ", value);
      lodash.set(config, "host", value);
      updateConfig();
      return true;
    }
    return false;
  },
  set user(value) {
    if (value) {
      log("User: ", value);
      lodash.set(config, "auth.user", value);
      updateConfig();
      return value;
    }
    return false;
  },
  set pass(value) {
    if (value) {
      lodash.set(config, "auth.pass", value);
      updateConfig();
      return value;
    }
    return false;
  },
  set sprint(value) {
    log("Default sprint: ", chalk.yellow(value));
    lodash.set(config, ["default", "sprint"], value);
    updateConfig();
    return value;
  },
  set project(value) {
    log("Default project: ", chalk.yellow(value));
    lodash.set(config, ["default", "project"], value);
    updateConfig();
    return value;
  },
  set component(value) {
    log("Default component: ", chalk.yellow(value));
    lodash.set(config, ["default", "component"], value);
    updateConfig();
    return value;
  }
};