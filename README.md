# @utima/core

Collection of core packages for Utima development.

## Contribution guide

Every PR implementing new feature should include [changeset](https://github.com/changesets/changesets). Use `npm run changeset` from the root of the repository to generate new changeset and include it with your PR.

### Release

Make sure all new features are merged to `main` and you are on `main` branch including their changesets. and run:

```bash
npm run release
```

#### RC Versions

To enter RC mode, run:

```bash
npm run release:rc:exit
```

when in RC mode, all version releases will have `-rc` suffix. To exit RC mode, run:

```bash
npm run release:rc:exit
```
