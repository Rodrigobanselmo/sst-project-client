/**
 * Runnable with:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/documentModel/section-propagation/section-propagation-gate.spec.ts
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';

import { PermissionEnum } from 'project/enum/permission.enum';

import {
  canOpenSectionPropagation,
  DOCUMENT_MODEL_SECTION_PROPAGATION_DIRTY_MESSAGE,
  DOCUMENT_MODEL_SECTION_PROPAGATION_PERMISSION_MESSAGE,
  isDocumentHeadingType,
} from './section-propagation-gate';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

const actionSource = fs.readFileSync(
  path.join(__dirname, 'DocumentModelSectionPropagationAction.tsx'),
  'utf8',
);
const dialogSource = fs.readFileSync(
  path.join(__dirname, 'DocumentModelSectionPropagationDialog.tsx'),
  'utf8',
);
const searchIndexSource = fs.readFileSync(
  path.join(
    __dirname,
    '../../modals/ModalEditDocumentModel/components/2-viewDocumentModelStep/components/SearchIndex/SearchIndex.tsx',
  ),
  'utf8',
);
const topButtonsSource = fs.readFileSync(
  path.join(
    __dirname,
    '../../modals/ModalEditDocumentModel/components/2-viewDocumentModelStep/components/TopButtons/TopButtons.tsx',
  ),
  'utf8',
);
const applyHookSource = fs.readFileSync(
  path.join(
    __dirname,
    '../../../../core/services/hooks/mutations/manager/document-model/useMutApplySectionPropagation/useMutApplySectionPropagation.ts',
  ),
  'utf8',
);

run('22. origin dirty blocks the action without auto-save', () => {
  const blocked = canOpenSectionPropagation({
    hasModelId: true,
    isHeadingSelected: true,
    canEdit: true,
    isDirty: true,
    v2LocalDirty: false,
    saveBusy: false,
    contentSavePending: false,
  });
  assert.equal(blocked.ok, false);
  assert.equal(blocked.reason, DOCUMENT_MODEL_SECTION_PROPAGATION_DIRTY_MESSAGE);
  assert.equal(actionSource.includes('saveDocumentModel('), false);
  assert.equal(actionSource.includes('autosave'), false);
});

run('Gate 11: dirty click cannot open the dialog, so analyze/apply stay at zero', () => {
  const gateIdx = actionSource.indexOf('if (!gate.ok)');
  const openIdx = actionSource.indexOf('setOpen(true)');
  assert.ok(gateIdx >= 0 && openIdx > gateIdx);
  const effectStart = dialogSource.indexOf('useEffect(() => {');
  const effectEnd = dialogSource.indexOf('}, [open, modelId, headingId, companyId]);');
  assert.ok(effectStart >= 0 && effectEnd > effectStart);
  const effect = dialogSource.slice(effectStart, effectEnd);
  const guardIdx = effect.indexOf('if (!open || !modelId || !headingId) return');
  const analyzeIdx = effect.indexOf('mutateAsync');
  assert.ok(guardIdx >= 0 && analyzeIdx > guardIdx);
  assert.ok(dialogSource.includes('applyMutation.mutateAsync'));
  const afterSave = canOpenSectionPropagation({
    hasModelId: true,
    isHeadingSelected: true,
    canEdit: true,
    isDirty: false,
    v2LocalDirty: false,
    saveBusy: false,
    contentSavePending: false,
  });
  assert.equal(afterSave.ok, true);
});

run('22b. v2 dirty blocks without save', () => {
  const blocked = canOpenSectionPropagation({
    hasModelId: true,
    isHeadingSelected: true,
    canEdit: true,
    isDirty: false,
    v2LocalDirty: true,
    saveBusy: false,
    contentSavePending: false,
  });
  assert.equal(blocked.ok, false);
});

run('29. insufficient permission blocks client action', () => {
  const blocked = canOpenSectionPropagation({
    hasModelId: true,
    isHeadingSelected: true,
    canEdit: false,
    isDirty: false,
    v2LocalDirty: false,
    saveBusy: false,
    contentSavePending: false,
  });
  assert.equal(blocked.ok, false);
  assert.equal(
    blocked.reason,
    DOCUMENT_MODEL_SECTION_PROPAGATION_PERMISSION_MESSAGE,
  );
  assert.equal(actionSource.includes('PermissionEnum.DOCUMENT_MODEL'), true);
  assert.equal(PermissionEnum.DOCUMENT_MODEL, '20');
});

run('9. current model is the analyze source, not a selectable target in the client payload', () => {
  assert.equal(dialogSource.includes('targets: data.targets'), false);
  assert.equal(dialogSource.includes('expectedUpdatedAt: row.updated_at'), true);
  assert.equal(dialogSource.includes('row.selectable'), true);
  assert.equal(dialogSource.includes('expectedSourceUpdatedAt: analysis.source.updated_at'), true);
  assert.equal(dialogSource.includes('expectedSourceHash: analysis.source.dataHash'), true);
});

run('Gate 12: preview cannot mark B/C/D/E/F as selectable', () => {
  assert.equal(dialogSource.includes('if (!candidate.selectable || applyResult) return'), true);
  assert.equal(dialogSource.includes('disabled={disabled}'), true);
  assert.equal(dialogSource.includes('const disabled = !candidate.selectable'), true);
  assert.equal(dialogSource.includes('selectable: true'), false);
  assert.equal(dialogSource.includes('matchClass:'), false);
  assert.equal(applyHookSource.includes('expectedSourceUpdatedAt: data.expectedSourceUpdatedAt'), true);
  assert.equal(applyHookSource.includes('expectedSourceHash: data.expectedSourceHash'), true);
  assert.equal(applyHookSource.includes('sourceWindow'), false);
  assert.equal(applyHookSource.includes('window:'), false);
});

run('28. inactive models are not requested by the V1 client', () => {
  assert.equal(dialogSource.includes('showInactive'), false);
  assert.equal(applyHookSource.includes('showInactive'), false);
});

run('action lives on the tree column, not the main toolbar', () => {
  assert.equal(
    searchIndexSource.includes('DocumentModelSectionPropagationAction'),
    true,
  );
  assert.equal(
    topButtonsSource.includes('DocumentModelSectionPropagationAction'),
    false,
  );
  assert.equal(actionSource.includes('Aplicar em outros modelos'), true);
});

run('only headings open the flow', () => {
  assert.equal(isDocumentHeadingType('H3'), true);
  assert.equal(isDocumentHeadingType('PARAGRAPH'), false);
  assert.equal(isDocumentHeadingType('SECTION'), false);
});

run('apply does not invalidate the current editor document data query', () => {
  assert.equal(applyHookSource.includes('DOCUMENT_MODEL_DATA'), false);
  assert.equal(applyHookSource.includes('QueryEnum.DOCUMENT_MODEL'), true);
});

console.log('section-propagation-gate ok');
