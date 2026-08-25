/**
 * Recovery prompt vs current-session dirty vs 409.
 *
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/modals/ModalEditDocumentModel/helpers/document-model-recovery.spec.ts
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';

import {
  DOCUMENT_MODEL_RECOVERY_CONTINUE_ACTION,
  documentModelRecoveryContinuePersists,
  shouldPromptDocumentModelRecovery,
} from './document-model-recovery';

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
const conflictFn = persistSource.slice(
  persistSource.indexOf('const showDocumentModelConflict'),
  persistSource.indexOf('const saveDocumentModel'),
);
const continueFn = persistSource.slice(
  persistSource.indexOf('const onContinueOldDocument'),
  persistSource.indexOf('const saveInProgress'),
);
const v2ControlledSave = readRel(
  '../../../documentModel/editor-v2/integration/document-editor-v2-controlled-save.ts',
);
const externalMutation = readRel(
  '../../../documentModel/external-edit/document-editor-external-mutation.ts',
);

run('1-5. normal current-session dirty never prompts recovery', () => {
  assert.equal(
    shouldPromptDocumentModelRecovery({
      leftoverUnsavedOnOpen: false,
      recoveryAlreadyResolved: false,
      saveInProgress: false,
    }),
    false,
  );
  assert.equal(
    shouldPromptDocumentModelRecovery({
      leftoverUnsavedOnOpen: false,
      recoveryAlreadyResolved: false,
      saveInProgress: true,
    }),
    false,
  );
  assert.equal(persistFn.includes('shouldPromptDocumentModelRecovery'), false);
  assert.equal(persistFn.includes('Deseja continuar de onde parou'), false);
  assert.equal(persistFn.includes(DOCUMENT_MODEL_RECOVERY_CONTINUE_ACTION), false);
  assert.equal(viewSource.includes('shouldPromptDocumentModelRecovery'), false);
  assert.equal(viewSource.includes('await saveDocumentModel'), true);
  assert.equal(persistFn.includes('mutateAsync'), true);
});

run('6-7. Save and Exit still persists then closes only after success', () => {
  assert.equal(viewSource.includes("exitAfterSuccess: intent === 'exit'"), true);
  assert.equal(viewSource.includes("if (ok && intent === 'exit')"), true);
  assert.equal(viewSource.includes('closeEditor()'), true);
  assert.equal(
    viewSource.indexOf('await saveDocumentModel') <
      viewSource.indexOf("if (ok && intent === 'exit')"),
    true,
  );
});

run('8-10. real leftover prompts; Continuar editando never saves', () => {
  assert.equal(
    shouldPromptDocumentModelRecovery({
      leftoverUnsavedOnOpen: true,
      recoveryAlreadyResolved: false,
      saveInProgress: false,
    }),
    true,
  );
  assert.equal(documentModelRecoveryContinuePersists(), false);
  assert.equal(
    persistSource.includes('submitButtonText: DOCUMENT_MODEL_RECOVERY_CONTINUE_ACTION'),
    true,
  );
  assert.equal(persistSource.includes('onSelect: onContinueOldDocument'), true);
  assert.equal(continueFn.includes('mutateAsync'), false);
  assert.equal(continueFn.includes('saveDocumentModel'), false);
  assert.equal(continueFn.includes('enqueueSnackbar'), false);
  assert.equal(continueFn.includes('setSaveDocument'), false);
  assert.equal(continueFn.includes('setDocumentModelUpdatedAt'), false);
  assert.equal(continueFn.includes("sync: true"), true);
});

run('11. resolving recovery by discarding still hydrates official document', () => {
  assert.equal(persistSource.includes('onCloseWithoutSelect'), true);
  assert.equal(persistSource.includes('setDocument()'), true);
  assert.equal(
    persistSource.includes('leftoverUnsavedOnOpenRef.current = null'),
    true,
  );
});

run('12. 409 conflict modal stays a separate flow', () => {
  assert.equal(conflictFn.includes(DOCUMENT_MODEL_RECOVERY_CONTINUE_ACTION), false);
  assert.equal(conflictFn.includes('Deseja continuar de onde parou'), false);
  assert.equal(conflictFn.includes('DocumentModelConflictContent'), true);
  assert.equal(conflictFn.includes('hideButton: true'), true);
  assert.equal(persistFn.includes('isDocumentModelConflict(error)'), true);
  assert.equal(persistFn.includes('showDocumentModelConflict'), true);
});

run('13. Strong Save persist path is unchanged', () => {
  assert.equal(persistFn.includes('confirmDocumentModelSave'), true);
  assert.equal(persistFn.includes('freezeDocumentModelSaveSnapshot'), true);
  assert.equal(persistFn.includes('hashDocumentModelData(snapshot)'), true);
  assert.equal(persistFn.includes('expectedUpdatedAt'), true);
  assert.equal(persistFn.includes('clientHash'), true);
});

run('14. LanguageTool / external mutation is not touched', () => {
  assert.equal(externalMutation.includes('shouldPromptDocumentModelRecovery'), false);
  assert.equal(persistFn.includes('syncDocumentEditorExternalMutationsBeforeSave'), true);
});

run('15. Classic and V2 save stay free of the false recovery gate', () => {
  assert.equal(v2ControlledSave.includes('shouldPromptDocumentModelRecovery'), false);
  assert.equal(viewSource.includes("source = 'v2'"), false);
  assert.equal(persistFn.includes("source = 'v2'"), true);
  assert.equal(persistFn.includes("source: 'classic' | 'v2'"), true);
  assert.equal(
    persistSource.includes('leftoverUnsavedOnOpenRef.current === null'),
    true,
  );
  assert.equal(
    persistSource.includes('saveInProgress'),
    true,
  );
});

run('recovery already resolved or save in progress never prompts', () => {
  assert.equal(
    shouldPromptDocumentModelRecovery({
      leftoverUnsavedOnOpen: true,
      recoveryAlreadyResolved: true,
      saveInProgress: false,
    }),
    false,
  );
  assert.equal(
    shouldPromptDocumentModelRecovery({
      leftoverUnsavedOnOpen: true,
      recoveryAlreadyResolved: false,
      saveInProgress: true,
    }),
    false,
  );
});

console.log('\nAll document-model recovery tests passed.');
