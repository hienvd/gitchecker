# SLACK GIT CHECKER

A tool for checking Git repo status and notify to slack

### Usage

1. Change `config.js` to use your Git repo information, such as

```
config.gitToken = '1234abcdxxxxxxxxxxxxxxxxxxxx';
config.gitUser = 'username';
config.repo = 'reponame';
```

2. Specify the directory path to store your clone repo in `config.js` 
example:

```
config.dirPath = 'gitcheckerrepo/';
```

default is `gitcheckerrepo`

4. Use the following command to check and send notify message to your Slack

`URL='your_slack_webhook_url' A='branchA' B='branchB' node bin/bot.js`
