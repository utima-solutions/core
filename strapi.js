// Link: https://docs.strapi.io/dev-docs/deployment/digitalocean#set-up-a-webhook-on-digitaloceangithub

var secret = 'ghp_utima_push'; // created in GitHub earlier
var repo = '/home/[USER]/[PROJECT_NAME]';

const http = require('http');
const crypto = require('crypto');
const exec = require('child_process').exec;

const GIT_CMD = `git stash && git pull`;
const BUILD_CMD = `npm ci && NODE_ENV=production npm run build`;
const PM2_CMD = `cd ~ && pm2 save`;

http
  .createServer(function(req, res) {
    req.on('data', function(chunk) {
      let sig =
        'sha1=' +
        crypto
          .createHmac('sha1', secret)
          .update(chunk.toString())
          .digest('hex');

      if (req.headers['x-hub-signature'] == sig) {
        exec(`cd ${repo} && ${GIT_CMD} && ${BUILD_CMD} && ${PM2_CMD}`);
      }
    });

    res.end();
  })
  .listen(8080);
