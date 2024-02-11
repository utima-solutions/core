import fs from 'node:fs';
import path from 'node:path';

import { Command } from 'commander';
import { $ } from 'execa';
import { CleanOptions, simpleGit } from 'simple-git';

const git = simpleGit();
const $$ = $({ stdio: 'inherit' });

/**
 * Removes all files from current git repository (including ignored files)
 * and runs npm install. The `install` or `ci` command is used based
 * on the existence of package-lock.json file.
 */
export function cleanInstallCreator(program: Command) {
  program
    .command('ci')
    .description(
      'Cleans git repository (including ignored files) and installs dependencies',
    )
    .action(async () => {
      // Clean repository
      await git.clean(
        CleanOptions.FORCE + CleanOptions.IGNORED_ONLY + CleanOptions.RECURSIVE,
      );

      const installCommand = fs.existsSync(
        path.join(process.cwd(), 'package-lock.json'),
      )
        ? 'ci'
        : 'i';

      // Install dependencies
      await $$`npm ${installCommand}`;
    });
}
