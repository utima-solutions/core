import fs from 'node:fs/promises';

import { PackageJson } from 'type-fest';

/**
 * Parse package.json file for given path.
 */
export async function parsePkgJson(path: string): Promise<PackageJson> {
  const pkgJson = JSON.parse(await fs.readFile(path, 'utf-8')) as PackageJson;

  return pkgJson;
}
