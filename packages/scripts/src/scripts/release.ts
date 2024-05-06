import fs from 'node:fs';
import path from 'node:path';

import chalk from 'chalk';
import { Command } from 'commander';
import { $ } from 'execa';
import { simpleGit } from 'simple-git';

import { syncBranches } from './syncBranches.js';
import { logger } from '../lib/logger.js';
import { parsePkgJson } from '../lib/utils.js';

const git = simpleGit();
const $$ = $({ stdio: 'inherit' });

export type ReleaseScriptParams = {
  main: string;
  dev: string;
  publish: boolean;
  pnpm: boolean;
};

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
 * Runs process of syncing versions and doing release.
 */
async function release({ dev, main, pnpm, publish }: ReleaseScriptParams) {
  const exec = pnpm ? 'pnpm exec' : 'npx';
  const pkgExecutable = pnpm ? 'pnpm' : 'npm';
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

  if (dev) {
    // Pull latest and merge dev to main
    await syncBranches(dev, [main]);
  } else {
    // Pull latest changes from origin
    await syncBranches(main, []);
  }

  // Checkout main
  await git.checkout(main);

  // Create versions using changesets
  await $$`${exec} changeset version`;

  // Update package-lock.json (pnpm doesn't need this)
  if (!pnpm) {
    await $$`npm install --package-lock-only --ignore-scripts`;
  }

  // Extract change package versions
  const versions = await extractVersions();

  // Commit and push changes
  await git.add('.');
  await git.commit(`🚀 Publish - ${versions}`);
  await $$`${exec} changeset tag`;
  await git.push({ '--follow-tags': null });

  // Publish using changesets
  if (publish) {
    await $$`${exec} changeset publish --no-git-tag`;
  }

  // Sync main to dev
  if (dev) {
    await syncBranches(main, [dev]);
  }
}

/**
 * Provides a release script with branch syncing based on changesets.
 */
export function releaseCreator(program: Command) {
  program
    .command('release')
    .description(
      'Runs process of syncing git branches and releasing new version using changesets',
    )
    .option('-m, --main <main>', 'main branch', 'main')
    .option('-d, --dev <dev>', 'dev branch', 'dev')
    .option('-p, --publish', 'publish using changesets', false)
    .option('-n, --pnpm', 'use pnpm instead of npm', false)
    .action(async options => {
      await release(options);
    });
}
