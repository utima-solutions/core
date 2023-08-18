// Link: https://docs.strapi.io/dev-docs/deployment/digitalocean#set-up-a-webhook-on-digitaloceangithub

const secret = 'ghp_utima_push'; // created in GitHub earlier
const repo = '/home/[USER]/[PROJECT_NAME]';

const crypto = require('crypto');
const http = require('http');
const childProcess = require('child_process');

// const PM2_PATH =
//   'sudo env PATH=$PATH:/home/admin/.nvm/versions/node/v16.14.0/bin /home/admin/.npm-global/lib/node_modules/pm2/';
// const PM2_CMD = `cd ~ && pm2 save && pm2 restart strapi-app`;

function shell(cmd) {
  console.log('Running:', cmd);
  childProcess.execSync(cmd, { stdio: 'inherit', cwd: repo });
}

async function runPipeline() {
  new Promise(resolve => {
    try {
      shell(`cd ${repo}`);
      shell('git stash');
      shell('git fetch');
      shell('git pull');
      shell('npm ci');
      shell('NODE_ENV=production npm run build');
      shell('pm2 restart strapi-app');
      resolve();
    } catch (error) {
      console.error(error);
    }
  });
}

let pipeline = null;

http
  .createServer((req, res) => {
    req.on('data', (chunk) => {
      let sig =
        'sha1=' +
        crypto
          .createHmac('sha1', secret)
          .update(chunk.toString())
          .digest('hex');

      if (req.headers['x-hub-signature'] != sig) {
        res.statusCode = 401;

        return;
      }

      if (pipeline !== null) {
        res.statusCode = 202;

        return;
      }

      res.statusCode = 200;
      pipeline = runPipeline().then(() => {
        pipeline = null;
      });
    });

    req.on('end', () => {
      res.end();
    });

  })
  .listen(8080);
