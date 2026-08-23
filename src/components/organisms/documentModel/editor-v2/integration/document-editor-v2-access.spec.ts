/**
 * Acesso MASTER + flags do Editor V2.
 *
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/documentModel/editor-v2/integration/document-editor-v2-access.spec.ts
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';

import { featureFlags } from '@v2/constants/feature-flags';
import { isMaster } from 'core/utils/auth/validateUserPermissions';
import { RoleEnum } from 'project/enum/roles.enums';

import { resolveDocumentEditorV2Access } from './document-editor-v2-access';
import {
  createV2SaveGuardSession,
  resolveOfficialSaveAttempt,
} from './document-editor-v2-save-guard';
import {
  isEditorSwitchVisible,
  resolveOfficialSaveButtonsDisabled,
  resolveVisibleSurface,
  shouldBlockOfficialSave,
} from './document-editor-v2-session';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

function readRel(rel: string) {
  return fs.readFileSync(path.join(__dirname, rel), 'utf8');
}

function accessOf(input: {
  surfaceFlag?: boolean;
  saveFlag?: boolean;
  isMaster?: boolean;
}) {
  return resolveDocumentEditorV2Access({
    surfaceFlag: input.surfaceFlag ?? false,
    saveFlag: input.saveFlag ?? false,
    isMaster: input.isMaster ?? false,
  });
}

/** Espelha Session + TopButtons: flagEnabled/saveEnabled efetivos. */
function topButtonsAvailability(args: {
  surfaceFlag?: boolean;
  saveFlag?: boolean;
  isMaster?: boolean;
  requestedSurface?: 'v1' | 'v2';
  v2LocalDirty?: boolean;
  hasSelection?: boolean;
  saveBusy?: boolean;
}) {
  const access = accessOf(args);
  const flagEnabled = access.canUseV2;
  const saveEnabled = access.canPersistV2;
  const visibleSurface = resolveVisibleSurface({
    flagEnabled,
    surface: args.requestedSurface ?? 'v2',
  });
  const canPersistV2 =
    flagEnabled && visibleSurface === 'v2' && saveEnabled;
  return {
    access,
    flagEnabled,
    saveEnabled,
    visibleSurface,
    switchVisible: isEditorSwitchVisible(flagEnabled),
    chromeVisible: flagEnabled && visibleSurface === 'v2',
    canPersistV2,
    saveBlocked: shouldBlockOfficialSave({
      surface: visibleSurface,
      v2LocalDirty: args.v2LocalDirty ?? true,
      saveEnabled: canPersistV2,
    }),
    saveDisabled: resolveOfficialSaveButtonsDisabled({
      hasSelection: args.hasSelection ?? true,
      saveBusy: args.saveBusy ?? false,
      surface: visibleSurface,
      v2LocalDirty: args.v2LocalDirty ?? true,
      saveEnabled: canPersistV2,
    }),
  };
}

run('1. fonte canônica: isMaster é RoleEnum.MASTER nas roles', () => {
  assert.equal(
    isMaster({ roles: [RoleEnum.MASTER], permissions: [] }),
    true,
  );
  assert.equal(
    isMaster({ roles: ['master-crud'], permissions: [] }),
    true,
  );
  assert.equal(isMaster({ roles: [RoleEnum.ADMIN], permissions: [] }), false);
  assert.equal(isMaster({ roles: [RoleEnum.USER], permissions: [] }), false);
  assert.equal(isMaster({ roles: [RoleEnum.DOCUMENTS], permissions: [] }), false);
  assert.equal(isMaster({ roles: [], permissions: ['master'] }), false);
  assert.equal(isMaster({ roles: [], permissions: [] }), false);
});

run('2. A) não-MASTER + flags OFF → só Clássico', () => {
  const ui = topButtonsAvailability({
    surfaceFlag: false,
    saveFlag: false,
    isMaster: false,
  });
  assert.deepStrictEqual(ui.access, { canUseV2: false, canPersistV2: false });
  assert.equal(ui.switchVisible, false);
  assert.equal(ui.visibleSurface, 'v1');
  assert.equal(ui.chromeVisible, false);
  assert.equal(ui.canPersistV2, false);
  assert.equal(ui.saveBlocked, false);
});

run('3. B) MASTER + flags OFF → V2 + Save', () => {
  const ui = topButtonsAvailability({
    surfaceFlag: false,
    saveFlag: false,
    isMaster: true,
  });
  assert.deepStrictEqual(ui.access, { canUseV2: true, canPersistV2: true });
  assert.equal(ui.switchVisible, true);
  assert.equal(ui.visibleSurface, 'v2');
  assert.equal(ui.chromeVisible, true);
  assert.equal(ui.canPersistV2, true);
  assert.equal(ui.saveBlocked, false);
  assert.equal(ui.saveDisabled, false);
});

