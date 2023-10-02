# @utima/core

Collection of core packages for Utima development.

## Workspace structure

* components - linked [Ant.Design](https://github.com/ant-design/ant-design), create or update components only if it will be very necessary and accepted by a senior technical team; this package also includes theme provider that will override base styles of exact project.
* react-hooks - includes reusable custom react hooks developed by 3rd party or by Utima
* utils - custom functions such as formatters,  data structures, factory functions, and other reusable generic stuff
* services - backend reusable logic with open API

## Contribution guide

Every PR implementing a new feature should include [changeset](https://github.com/changesets/changesets). Use `npm run changeset` from the root of the repository to generate a new changeset and include it with your PR.

### Release

Make sure all new features are merged to `main` and you are on the `main` branch including their changesets. and run:

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
