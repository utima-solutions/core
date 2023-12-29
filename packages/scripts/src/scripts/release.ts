import fs from 'node:fs';
import path from 'node:path';

import chalk from 'chalk';
import { Command } from 'commander';
import { execa } from 'execa';
import { simpleGit } from 'simple-git';

import { syncBranches } from './syncBranches.js';
import { logger } from '../lib/logger.js';
import { parsePkgJson } from '../lib/utils.js';

const git = simpleGit();

/**
 * Extracts versions from package.json files.
 */
async function extractVersions() {
  const paths = (await git.status()).files
    .filter(file => file.path.endsWith('package.json'))
    .map(file => path.join(process.cwd(), file.path));

  return Promise.all(
    paths.map(async path => {
      const { version, name } = await parsePkgJson(path);

      return `${name}@${version}`;
    }),
  ).then(versions => versions.join(', '));
}

/**
 * Synces working branches and runs release process using changesets.
 */
async function release(
  source: string,
  targets: string[] = [],
  skipPublishing = false,
) {
  const changesetsPath = path.resolve(process.cwd(), '.changeset');

  // Check if changesets are initialized in the repository
  if (!fs.existsSync(changesetsPath)) {
    return logger.error(
      `Unable to detect changesets presence at '${changesetsPath}', exiting release process...`,
    );
  }

  // Check if the repository is clean
  if (!(await git.status()).isClean()) {
    return logger.error(
      `Unable to run release process on ${chalk.bold(
        'dirty repository',
      )}, commit all ` +
        'your changes before running the script again. Exiting release process...',
    );
  }

  // Sync branches
  await syncBranches(source, targets);

  // Checkout source (main)
  await git.checkout(source);

  // Create versions using changesets & update package-lock
  await execa('npx', ['changeset', 'version'], { stdio: 'inherit' });
  await execa('npm', ['install', '--package-lock-only', '--ignore-scripts'], {
    stdio: 'inherit',
  });

  // Extract change package versions
  const versions = await extractVersions();

  // Commit and push changes
  await git.add('.');
  await git.commit(`🚀 Publish - ${versions}`);
  await execa('npx', ['changeset', 'tag'], { stdio: 'inherit' });
  await git.push('origin', source, { '--follow-tags': null });

  // Publish using changesets
  if (!skipPublishing) {
    await execa('npx', ['changeset', 'publish', '--no-git-tag'], {
      stdio: 'inherit',
    });
  }
}

/**
 * Provides a release script with branch syncing based on changesets.
 */
export function releaseCreator(program: Command) {
  program
    .command('release')
    .description(
      'Runs process of syncing git branches and releasing new version changesets',
    )
    .option('-s, --source <source>', 'source branch')
    .option('-t, --targets [targets...]', 'target branches', [])
    .option('-n, --skip-publish', 'skip publishing')
    .action(async options => {
      const { targets, skipPublish, source } = options as {
        targets: string[];
        source: string;
        skipPublish: boolean;
      };

      await release(source, targets, skipPublish);
    });
}
