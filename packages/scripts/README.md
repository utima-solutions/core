# @utima/scripts

A comprehensive collection of scripts for Utima projects, providing a powerful CLI tool (utima) for running and managing various tasks.

## Install

```bash
npm i -D @utima/scripts
```

## Usage

```bash
npx utima --help
```


## Commands

Following commands are available:




### `ci`

Removes all files from current git repository (including ignored files) and runs npm install. The `install` or `ci` command is used based on the existence of package-lock.json file.

```bash
npx utima ci
```

### `release`

Synces working branches and runs release process using changesets.

```bash
npx utima release -m main -d dev

# With publishing
npx utima release -p -m main -d dev
```

### `sync-branches`

Pulls changes and synces source branch into all target branches.

```bash
npx utima release -s main -t dev hotfix rc
```
