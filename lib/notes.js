var debug = require("debug");
var lodash = require("lodash");
var path = require("path");
var fs = require("fs");
var log = console.log;
var mime = require("mime");
var shortid = require("shortid");
var homedir = require("os").homedir();

module.exports = function (issues) {
  this.get = function (issueKey, options) {
    if (issueKey) {
      try {
        var issueNotes;
        var filePath = path.resolve(homedir, ".jlient/notes", issueKey + ".json");
        issueNotes = require(filePath);

        debug("jcli:notes")("issueNotes ", issueNotes);
        if (options.notesKey) {
          var notes = issueNotes.notes.find(note => note.key == options.notesKey);
          log(notes);
          return notes;
        } else {
          log(issueNotes);
          return issueNotes;
        }
      } catch (error) {
        log("Notes not found.");
        return null;
      }
    }
    return fs.readdirSync(path.resolve(homedir, ".jlient/notes")).reduce(function (list, file) {
      if (mime.getType(file) === "application/json") {
        var issue = require(path.resolve(homedir, ".jlient/notes", file));
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
        var filePath = path.resolve(homedir, ".jlient/notes", issueKey + ".json");
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
          key: shortid.generate()
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
        var filePath = path.resolve(homedir, ".jlient/notes", issueKey + ".json");
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