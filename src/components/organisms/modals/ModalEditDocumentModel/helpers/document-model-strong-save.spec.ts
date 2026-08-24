/**
 * Strong save contract — authority, no other writers, errors, concurrency helpers.
 *
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/modals/ModalEditDocumentModel/helpers/document-model-strong-save.spec.ts
 */
import assert from 'assert';
import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';

import {
  flushActiveClassicDocumentModelEditor,
  hasActiveClassicDocumentModelFlush,
  registerClassicDocumentModelFlush,
} from './classic-document-model-flush';
import {
  freezeDocumentModelSaveSnapshot,
  hashDocumentModelDataSync,
  serializeDocumentModelData,
} from './document-model-data-hash';
import {
  confirmDocumentModelSave,
  DOCUMENT_MODEL_SAVE_SUCCESS_MESSAGE,
  resolveDirtyAfterSaveAttempt,
  shouldApplyOfficialDocumentRebase,
} from './document-model-strong-save';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

function readRel(...parts: string[]) {
  return fs.readFileSync(path.join(__dirname, ...parts), 'utf8');
}

const persistSource = readRel('../hooks/useEditDocumentModel.tsx');
const persistFn = persistSource.slice(
  persistSource.indexOf('const saveDocumentModel'),
  persistSource.indexOf('const persistDocumentModel'),
);
const viewSource = readRel(
  '../components/2-viewDocumentModelStep/hooks/useViewDocumentModel.ts',
);
const draftSource = readRel(
  '../../../../molecules/form/draft-editor/DraftEditor.tsx',
);
const updateMutationSource = readRel(
  '../../../../../core/services/hooks/mutations/manager/document-model/useMutUpdateDocumentModel/useMutUpdateDocumentModel.ts',
);
const saveMutationSource = readRel(
  '../../../../../core/services/hooks/mutations/manager/document-model/useMutSaveDocumentModel/useMutSaveDocumentModel.ts',
);
const previewSource = readRel(
  '../../../../../core/services/hooks/mutations/checklist/documentData/useMutPreviewDocumentModel/useMutPreviewDocumentModel.ts',
);
const dataStepSource = readRel('../components/1-data/hooks/useDataStep.tsx');
const topButtons = readRel(
  '../components/2-viewDocumentModelStep/components/TopButtons/TopButtons.tsx',
);

const snapshot = {
  variables: {},
  sections: [{ data: [{ type: 'PARAGRAPH', text: 'última tecla' }] }],
};

run('1. Classic flush registry sends the current editor, not blur order', () => {
  let flushed = '';
  const unregister = registerClassicDocumentModelFlush(() => {
    flushed = 'última tecla';
  });
  assert.equal(hasActiveClassicDocumentModelFlush(), true);
  assert.equal(flushActiveClassicDocumentModelEditor(), true);
  assert.equal(flushed, 'última tecla');
  unregister();
  assert.equal(hasActiveClassicDocumentModelFlush(), false);
  assert.equal(persistFn.includes('flushActiveClassicDocumentModelEditor'), true);
  assert.equal(
    persistFn.includes('syncDocumentEditorExternalMutationsBeforeSave'),
    true,
  );
  assert.equal(
    persistFn.indexOf('syncDocumentEditorExternalMutationsBeforeSave') <
      persistFn.indexOf('flushActiveClassicDocumentModelEditor'),
    true,
  );
  assert.equal(
    persistFn.indexOf('flushActiveClassicDocumentModelEditor') <
      persistFn.indexOf('freezeDocumentModelSaveSnapshot'),
    true,
  );
  assert.equal(draftSource.includes('registerClassicDocumentModelFlush'), true);
  assert.equal(draftSource.includes('onEditorStateChange={handleChange}'), true);
  assert.equal(draftSource.includes('emitCurrentEditorToParent()'), true);
});

