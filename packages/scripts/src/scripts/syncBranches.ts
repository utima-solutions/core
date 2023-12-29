import chalk from 'chalk';
import { Command } from 'commander';
import { simpleGit } from 'simple-git';

import { logger } from '../lib/logger.js';

const git = simpleGit();

/**
 * Pulls changes and synces source branch into all target branches.
 */
export async function syncBranches(target: string[], source: string) {
  // Check if the repository is clean
  if (!(await git.status()).isClean()) {
    return logger.error(
      `Unable to sync branches on ${chalk.bold(
        'dirty repository',
      )}, commit all your changes before running the script again`,
    );
  }

  // Fetch all changes
  logger.cmd('git fetch --all');
  await git.fetch({ '--all': null });

  logger.info('Pull latest changes from origin');

  for (const branch of [source, ...target]) {
    // Checkout source branch
    logger.cmd(`git checkout ${branch}`);
    await git.checkout(branch);

    // Pull latest changes
    logger.cmd(`git pull origin ${branch} --rebase`);
    await git.pull('origin', branch, { '--rebase': null });
  }

  if (target.length === 0) {
    return logger.info('No target branches specified, exiting sync...');
  }

  logger.info(
    `Distribute '${source}' -> ${target.map(v => `'${v}'`).join(',')}`,
  );

  for (const branch of target) {
    logger.cmd(`git checkout ${target}`);
    await git.checkout(target);

    // Pull latest changes
    logger.cmd(`git merge origin/${source} '${branch}`);
    await git.mergeFromTo(`origin/${source}`, branch);

    // Push to origin
    logger.cmd(`git push origin/${branch}`);
    await git.push('origin', branch);
  }

  // Checkout to source
  await git.checkout(`${source}`);
}

/**
 * This script provides a way to sync multiple target branch into multiple
 * branches inside git repository.
 */
export function syncBranchesCreator(program: Command) {
  program
    .command('sync-branches')
    .description('Distribute branch state to multiple branches')
    .option('-s, --source <source>', 'source branch')
    .option('-t, --target [targets...]', 'target branches')
    .action(async options => {
      const { target = [], source } = options as {
        target: string[];
        source: string;
      };

      if (!source) {
        return logger.error(
          'Source branch is required, but it was not provided',
        );
      }

      await syncBranches(target, source);
    });
}
