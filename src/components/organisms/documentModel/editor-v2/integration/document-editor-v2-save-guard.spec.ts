/**
 * Fase 4B hotfix — contrato de guard/save do V2 experimental.
 *
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/documentModel/editor-v2/integration/document-editor-v2-save-guard.spec.ts
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';

import {
  canClearExperimentalDirty,
  createV2SaveGuardSession,
  DOCUMENT_EDITOR_V2_DIRTY_NOTICE,
  markV2LocalDirty,
  resolveClassicSwitchAttempt,
  resolveDiscardExperiment,
  resolveExperimentalStatusMessage,
  resolveOfficialSaveAttempt,
  shouldRebaseOfficialDocument,
} from './document-editor-v2-save-guard';
import { shouldBlockOfficialSave } from './document-editor-v2-session';

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

run('1. V2 pristine → Save oficial permitido (comportamento V1)', () => {
  const session = createV2SaveGuardSession({ surface: 'v2' });
  const stay = resolveOfficialSaveAttempt(session, 'stay');
  assert.equal(stay.persist, true);
  assert.equal(stay.close, false);
  assert.equal(stay.next.v2LocalDirty, false);
  assert.equal(stay.next.baselineRevision, session.baselineRevision);
  assert.equal(stay.next.remountKey, session.remountKey);
});

run('2. V2 dirty → Save não persiste, continua dirty, aviso permanece, baseline igual', () => {
  const session = markV2LocalDirty(createV2SaveGuardSession({ surface: 'v2' }));
  const beforeBaseline = session.baselineRevision;
  const beforeRemount = session.remountKey;
  const decision = resolveOfficialSaveAttempt(session, 'stay');

  assert.equal(decision.persist, false);
  assert.equal(decision.close, false);
  assert.equal(decision.next.v2LocalDirty, true);
  assert.equal(decision.next.baselineRevision, beforeBaseline);
  assert.equal(decision.next.remountKey, beforeRemount);
  assert.equal(
    resolveExperimentalStatusMessage(decision.next)?.includes(
      DOCUMENT_EDITOR_V2_DIRTY_NOTICE,
    ),
    true,
  );
  assert.equal(shouldRebaseOfficialDocument(decision.next), false);
  assert.equal(canClearExperimentalDirty('official-v1-save'), false);
  assert.equal(canClearExperimentalDirty('official-v2-persist'), false);
});

run('3. V2 dirty → Salvar e sair não fecha e continua dirty', () => {
  const session = markV2LocalDirty(createV2SaveGuardSession({ surface: 'v2' }));
  const decision = resolveOfficialSaveAttempt(session, 'exit');
  assert.equal(decision.persist, false);
  assert.equal(decision.close, false);
  assert.equal(decision.next.v2LocalDirty, true);
});

run('4. V2 dirty → Clássico exige descarte', () => {
  const session = markV2LocalDirty(createV2SaveGuardSession({ surface: 'v2' }));
  const classic = resolveClassicSwitchAttempt(session);
  assert.equal(classic.allowed, false);
  assert.equal(classic.next.v2LocalDirty, true);
  assert.equal(classic.next.surface, 'v2');
});

run('5. V2 dirty → Save e DEPOIS Clássico ainda exige descarte', () => {
  const session = markV2LocalDirty(createV2SaveGuardSession({ surface: 'v2' }));
  const afterSave = resolveOfficialSaveAttempt(session, 'stay').next;
  const classic = resolveClassicSwitchAttempt(afterSave);
  assert.equal(afterSave.v2LocalDirty, true);
  assert.equal(classic.allowed, false);
  assert.equal(classic.next.v2LocalDirty, true);
});

run('6. V2 dirty → Save repetido continua dirty', () => {
  let session = markV2LocalDirty(createV2SaveGuardSession({ surface: 'v2' }));
  for (let i = 0; i < 5; i += 1) {
    const decision = resolveOfficialSaveAttempt(session, 'stay');
    assert.equal(decision.persist, false);
    assert.equal(decision.next.v2LocalDirty, true);
    assert.equal(decision.next.baselineRevision, 0);
    session = decision.next;
  }
});

run('7. Descartar experimento limpa dirty e permite Clássico', () => {
  const dirty = markV2LocalDirty(createV2SaveGuardSession({ surface: 'v2' }));
  const discarded = resolveDiscardExperiment(dirty);
  assert.equal(discarded.v2LocalDirty, false);
  assert.equal(discarded.experimentNotice, null);
  assert.equal(discarded.remountKey, dirty.remountKey + 1);
  assert.equal(discarded.baselineRevision, dirty.baselineRevision + 1);
  const classic = resolveClassicSwitchAttempt(discarded);
  assert.equal(classic.allowed, true);
  assert.equal(canClearExperimentalDirty('discard'), true);
});

run('8. Nenhum PATCH / Redux write-back V2 no persist', () => {
  const persist = fs.readFileSync(
    path.join(
      __dirname,
      '../../../modals/ModalEditDocumentModel/hooks/useEditDocumentModel.tsx',
    ),
    'utf8',
  );
  const view = fs.readFileSync(
    path.join(
      __dirname,
      '../../../modals/ModalEditDocumentModel/components/2-viewDocumentModelStep/hooks/useViewDocumentModel.ts',
    ),
    'utf8',
  );

  assert.equal(persist.includes('resolveOfficialSaveAttempt'), true);
  assert.equal(persist.includes('shouldRebaseOfficialDocument'), true);
  assert.equal(persist.includes('fromTipTapState'), false);
  assert.equal(view.includes('fromTipTapState'), false);
  assert.equal(persist.includes('discardLocalEdits()'), true);
  const persistFn = persist.slice(
    persist.indexOf('const persistDocumentModel'),
    persist.indexOf('const onCloseUnsaved'),
  );
  assert.equal(persistFn.includes('discardLocalEdits'), false);
  assert.equal(persistFn.includes('fromTipTapState'), false);
  assert.equal(persistFn.includes('resolveOfficialSaveAttempt'), true);
  assert.equal(
    persistFn.indexOf('resolveOfficialSaveAttempt') <
      persistFn.indexOf('mutateAsync'),
    true,
  );
});

run('9. V1 sem V2 dirty continua salvando normalmente', () => {
  const v1 = createV2SaveGuardSession({ surface: 'v1', v2LocalDirty: false });
  const decision = resolveOfficialSaveAttempt(v1, 'stay');
  assert.equal(decision.persist, true);
  assert.equal(shouldBlockOfficialSave(v1), false);
  assert.equal(shouldRebaseOfficialDocument(v1), true);

  const v2Pristine = createV2SaveGuardSession({ surface: 'v2' });
  assert.equal(resolveOfficialSaveAttempt(v2Pristine, 'stay').persist, true);
});

run('10. aviso dirty não some depois de Save bloqueado', () => {
  const session = markV2LocalDirty(createV2SaveGuardSession({ surface: 'v2' }));
  const afterSave = resolveOfficialSaveAttempt(session, 'stay').next;
  const message = resolveExperimentalStatusMessage(afterSave);
  assert.ok(message);
  assert.equal(message.includes(DOCUMENT_EDITOR_V2_DIRTY_NOTICE), true);
});

run('hooks reais usam o contrato de guard', () => {
  const persist = readRel(
    '../../../modals/ModalEditDocumentModel/hooks/useEditDocumentModel.tsx',
  );
  const view = readRel(
    '../../../modals/ModalEditDocumentModel/components/2-viewDocumentModelStep/hooks/useViewDocumentModel.ts',
  );
  const topButtons = readRel(
    '../../../modals/ModalEditDocumentModel/components/2-viewDocumentModelStep/components/TopButtons/TopButtons.tsx',
  );
  const session = readRel('./DocumentEditorV2Session.tsx');
  const header = readRel('./DocumentEditorV2HeaderControls.tsx');

  assert.equal(view.includes('resolveOfficialSaveAttempt'), true);
  assert.equal(topButtons.includes('officialSaveBlocked'), true);
  assert.equal(topButtons.includes('reportBlockedSave'), true);
  assert.equal(header.includes('resolveExperimentalStatusMessage'), true);
  assert.equal(session.includes("if (next === 'v1')"), false);
  assert.equal(session.includes('setV2LocalDirty(false)'), true);
  assert.equal(
    session.includes('discardLocalEdits'),
    true,
  );
});

console.log('\nFase 4B save-guard: ok');