run('2-4. V2 snapshot is frozen before mutate and hash uses persist bytes', () => {
  const frozen = freezeDocumentModelSaveSnapshot(snapshot);
  assert.equal(Object.isFrozen(frozen), true);
  const clientHash = hashDocumentModelDataSync(frozen);
  const nodeHash = createHash('sha256')
    .update(serializeDocumentModelData(frozen), 'utf8')
    .digest('hex');
  assert.equal(clientHash, nodeHash);
  assert.equal(persistFn.includes('freezeDocumentModelSaveSnapshot'), true);
  assert.equal(persistFn.includes('hashDocumentModelData(snapshot)'), true);
  assert.equal(
    persistFn.indexOf('freezeDocumentModelSaveSnapshot') <
      persistFn.indexOf('mutateAsync'),
    true,
  );
  assert.equal(persistFn.includes('planPersist'), true);
  assert.equal(persistFn.includes("source = 'v2'"), true);
});

run('5-8. confirmation requires persisted hash === client hash and new updated_at', () => {
  const clientHash = hashDocumentModelDataSync(snapshot);
  const ok = confirmDocumentModelSave({
    clientHash,
    response: {
      id: 13,
      updated_at: '2026-08-23T21:00:00.000Z',
      dataHash: clientHash,
    },
  });
  assert.equal(ok.ok, true);
  if (ok.ok) assert.equal(ok.updatedAt, '2026-08-23T21:00:00.000Z');

  const mismatch = confirmDocumentModelSave({
    clientHash,
    response: {
      id: 13,
      updated_at: '2026-08-23T21:00:00.000Z',
      dataHash: 'a'.repeat(64),
    },
  });
  assert.equal(mismatch.ok, false);
  if (!mismatch.ok) assert.equal(mismatch.reason, 'hash-mismatch');

  const invalid = confirmDocumentModelSave({
    clientHash,
    response: { id: 13 },
  });
  assert.equal(invalid.ok, false);
  assert.equal(persistFn.includes('confirmDocumentModelSave'), true);
  assert.equal(saveMutationSource.includes('/save'), true);
  assert.equal(saveMutationSource.includes('clientHash'), true);
});

run('9-14. Redux/cache/dirty/snackbar/exit only after confirmation', () => {
  assert.equal(
    persistFn.indexOf('confirmDocumentModelSave') <
      persistFn.indexOf('setDocumentModel(snapshot)'),
    true,
  );
  assert.equal(
    persistFn.indexOf('confirmDocumentModelSave') <
      persistFn.indexOf('setSaveDocument'),
    true,
  );
  assert.equal(
    persistFn.indexOf('confirmDocumentModelSave') <
      persistFn.indexOf('setQueryData'),
    true,
  );
  assert.equal(
    persistFn.indexOf('confirmDocumentModelSave') <
      persistFn.indexOf('DOCUMENT_MODEL_SAVE_SUCCESS_MESSAGE'),
    true,
  );
  assert.equal(
    persistFn.includes('DOCUMENT_MODEL_SAVE_SUCCESS_MESSAGE'),
    true,
  );
  assert.equal(
    persistFn.indexOf('} catch') < persistFn.indexOf('finally'),
    true,
  );
  const catchBlock = persistFn.slice(persistFn.indexOf('} catch'));
  assert.equal(catchBlock.includes('setSaveDocument'), false);
  assert.equal(catchBlock.includes('enqueueSnackbar(DOCUMENT_MODEL_SAVE_SUCCESS_MESSAGE'), false);
  assert.equal(viewSource.includes("saveDocumentModel({"), true);
  assert.equal(viewSource.includes('if (ok && intent === \'exit\')'), true);
  assert.equal(resolveDirtyAfterSaveAttempt({ confirmed: false }), true);
  assert.equal(resolveDirtyAfterSaveAttempt({ confirmed: true }), false);
  assert.equal(
    resolveDirtyAfterSaveAttempt({
      confirmed: true,
      localChangedAfterSnapshot: true,
    }),
    true,
  );
});