run('4. C) não-MASTER + surface ON + save OFF → V2 sem persist', () => {
  const ui = topButtonsAvailability({
    surfaceFlag: true,
    saveFlag: false,
    isMaster: false,
  });
  assert.deepStrictEqual(ui.access, { canUseV2: true, canPersistV2: false });
  assert.equal(ui.switchVisible, true);
  assert.equal(ui.chromeVisible, true);
  assert.equal(ui.canPersistV2, false);
  assert.equal(ui.saveBlocked, true);
  assert.equal(ui.saveDisabled, true);
});

run('5. D) não-MASTER + flags ON → V2 + Save', () => {
  const ui = topButtonsAvailability({
    surfaceFlag: true,
    saveFlag: true,
    isMaster: false,
  });
  assert.deepStrictEqual(ui.access, { canUseV2: true, canPersistV2: true });
  assert.equal(ui.switchVisible, true);
  assert.equal(ui.canPersistV2, true);
  assert.equal(ui.saveBlocked, false);
  assert.equal(ui.saveDisabled, false);
});

run('6. E) MASTER + qualquer combinação de flags → V2 + Save', () => {
  const combos = [
    { surfaceFlag: false, saveFlag: false },
    { surfaceFlag: true, saveFlag: false },
    { surfaceFlag: false, saveFlag: true },
    { surfaceFlag: true, saveFlag: true },
  ];
  for (const flags of combos) {
    const ui = topButtonsAvailability({ ...flags, isMaster: true });
    assert.deepStrictEqual(ui.access, { canUseV2: true, canPersistV2: true });
    assert.equal(ui.switchVisible, true);
    assert.equal(ui.canPersistV2, true);
    assert.equal(ui.saveBlocked, false);
  }
});

run('7. save guard 5B: MASTER dirty persiste; comum dirty com save OFF bloqueia', () => {
  const masterAccess = accessOf({ isMaster: true });
  const masterDirty = createV2SaveGuardSession({
    surface: 'v2',
    v2LocalDirty: true,
    saveEnabled: masterAccess.canPersistV2,
  });
  assert.equal(shouldBlockOfficialSave(masterDirty), false);
  assert.equal(resolveOfficialSaveAttempt(masterDirty, 'stay').persist, true);
  assert.equal(resolveOfficialSaveAttempt(masterDirty, 'exit').close, true);

  const commonDirty = createV2SaveGuardSession({
    surface: 'v2',
    v2LocalDirty: true,
    saveEnabled: accessOf({ surfaceFlag: true, isMaster: false }).canPersistV2,
  });
  assert.equal(shouldBlockOfficialSave(commonDirty), true);
  assert.equal(resolveOfficialSaveAttempt(commonDirty, 'stay').persist, false);
});

run('8. flags de env continuam default OFF', () => {
  assert.equal(featureFlags.documentEditorV2, false);
  assert.equal(featureFlags.documentEditorV2Save, false);
});

run('9. wiring: Session usa o resolver; flags permanecem estáticas', () => {
  const session = readRel('./DocumentEditorV2Session.tsx');
  assert.equal(session.includes('useDocumentEditorV2Access'), true);
  assert.equal(session.includes('canUseV2'), true);
  assert.equal(session.includes("from 'core/hooks/useAccess'"), false);

  const flags = fs.readFileSync(
    path.join(__dirname, '../../../../../@v2/constants/feature-flags.ts'),
    'utf8',
  );
  assert.equal(flags.includes('useAccess'), false);
  assert.equal(flags.includes('isMaster'), false);
  assert.equal(flags.includes("value === 'true'"), true);

  const accessSrc = readRel('./document-editor-v2-access.ts');
  assert.equal(accessSrc.includes('useAccess'), true);
  assert.equal(accessSrc.includes("from 'core/hooks/useAccess'"), true);
  assert.equal(accessSrc.includes('@gmail'), false);
  assert.equal(accessSrc.includes('cpf'), false);
  assert.equal(accessSrc.includes('email'), false);
});

run('10. boundary / TopButtons continuam no contrato da session', () => {
  const boundary = readRel('./DocumentModelEditorBoundary.tsx');
  assert.equal(boundary.includes('isEditorSwitchVisible(flagEnabled)'), true);
  assert.equal(boundary.includes('TypeSectionItem'), false);

  const topButtons = readRel(
    '../../../modals/ModalEditDocumentModel/components/2-viewDocumentModelStep/components/TopButtons/TopButtons.tsx',
  );
  assert.equal(topButtons.includes('DocumentEditorV2HeaderControls'), true);
  assert.equal(topButtons.includes('v2Session.flagEnabled'), true);
  assert.equal(topButtons.includes('v2Session.canPersistV2'), true);
  assert.equal(topButtons.includes('resolveOfficialSaveButtonsDisabled'), true);

  const content = readRel(
    '../../DocumentModelContent/DocumentModelContent.tsx',
  );
  assert.equal(content.includes('TypeSectionItem'), true);
  assert.equal(content.includes('v1='), true);
});
