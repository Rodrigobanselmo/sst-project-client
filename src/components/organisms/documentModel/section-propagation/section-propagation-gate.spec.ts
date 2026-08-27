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
  assert.equal(dialogSource.includes('if (applyResult) return'), true);
  assert.equal(
    dialogSource.includes('if (!candidate.selectable && !candidate.alreadyUpToDate) return'),
    true,
  );
  assert.equal(
    dialogSource.includes('const disabled = !candidate.selectable && !candidate.alreadyUpToDate'),
    true,
  );
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
  assert.equal(actionSource.includes('Aplicar seção em outros modelos'), true);
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

run('filters are client-side over analyze results and reuse classification pills', () => {
  assert.equal(dialogSource.includes('DocumentModelPgrClassificationFilters'), true);
  assert.equal(dialogSource.includes('filterSectionPropagationCandidates'), true);
  assert.equal(dialogSource.includes('Limpar filtros'), true);
  assert.equal(dialogSource.includes('setClassificationFilters([])'), true);
  const effectStart = dialogSource.indexOf('useEffect(() => {');
  const effectEnd = dialogSource.indexOf('}, [open, modelId, headingId, companyId]);');
  const effect = dialogSource.slice(effectStart, effectEnd);
  assert.equal(effect.includes('setClassificationFilters([])'), true);
  assert.equal(effect.includes('mutateAsync'), true);
});

run('list is grouped Vinculados → Compatíveis → Já atualizados → Revisão manual → Não encontrados', () => {
  assert.equal(dialogSource.includes('groupSectionPropagationCandidates'), true);
  assert.equal(dialogSource.includes('{group.title} ({group.count})'), true);
  const listSource = fs.readFileSync(
    path.join(__dirname, 'section-propagation-list.ts'),
    'utf8',
  );
  const linked = listSource.indexOf("id: 'linked'");
  const applicable = listSource.indexOf("id: 'applicable'");
  const updated = listSource.indexOf("id: 'already_up_to_date'");
  const review = listSource.indexOf("id: 'manual_review'");
  const missing = listSource.indexOf("id: 'not_found'");
  assert.ok(linked < applicable && applicable < updated && updated < review && review < missing);
});

run('not found status is red and checkbox stays disabled', () => {
  assert.equal(dialogSource.includes('sectionPropagationStatusColor'), true);
  assert.equal(dialogSource.includes('sectionPropagationNameColor'), true);
  assert.equal(
    dialogSource.includes('const disabled = !candidate.selectable && !candidate.alreadyUpToDate'),
    true,
  );
  const listSource = fs.readFileSync(
    path.join(__dirname, 'section-propagation-list.ts'),
    'utf8',
  );
  assert.equal(listSource.includes("if (uiStatus === 'not_found' || uiStatus === 'ambiguous' || uiStatus === 'broken') {"), true);
  assert.equal(listSource.includes("if (group === 'not_found') return 'grey.400'"), true);
});

run('old version preview names the structural update', () => {
  assert.equal(dialogSource.includes('Modelo atual'), true);
  assert.equal(dialogSource.includes('Nova versão da seção'), true);
  assert.equal(dialogSource.includes('Estrutura:'), true);
  assert.equal(dialogSource.includes('old_version_compatible'), true);
});

run('modal reuses published classification exclusive pairs and hides empty groups', () => {
  assert.equal(dialogSource.includes('DocumentModelPgrClassificationFilters'), true);
  assert.equal(dialogSource.includes('toggleDocumentModelClassificationFilter'), false);
  assert.equal(dialogSource.includes('MUTUALLY_EXCLUSIVE'), false);
  assert.equal(dialogSource.includes('group.count ? ('), true);
  const filterSource = fs.readFileSync(
    path.join(
      __dirname,
      '../../tables/DocumentModelTable/DocumentModelPgrClassificationFilters.tsx',
    ),
    'utf8',
  );
  assert.equal(filterSource.includes('toggleDocumentModelClassificationFilter(active, value)'), true);
});

run('post-apply asks to keep sections linked and never autosaves document data', () => {
  assert.equal(
    dialogSource.includes('Deseja manter estas seções vinculadas para futuras atualizações?'),
    true,
  );
  assert.equal(dialogSource.includes('Manter vinculadas'), true);
  assert.equal(dialogSource.includes('Agora não'), true);
  assert.equal(dialogSource.includes('useMutCreateDocumentModelSectionLink'), true);
  assert.equal(dialogSource.includes('saveDocumentModel('), false);
  assert.equal(dialogSource.includes('autosave'), false);
});

run('Gerenciar vínculos sits next to apply and unlink does not save document data', () => {
  assert.equal(actionSource.includes('Gerenciar vínculos'), true);
  assert.equal(actionSource.includes('DocumentModelSectionLinkManageDialog'), true);
  const manageSource = fs.readFileSync(
    path.join(__dirname, 'DocumentModelSectionLinkManageDialog.tsx'),
    'utf8',
  );
  assert.equal(manageSource.includes('Gerenciar vínculos da seção'), true);
  assert.equal(manageSource.includes('Seção'), true);
  assert.equal(manageSource.includes('Remover do vínculo'), true);
  assert.equal(manageSource.includes('Adicionar modelo'), true);
  assert.equal(manageSource.includes('saveDocumentModel'), false);
  assert.equal(manageSource.includes('autosave'), false);
  assert.equal(manageSource.includes('useMutRemoveDocumentModelSectionLinkMember'), true);
});

run('7/10. Strong Save of a linked section never auto-applies; after-save offers apply/unlink/now', () => {
  const persistSource = fs.readFileSync(
    path.join(
      __dirname,
      '../../modals/ModalEditDocumentModel/hooks/useEditDocumentModel.tsx',
    ),
    'utf8',
  );
  const viewSource = fs.readFileSync(
    path.join(
      __dirname,
      '../../modals/ModalEditDocumentModel/components/2-viewDocumentModelStep/hooks/useViewDocumentModel.ts',
    ),
    'utf8',
  );
  assert.equal(persistSource.includes('section-propagation/apply'), false);
  assert.equal(persistSource.includes('useMutApplySectionPropagation'), false);
  const afterSave = fs.readFileSync(
    path.join(__dirname, 'DocumentModelSectionLinkAfterSaveDialog.tsx'),
    'utf8',
  );
  assert.equal(
    afterSave.includes('Esta seção está vinculada a outros modelos e foi alterada.'),
    true,
  );
  assert.equal(afterSave.includes('Você alterou {changedCount} seções vinculadas.'), true);
  assert.equal(afterSave.includes('Aplicar aos modelos vinculados'), true);
  assert.equal(afterSave.includes('Desvincular esta seção'), true);
  assert.equal(afterSave.includes('Agora não'), true);
  assert.equal(actionSource.includes('linkedSaveEvent'), true);
  assert.equal(actionSource.includes('linkedSaveSignal'), false);
  assert.equal(actionSource.includes('setOpen(true)'), true);
  assert.equal(viewSource.includes('diffChangedHeadingWindows'), true);
  assert.equal(viewSource.includes('pendingExitRef'), true);
  assert.equal(viewSource.includes('onLinkedSaveSettled'), true);
});

console.log('section-propagation-gate ok');