run('15-20. blur/onChange/switch/refetch never call /save', () => {
  assert.equal(draftSource.includes('/save'), false);
  assert.equal(draftSource.includes('api.patch'), false);
  assert.equal(draftSource.includes('saveDocumentModelContent'), false);
  assert.equal(draftSource.includes('handleChange'), true);
  assert.equal(updateMutationSource.includes("data.data !== undefined"), true);
  assert.equal(
    updateMutationSource.includes(
      'Document content must be saved via PATCH /document-model/:companyId/:id/save',
    ),
    true,
  );
  assert.equal(persistSource.includes('shouldApplyOfficialDocumentRebase'), true);
  assert.equal(
    shouldApplyOfficialDocumentRebase({
      documentDirty: true,
      v2LocalDirty: false,
    }),
    false,
  );
  assert.equal(
    shouldApplyOfficialDocumentRebase({
      documentDirty: false,
      v2LocalDirty: true,
    }),
    false,
  );
  assert.equal(
    shouldApplyOfficialDocumentRebase({
      documentDirty: false,
      v2LocalDirty: false,
      confirmedUpdatedAt: '2026-08-23T21:00:00.000Z',
      incomingUpdatedAt: '2026-08-23T20:00:00.000Z',
    }),
    false,
  );
});

run('21-27. refetch/cache/preview/download/metadata/discard do not write data', () => {
  assert.equal(previewSource.includes('/preview'), true);
  assert.equal(previewSource.includes('/save'), false);
  assert.equal(previewSource.includes('api.patch'), false);
  assert.equal(dataStepSource.includes('data: snapshot'), false);
  assert.equal(dataStepSource.includes('data: payload'), false);
  assert.equal(dataStepSource.includes('saveDocumentModel'), false);
  const variablesStep = readRel('../components/3-variables/hooks/useDataStep.tsx');
  const imagesStep = readRel('../components/4-images/hooks/useDataStep.tsx');
  assert.equal(variablesStep.includes('saveDocumentModel'), false);
  assert.equal(imagesStep.includes('saveDocumentModel'), false);
  assert.equal(variablesStep.includes('persistDocumentModel'), false);
  assert.equal(imagesStep.includes('persistDocumentModel'), false);
  assert.equal(updateMutationSource.includes('IDocumentModelData'), false);
  assert.equal(persistSource.includes('discardLocalEdits()'), true);
  assert.equal(persistFn.includes('discardLocalEdits'), false);
});

run('28-35. failures keep dirty and never show success', () => {
  assert.equal(confirmDocumentModelSave({
    clientHash: 'a'.repeat(64),
    response: null,
  }).ok, false);
  assert.equal(persistFn.includes('DOCUMENT_MODEL_HASH_MISMATCH_MESSAGE'), true);
  assert.equal(persistFn.includes('DOCUMENT_MODEL_INVALID_SAVE_RESPONSE'), true);
  assert.equal(saveMutationSource.includes("variant: 'success'"), false);
  assert.equal(viewSource.includes('if (ok && intent === \'exit\')'), true);
  assert.equal(topButtons.includes('saveBusy'), true);
  assert.equal(persistFn.includes('saveMutation.isLoading'), true);
});

run('36-41. optimistic lock still required on official save', () => {
  assert.equal(persistFn.includes('expectedUpdatedAt'), true);
  assert.equal(persistFn.includes('if (!expectedUpdatedAt)'), true);
  assert.equal(saveMutationSource.includes('expectedUpdatedAt'), true);
  assert.equal(persistFn.includes('isDocumentModelConflict'), true);
});

run('no autosave / no background persist', () => {
  assert.equal(persistSource.includes('setInterval'), false);
  assert.equal(persistSource.includes('autosave'), false);
  assert.equal(persistFn.includes('debounce'), false);
  assert.equal(saveMutationSource.includes('/save'), true);
  assert.equal(topButtons.includes('text="Salvar"'), true);
  assert.equal(topButtons.includes('text="Salvar e sair"'), true);
});

console.log('\nStrong save contract: ok');
