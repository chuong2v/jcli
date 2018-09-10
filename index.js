#!/usr/bin/env node
"use strict";
var appCfg = require("./package.json");
var lib = require("./lib");

var program = require("commander");

// error on unknown commands
program.on("command:*", () => {
  console.log("Invalid command: %s\nSee --help for a list of available commands.", program.args.join(" "));
  process.exit(1);
});

program
  .version(appCfg.version, "-v, --version");

program
  .command("config").description("Get JIRA host and account")
  .action(() => lib.config.show);

program
  .command("config.user <username>").description("Set JIRA user name")
  .action(username => lib.config.user = username);

program
  .command("config.pass <password>").description("Set JIRA password")
  .action(pass => lib.config.pass = pass);

program
  .command("config.host <host>").description("Set JIRA host")
  .action(host => lib.config.host = host);

program
  .command("config.project <project>").description("Set default project")
  .action(project => lib.config.project = project);

program
  .command("config.sprint <sprint>").description("Set default sprint")
  .action(sprint => lib.config.sprint = sprint);

program
  .command("config.component <component>").description("Set default component")
  .action(component => lib.config.component = component);

program
  .command("issues [issueId]")
  .option("-m, --my-issues", "current user")
  .option("-q, --query <query>", "sql query")
  .option("-s, --status <status>", "Filter by status")
  .option("-p, --project <project>", "Filter by project")
  .option("-P, --sprint <sprint>", "Filter by sprint")
  .option("--issuetype <issuetype>", "Filter by issuetype")
  .option("-c, --component <component>", "Filter by component")
  .option("-l, --max-results <maxResults>", "set max results")
  .option("-S, --start-at <startAt>", "start at")
  .option("-f, --fields <fields>", "Fields", "summary")
  .option("--ignore-defaults", "ignore default value")
  .description("Get issue(s)")
  .action((issueId, options) => {
    lib.utils.checkCredentials();
    lib.issues.mappings = options;
    if (issueId) {
      lib.issues.get(issueId, options);
    } else {
      lib.issues.fetch(options);
    }
  });

program
  .command("issues.create [source]")
  .description("Create issue")
  .option("--summary <summary>", "summary")
  .option("--assignee <assignee>","assignee name")
  .option("--project <project>","project key")
  .option("--parent-key <parent>","parent key")
  .option("--components <components>","components")
  .option("--duedate <duedate>","duedate")
  .option("--summary <summary>","summary")
  .option("--description <description>","description")
  .option("--issuetype <issuetype>","issuetype name")
  .option("--original-estimate <originalEstimate>","original estimate")
  .option("--remaining-estimate <remainingEstimate>", "remaining estimate")
  .action((source, options) => {
    lib.utils.checkCredentials();
    if (source) {
      lib.issues.createFromSource(source, options);
    } else {
      lib.issues.create(options);
    }
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}