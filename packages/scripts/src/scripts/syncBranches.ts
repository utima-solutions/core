import chalk from 'chalk';
import { Command } from 'commander';
import { simpleGit } from 'simple-git';

import { logger } from '../lib/logger.js';

const git = simpleGit();

/**
 * Pulls changes and synces source branch into all target branches.
 */
export async function syncBranches(source: string, targets: string[] = []) {
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

  for (const branch of [source, ...targets]) {
    // Checkout source branch
    logger.cmd(`git checkout ${branch}`);
    await git.checkout(branch);

    // Pull latest changes
    logger.cmd(`git pull origin ${branch} --ff-only`);
    await git.pull('origin', branch, { '--ff-only': null });
  }

  if (targets.length === 0) {
    return logger.info('No target branches specified, exiting sync...');
  }

  logger.info(
    `Distribute '${source}' -> ${targets.map(v => `'${v}'`).join(',')}`,
  );

  for (const branch of targets) {
    logger.cmd(`git checkout ${targets}`);
    await git.checkout(targets);

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
    .option('-t, --targets [targets...]', 'target branches', [])
    .action(async options => {
      const { targets, source } = options as {
        targets: string[];
        source: string;
      };

      if (!source) {
        return logger.error(
          'Source branch is required, but it was not provided',
        );
      }

      await syncBranches(source, targets);
    });
}
