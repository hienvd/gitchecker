var SlackGitChecker = require('../lib/gitchecker');

var url = process.env.URL;
var a = process.env.A;
var b = process.env.B;

var bot = new SlackGitChecker({
  url: url,
  branchA: a,
  branchB: b
});

bot.checkMissingCommit();
