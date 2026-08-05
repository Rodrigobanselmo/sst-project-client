/**
 * npx tsx src/components/organisms/main/Header/HeaderWorkspaceSelect/header-workspace-select-visibility.spec.ts
 *
 * Guards the Caracterização SST header workspace selector visibility rules.
 */
import assert from 'node:assert/strict';

import { CharacterizationSubTabEnum } from 'core/constants/characterization-navigation.constants';

/** Mirrors HeaderWorkspaceSelect.showSstWorkspaceSelector tab gating. */
function showSstWorkspaceSelectorForTab(
  sstActiveTab: CharacterizationSubTabEnum | null,
): boolean {
  if (sstActiveTab == null) return false;
  return sstActiveTab !== CharacterizationSubTabEnum.PROTOCOLS;
}

assert.equal(
  showSstWorkspaceSelectorForTab(CharacterizationSubTabEnum.RISKS),
  true,
);
assert.equal(
  showSstWorkspaceSelectorForTab(CharacterizationSubTabEnum.GSE),
  true,
);
assert.equal(
  showSstWorkspaceSelectorForTab(CharacterizationSubTabEnum.ENVIRONMENTS),
  true,
);
assert.equal(
  showSstWorkspaceSelectorForTab(CharacterizationSubTabEnum.EXAMS),
  true,
  'Exams must show the canonical header workspace selector',
);
assert.equal(
  showSstWorkspaceSelectorForTab(CharacterizationSubTabEnum.ENTITY_RISKS),
  true,
);
assert.equal(
  showSstWorkspaceSelectorForTab(CharacterizationSubTabEnum.PROTOCOLS),
  false,
);

console.log('header-workspace-select-visibility.spec.ts OK');
