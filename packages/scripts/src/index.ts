import { cleanInstallCreator } from './scripts/cleanInstall.js';
import { releaseCreator } from './scripts/release.js';
import { syncBranchesCreator } from './scripts/syncBranches.js';

export const scriptCreators = [
  syncBranchesCreator,
  releaseCreator,
  cleanInstallCreator,
];
