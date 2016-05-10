var fs = require( 'fs' );
require( 'shelljs/global');
var config = require( '../config' );

// Get payload for the http request
exports.getPayload = function(info, branchA, branchB, channel, type) {
  var message = classifyMessage(type, info, branchA, branchB);
  channel = channel || "@hienvd";
  var botName = "gitchecker";
  var emoji = ":bomb:";

  return {
    "channel"    : channel,
    "username"   : botName,
    "text"       : message,
    "icon_emoji" : emoji
  };
};

// Check has existed the Git directory
exports.changeDir = function(dirPath, callback) {
  fs.stat(dirPath, function(err, stats) {
    if(err){
      console.log('Code folder has not existed...');
      fs.mkdir(dirPath);
    }else{
      console.log('Code folder existed');
    }
  });

  process.chdir(dirPath);
  callback();
};

exports.checkGitExist = function() {
  console.log('Current Directory: ', pwd());
  process.chdir(config.dirPath + "msss");

  var ok = exec('git rev-parse --is-inside-work-tree').output;
  ok = ok.replace(/(?:\r\n|\r|\n)/g, '');

  return ok;
};

exports.checkExistCodeFolder = function () {
  return test('-d', 'msss');
};

exports.cloneGitDir = function() {
  var cmd = 'git clone https://' + config.gitToken + '@github.com/' + config.gitUser + '/' + config.repo + '.git';
  exec(cmd);
  process.chdir(config.dirPath + "msss");
  return true;
};

exports.pullRepo = function() {
  var cmd = 'git pull';
  exec(cmd);
};

exports.parseCommit = function (commits) {
  return commits.join('\n');
};

//Get the lastest release branch
exports.getLastestReleaseBranch = function () {
  //only ONE release branch at a specific time
  process.chdir(config.dirPath + "msss");
  var cmd = 'git branch -r | grep "release"';
  var output = exec(cmd).output;
  output = output.replace(/(?:\r\n|\r|\n)/g, '');
  output = output.substr(output.indexOf("release"));
  return output;
};

reFormat = function (text) {
  arr = text.split('\n');
  for(var i = 0; i < arr.length; i++){
    arr[i] = arr[i].replace(" <=", "> :");
    arr[i] = "<@" + arr[i];
  }
  return arr.join('\n');
};

classifyMessage = function (type, info, branchA, branchB) {
  var msg = "";
  switch (type){
    case "hura":
      msg = "Hurray!! No missing commit of *" + branchB + "* on *" + branchA + "* today!!!";
      break;
    case "number":
      msg =  "There are " + info + " commits that exists in *" + branchB + "* but not in *" + branchA + "*";
      break;
    default:
      info = reFormat(info);
      msg =  "They are: \n" + info;
      msg += "\n Please check it out!";
      break;
  };
  return msg;
};

