var debug = require("debug");
var lodash = require("lodash");
var path = require("path");
var fs = require("fs");
var log = console.log;
var mime = require("mime");

module.exports = function (issues) {
  this.get = function (issueKey) {
    if (issueKey) {
      try {
        var issueNotes;
        var filePath = path.resolve(__dirname, "../.jira/notes", issueKey + ".json");
        issueNotes = require(filePath);

        debug("jcli:notes")("issueNotes ", issueNotes);
        log("issueNotes ", issueNotes);
        return issueNotes;
      } catch (error) {
        log("Notes not found.");
        return null;
      }
    }
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

  this.add = function (issueKey, message) {
    return issues.get(issueKey, {
      fields: "summary,assignee,components",
      jcli_not_show: true
    }).then(issue => {
      if (issue) {
        var issueNotes;
        var filePath = path.resolve(__dirname, "../.jira/notes", issueKey + ".json");
        try {
          issueNotes = require(filePath);
        } catch (error) {
          issueNotes = {
            "notes": []
          };
        }

        lodash.extend(issueNotes, {
          "assignee": issue.fields.assignee.name,
          "summary": issue.fields.summary,
          "components": lodash.map(issue.fields.components, "name"),
        });
        issueNotes.notes.push({
          message,
          key: issueNotes.notes.length
        });

        debug("jcli:notes")("issueNotes ", issueNotes);
        fs.writeFileSync(filePath, JSON.stringify(issueNotes));
        log(issueNotes);
      }
    }).catch(log);
  };

  this.remove = function (issueKey, messageKey) {
    return issues.get(issueKey, {
      fields: "summary,assignee,components",
      jcli_not_show: true
    }).then(issue => {
      if (issue) {
        var filePath = path.resolve(__dirname, "../.jira/notes", issueKey + ".json");
        try {
          var issueNotes;
          issueNotes = require(filePath);
          if (messageKey) {
            var index = issueNotes.notes.findIndex(note => note.key == (parseInt(messageKey)));
            if (index > -1) {
              var message = issueNotes.notes.splice(index, 1);
              log(`Notes ${messageKey} has been removed from issue ${issueKey}:`);
              log(`"${message[0].message}"`);
            } else {
              log("Notes not found.");
            }
          } else {
            issueNotes.notes.length = 0;
            log(`All notes has been removed from issue ${issueKey}.`);
          }

          debug("jcli:notes")("issueNotes ", issueNotes);
          fs.writeFileSync(filePath, JSON.stringify(issueNotes));
        } catch (error) {
          log("Notes not found.");
        }
      }
    }).catch(log);
  };
};