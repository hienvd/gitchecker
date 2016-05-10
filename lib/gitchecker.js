var https = require( 'https' );
var helper = require( './helper' );
var config = require( '../config' );
var RSVP = require( 'rsvp' );
var _ = require( 'underscore' );

var SlackGitChecker = function Constructor(settings) {
  this.settings = settings;
  this.settings.url = settings.url;

  if(settings.branchA === undefined) settings.branchA = 'develop';
  if(settings.branchB === undefined) settings.branchB = helper.getLastestReleaseBranch();

  this.settings.branchA = settings.branchA;
  this.settings.branchB = settings.branchB;
};

SlackGitChecker.prototype.checkMissingCommit = function(branchA, branchB) {
  var self = this;
  var dirPath = config.dirPath;
  var ok = false;
  var diffCommits = [];

  var promise = new RSVP.Promise(function(fullfill, reject) {
    helper.changeDir(dirPath, fullfill);
  });

  promise
    .then(function() {
      existFolder = helper.checkExistCodeFolder();
      return existFolder;
    },
    function() {
    })
    .then(function(existFolder) {
      if(existFolder){
        ok = helper.checkGitExist();

        if(ok === 'true'){
          helper.pullRepo();
        }
      }
      else{
        self.initRepo();
      }
    },
    function() {
      console.log('Error when change dir');
    })
    .then(function() {
      diffCommits = self.processCommits();
      return diffCommits;
    },
    function(){
      console.log('Error when pull..');
    })
    .then(function(diffCommits) {
      if(diffCommits.length === 0){
        self.notify(diffCommits, 'hura');
      }else{
        self.notify(diffCommits.length, 'number');
        setTimeout(function() {
          self.notify(helper.parseCommit(diffCommits), 'detail');
        }, 2000);
      }
    },
    function() {
      console.log('reject from second then');
    });

};

SlackGitChecker.prototype.initRepo = function () {
  helper.cloneGitDir();
};


// Post notification message to Slack
// * info : message wanna be sent
// * branchA, branchB: 2 branches to check missing commits
// * type: type of notification, currently 2 types:
//         "number" for send number of commits
//         "detail" for the detail of each commit
SlackGitChecker.prototype.notify = function(info, type) {
  var self = this;
  var url = this.settings.url;

  var options = {
    hostname : 'hooks.slack.com',
    path: '/services/' + url,
    method   : 'POST'
  };

  var payload = helper.getPayload(info, this.settings.branchA, this.settings.branchB, "@hienvd", type);

  var req = https.request( options , function (res , b , c) {
    res.setEncoding( 'utf8' );
    res.on( 'data' , function (chunk) {
      console.log(chunk);
    });
  } );

  req.on( 'error' , function (e) {
    console.log( 'problem with request: ' + e.message );
  } );

  req.write( JSON.stringify( payload ) );
  req.end();
};

SlackGitChecker.prototype.getCommit = function (branch, since) {
  cmd = 'git log origin/' + branch + ' --no-merges --first-parent --format="%an <= %s @*@" --since=' + since + '.weeks.ago' ;

  return exec(cmd).output;
};

SlackGitChecker.prototype.processCommits = function () {
  var self = this;
  var developCommits = self.getCommit(self.settings.branchA, 12);
  var releaseCommits = self.getCommit(self.settings.branchB, 8);

  developCommits = developCommits.replace(/(?:\r\n|\r|\n)/g, '');
  releaseCommits = releaseCommits.replace(/(?:\r\n|\r|\n)/g, '');

  var devCommitArray = developCommits.split('@*@');
  var relCommitArray = releaseCommits.split('@*@');

  var diffCommits = _.difference(relCommitArray, devCommitArray);

  return diffCommits;
};

module.exports = SlackGitChecker;

