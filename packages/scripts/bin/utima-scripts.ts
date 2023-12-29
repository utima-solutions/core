#!/usr/bin/env node

import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import { Command } from 'commander';

import { scriptCreators } from '../src/index.js';
import { parsePkgJson } from '../src/lib/utils.js';

const program = new Command();
const __dirname = dirname(fileURLToPath(import.meta.url));
const { version, description } = await parsePkgJson(
  resolve(__dirname + '../../../package.json'),
);

program.name('utima').version(version!).description(description!);

// Init scripts
scriptCreators.forEach(creator => creator(program));

program.parseAsync(process.argv);
