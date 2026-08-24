/**
 * Fase C2 — Client optimistic lock (updated_at).
 *
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/modals/ModalEditDocumentModel/helpers/document-model-optimistic-lock.spec.ts
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';

import { documentSlice, setDocumentModelUpdatedAt } from 'store/reducers/document/documentSlice';

import {
  applyConflictClientPersist,
  applyContinueEditing,
  applyDocumentModelLockPatch,
  applyReloadOfficialDocument,
  applySuccessfulClientPersist,
  DOCUMENT_MODEL_CONFLICT,
  DOCUMENT_MODEL_CONFLICT_MESSAGE,
  DOCUMENT_MODEL_CONFLICT_PRIMARY_ACTION,
  DOCUMENT_MODEL_CONFLICT_PRIMARY_HINT,
  DOCUMENT_MODEL_CONFLICT_SECONDARY_ACTION,
  DOCUMENT_MODEL_CONFLICT_SECONDARY_HINT,
  DOCUMENT_MODEL_CONFLICT_TITLE,
  getExpectedUpdatedAtFromDocumentState,
  isDocumentModelConflict,
  rehydrateDocumentModelUpdatedAt,
  toOpaqueDocumentModelUpdatedAt,
  type DocumentModelLockClientState,
} from './document-model-optimistic-lock';

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
const conflictFn = persistSource.slice(
  persistSource.indexOf('const showDocumentModelConflict'),
  persistSource.indexOf('const saveDocumentModel'),
);
const conflictContentSource = readRel('./DocumentModelConflictContent.tsx');
const mutationSource = readRel(
  '../../../../../core/services/hooks/mutations/manager/document-model/useMutUpdateDocumentModel/useMutUpdateDocumentModel.ts',
);
const sliceSource = readRel('../../../../../store/reducers/document/documentSlice.ts');
const storeSource = readRel('../../../../../store/index.ts');
const dataStepSource = readRel('../components/1-data/hooks/useDataStep.tsx');
const viewSource = readRel(
  '../components/2-viewDocumentModelStep/hooks/useViewDocumentModel.ts',
);
const queryMetaSource = readRel(
  '../../../../../core/services/hooks/queries/useQueryDocumentModel/useQueryDocumentModel.ts',
);
const queryDataSource = readRel(
  '../../../../../core/services/hooks/queries/useQueryDocumentModelData/useQueryDocumentModelData.ts',
);

const T1 = '2026-08-20T03:00:00.000Z';
const T2 = '2026-08-20T03:01:00.000Z';
const T3 = '2026-08-20T03:02:00.000Z';

const localA = { text: 'A' };
const localB = { text: 'B' };

function openClient(token: string, data: unknown): DocumentModelLockClientState {
  return {
    token,
    dirty: false,
    localDocument: data,
    cacheDocument: data,
    cacheUpdatedAt: token,
    v2Persisted: true,
  };
}

function editClient(
  state: DocumentModelLockClientState,
  data: unknown,
): DocumentModelLockClientState {
  return { ...state, dirty: true, localDocument: data, v2Persisted: false };
}

function persistClient(
  state: DocumentModelLockClientState,
  backend: { updated_at: string; data: unknown },
  nextUpdatedAt: string,
) {
  const applied = applyDocumentModelLockPatch({
    backend,
    expectedUpdatedAt: getExpectedUpdatedAtFromDocumentState({
      documentModelUpdatedAt: state.token,
    }),
    data: state.localDocument,
    nextUpdatedAt,
  });
  if (applied.result.status === 409) {
    return {
      backend: applied.backend,
      state: applyConflictClientPersist(state),
      result: applied.result,
      cacheWritten: false,
    };
  }
  return {
    backend: applied.backend,
    state: applySuccessfulClientPersist(state, applied.result),
    result: applied.result,
    cacheWritten: true,
  };
}

run('1. token carrega do GET como string ISO opaca', () => {
  assert.equal(toOpaqueDocumentModelUpdatedAt(T1), T1);
  assert.equal(
    toOpaqueDocumentModelUpdatedAt(new Date(T1)),
    new Date(T1).toISOString(),
  );
  assert.equal(toOpaqueDocumentModelUpdatedAt(''), null);
  assert.equal(toOpaqueDocumentModelUpdatedAt(undefined), null);
  assert.equal(queryMetaSource.includes('updated_at'), false);
  assert.equal(queryMetaSource.includes('IDocumentModel'), true);
  assert.equal(queryDataSource.includes('/data'), true);
  assert.equal(persistSource.includes('toOpaqueDocumentModelUpdatedAt(model?.updated_at)'), true);
  assert.equal(persistSource.includes('Date.now'), false);
});

run('2. token entra no Redux document, fora do canonical model.data', () => {
  const after = documentSlice.reducer(
    undefined,
    setDocumentModelUpdatedAt(T1),
  );
  assert.equal(after.documentModelUpdatedAt, T1);
  assert.equal(sliceSource.includes('documentModelUpdatedAt: string | null'), true);
  assert.equal(sliceSource.includes('setDocumentModelUpdatedAt'), true);
  assert.equal(persistSource.includes('setDocumentModelUpdatedAt(token)'), true);
  assert.equal(persistFn.includes('model.data'), false);
});

run('3. Redux Persist mantém a string ISO', () => {
  assert.equal(storeSource.includes("whitelist: ['document']"), true);
  const persisted = JSON.parse(
    JSON.stringify({
      document: {
        documentModelUpdatedAt: T1,
        needSynchronization: true,
      },
    }),
  );
  assert.equal(typeof persisted.document.documentModelUpdatedAt, 'string');
  assert.equal(rehydrateDocumentModelUpdatedAt(persisted.document.documentModelUpdatedAt), T1);
  assert.equal(rehydrateDocumentModelUpdatedAt(new Date('invalid')), null);
});

run('4. V1 envia token no persist comum', () => {
  assert.equal(persistFn.includes('expectedUpdatedAt'), true);
  assert.equal(persistFn.includes('getExpectedUpdatedAtFromDocumentState'), true);
  assert.equal(persistFn.includes('data: snapshot'), true);
  assert.equal(mutationSource.includes('expectedUpdatedAt?: string'), true);
});

run('5. V2 envia token no mesmo persistDocumentModel', () => {
  assert.equal(persistFn.includes('planPersist'), true);
  assert.equal(persistFn.includes('expectedUpdatedAt'), true);
  assert.equal(persistSource.split('const saveDocumentModel').length, 2);
  assert.equal(persistSource.includes('const persistDocumentModel'), true);
});

run('6. 200 atualiza token para T2 da response', () => {
  const opened = openClient(T1, { text: 'open' });
  const edited = editClient(opened, localA);
  const saved = persistClient(edited, { updated_at: T1, data: { text: 'open' } }, T2);
  assert.equal(saved.result.status, 200);
  if (saved.result.status !== 200) throw new Error('expected 200');
  assert.equal(saved.state.token, T2);
  assert.equal(saved.state.cacheUpdatedAt, T2);
  assert.equal(saved.state.dirty, false);
  assert.equal(persistFn.includes('confirmation.updatedAt'), true);
  assert.equal(persistFn.includes('Date.now'), false);
  assert.equal(persistFn.includes('new Date'), false);
});

run('7. segundo save usa T2', () => {
  let backend: { updated_at: string; data: unknown } = {
    updated_at: T1,
    data: { text: 'open' },
  };
  const first = persistClient(editClient(openClient(T1, backend.data), localA), backend, T2);
  backend = first.backend;
  const second = persistClient(editClient(first.state, { text: 'A2' }), backend, T3);
  assert.equal(second.result.status, 200);
  if (second.result.status !== 200) throw new Error('expected 200');
  assert.equal(first.state.token, T2);
  assert.equal(second.state.token, T3);
});

run('8. 409 mantém dirty', () => {
  const opened = openClient(T1, { text: 'open' });
  const edited = editClient(opened, localB);
  const conflicted = persistClient(edited, { updated_at: T2, data: localA }, T3);
  assert.equal(conflicted.result.status, 409);
  assert.equal(conflicted.state.dirty, true);
});

run('9. 409 mantém conteúdo local', () => {
  const edited = editClient(openClient(T1, { text: 'open' }), localB);
  const conflicted = persistClient(edited, { updated_at: T2, data: localA }, T3);
  assert.deepStrictEqual(conflicted.state.localDocument, localB);
  assert.deepStrictEqual(conflicted.backend.data, localA);
});

run('10. 409 não setQueryData', () => {
  const catchBlock = persistFn.slice(persistFn.indexOf('} catch'));
  const successBlock = persistFn.slice(
    persistFn.indexOf('mutateAsync'),
    persistFn.indexOf('} catch'),
  );
  assert.equal(successBlock.includes('setQueryData'), true);
  assert.equal(catchBlock.includes('setQueryData'), false);
  const conflicted = persistClient(
    editClient(openClient(T1, { text: 'open' }), localB),
    { updated_at: T2, data: localA },
    T3,
  );
  assert.equal(conflicted.cacheWritten, false);
  assert.deepStrictEqual(conflicted.state.cacheDocument, { text: 'open' });
  assert.equal(conflicted.state.cacheUpdatedAt, T1);
});

run('11. 409 não atualiza baseline/token', () => {
  const catchBlock = persistFn.slice(persistFn.indexOf('} catch'));
  assert.equal(catchBlock.includes('setDocumentModelUpdatedAt'), false);
  assert.equal(catchBlock.includes('markPersisted'), false);
  assert.equal(catchBlock.includes('setSaveDocument'), false);
  assert.equal(catchBlock.includes('v2Session.markPersisted'), false);
  const conflicted = persistClient(
    editClient(openClient(T1, { text: 'open' }), localB),
    { updated_at: T2, data: localA },
    T3,
  );
  assert.equal(conflicted.state.token, T1);
  assert.equal(conflicted.state.v2Persisted, false);
});

run('12. Manter esta versão aberta para copiar fecha só o alerta', () => {
  const conflicted = persistClient(
    editClient(openClient(T1, { text: 'open' }), localB),
    { updated_at: T2, data: localA },
    T3,
  );
  const continued = applyContinueEditing(conflicted.state);
  assert.deepStrictEqual(continued.localDocument, localB);
  assert.equal(continued.dirty, true);
  assert.equal(continued.token, T1);
  assert.equal(continued.cacheUpdatedAt, T1);
  assert.equal(conflictFn.includes('onKeepOpenToCopy={closeConflictAlert}'), true);
  assert.equal(conflictFn.includes('setQueryData'), false);
  assert.equal(conflictFn.includes('setDocumentModelUpdatedAt'), false);
  assert.equal(conflictFn.includes('setSaveDocument'), false);
  assert.equal(conflictFn.includes('reloadOfficialDocument'), true);
  assert.equal(
    conflictFn.indexOf('onLoadLatest') < conflictFn.indexOf('onKeepOpenToCopy'),
    true,
  );
});

run('13. Carregar versão mais recente descarta local e pega T2', () => {
  const conflicted = persistClient(
    editClient(openClient(T1, { text: 'open' }), localB),
    { updated_at: T2, data: localA },
    T3,
  );
  const reloaded = applyReloadOfficialDocument(conflicted.backend);
  assert.equal(reloaded.token, T2);
  assert.deepStrictEqual(reloaded.localDocument, localA);
  assert.equal(reloaded.dirty, false);
  assert.equal(conflictFn.includes('void reloadOfficialDocument()'), true);
  assert.equal(persistSource.includes('fetchDocumentModelMeta'), true);
  assert.equal(persistSource.includes('fetchDocumentModelData'), true);
  assert.equal(persistSource.includes('v2Session.discardLocalEdits()'), true);
  assert.equal(persistFn.includes('discardLocalEdits'), false);
});

run('14. duas abas — A salva T2, B com T1 recebe 409', () => {
  const backend0 = { updated_at: T1, data: { text: 'open' } };
  const tabA = persistClient(
    editClient(openClient(T1, backend0.data), localA),
    backend0,
    T2,
  );
  assert.equal(tabA.result.status, 200);
  const tabB = persistClient(
    editClient(openClient(T1, backend0.data), localB),
    tabA.backend,
    T3,
  );
  assert.equal(tabB.result.status, 409);
  assert.deepStrictEqual(tabA.backend.data, localA);
  assert.deepStrictEqual(tabB.backend.data, localA);
  assert.deepStrictEqual(tabB.state.localDocument, localB);
  assert.equal(tabB.cacheWritten, false);
  const reloadedB = applyReloadOfficialDocument(tabB.backend);
  const tabBRetry = persistClient(
    editClient(reloadedB, { text: 'B2' }),
    tabB.backend,
    T3,
  );
  assert.equal(tabBRetry.result.status, 200);
  if (tabBRetry.result.status !== 200) throw new Error('expected 200');
  assert.equal(tabBRetry.state.token, T3);
  assert.deepStrictEqual(tabBRetry.backend.data, { text: 'B2' });
});

run('15. metadata bump gera conflito no editor com T1', () => {
  const opened = openClient(T1, { text: 'open' });
  const metadata = applyDocumentModelLockPatch({
    backend: { updated_at: T1, data: { text: 'open' } },
    nextUpdatedAt: T2,
  });
  assert.equal(metadata.result.status, 200);
  const contentSave = persistClient(editClient(opened, localA), metadata.backend, T3);
  assert.equal(contentSave.result.status, 409);
  assert.equal(contentSave.state.token, T1);
  assert.equal(dataStepSource.includes('expectedUpdatedAt'), false);
  assert.equal(dataStepSource.includes('data: payload'), false);
});

run('16. retry stale continua 409', () => {
  const backend = { updated_at: T2, data: localA };
  const first = persistClient(editClient(openClient(T1, { text: 'open' }), localB), backend, T3);
  const retry = persistClient(first.state, first.backend, T3);
  assert.equal(first.result.status, 409);
  assert.equal(retry.result.status, 409);
  assert.equal(retry.state.token, T1);
});

run('17. reload T2 → save T3', () => {
  const conflicted = persistClient(
    editClient(openClient(T1, { text: 'open' }), localB),
    { updated_at: T2, data: localA },
    T3,
  );
  const reloaded = applyReloadOfficialDocument(conflicted.backend);
  const saved = persistClient(editClient(reloaded, { text: 'B2' }), conflicted.backend, T3);
  assert.equal(saved.result.status, 200);
  if (saved.result.status !== 200) throw new Error('expected 200');
  assert.equal(saved.state.token, T3);
});

run('18. Save stay em 409 não fecha e não marca sucesso', () => {
  assert.equal(viewSource.includes("runPersist('stay')"), true);
  assert.equal(viewSource.includes('if (ok && intent === \'exit\')'), true);
  const conflicted = persistClient(
    editClient(openClient(T1, { text: 'open' }), localB),
    { updated_at: T2, data: localA },
    T3,
  );
  assert.equal(conflicted.state.dirty, true);
  assert.equal(conflicted.result.status, 409);
});

run('19. Save and exit em 409 não fecha', () => {
  assert.equal(viewSource.includes('if (ok && intent === \'exit\')'), true);
  assert.equal(viewSource.includes('closeEditor()'), true);
  const persistFalseKeepsOpen = persistFn.includes('return false');
  assert.equal(persistFalseKeepsOpen, true);
});

run('20. V2 Classic após sucesso não descarta no persist', () => {
  const saved = persistClient(
    editClient(openClient(T1, { text: 'open' }), localA),
    { updated_at: T1, data: { text: 'open' } },
    T2,
  );
  assert.equal(saved.state.v2Persisted, true);
  assert.equal(persistFn.includes("v2Session.markPersisted(persistBuilt.built)"), true);
  assert.equal(persistFn.includes('discardLocalEdits'), false);
});

run('21. V2 conflict não descarta', () => {
  const catchBlock = persistFn.slice(persistFn.indexOf('} catch'));
  assert.equal(catchBlock.includes('discardLocalEdits'), false);
  assert.equal(catchBlock.includes('setDocumentModel('), false);
  const conflicted = persistClient(
    editClient(openClient(T1, { text: 'open' }), localB),
    { updated_at: T2, data: localA },
    T3,
  );
  assert.deepStrictEqual(conflicted.state.localDocument, localB);
  assert.equal(conflicted.state.v2Persisted, false);
});

run('22. V1 intacto sem conflito', () => {
  assert.equal(persistFn.includes('resolveOfficialSaveAttempt'), true);
  assert.equal(
    persistFn.indexOf('mutateAsync') < persistFn.indexOf('setDocumentModel'),
    true,
  );
  const saved = persistClient(
    editClient(openClient(T1, { text: 'open' }), localA),
    { updated_at: T1, data: { text: 'open' } },
    T2,
  );
  assert.equal(saved.result.status, 200);
  assert.deepStrictEqual(saved.backend.data, localA);
});

run('23. erro genérico intacto; 409 não é snackbar genérico', () => {
  assert.equal(isDocumentModelConflict({ response: { status: 409, data: { code: DOCUMENT_MODEL_CONFLICT } } }), true);
  assert.equal(isDocumentModelConflict({ response: { status: 409, data: { code: 'OTHER' } } }), false);
  assert.equal(isDocumentModelConflict({ response: { status: 400, data: { code: DOCUMENT_MODEL_CONFLICT } } }), false);
  assert.equal(isDocumentModelConflict({ response: { status: 500, data: { message: 'fail' } } }), false);
  assert.equal(isDocumentModelConflict({ message: 'Network Error' }), false);
  assert.equal(mutationSource.includes('if (isDocumentModelConflict(error)) return;'), true);
  assert.equal(mutationSource.includes("enqueueSnackbar(error.response.data.message"), true);
  assert.equal(persistFn.includes('isDocumentModelConflict(error)'), true);
});

run('24. hard refresh/rehydrate não transforma token em Date inválido', () => {
  const raw = JSON.parse(JSON.stringify({ documentModelUpdatedAt: T1 }));
  assert.equal(typeof raw.documentModelUpdatedAt, 'string');
  assert.equal(rehydrateDocumentModelUpdatedAt(raw.documentModelUpdatedAt), T1);
  assert.equal(persistSource.includes('!existing && incoming'), true);
  assert.equal(persistSource.includes('onContinueOldDocument'), true);
});

run('contrato UX do conflito', () => {
  assert.equal(DOCUMENT_MODEL_CONFLICT_TITLE, 'Modelo alterado');
  assert.equal(
    DOCUMENT_MODEL_CONFLICT_MESSAGE.includes(
      'Este modelo foi alterado e salvo em outra sessão depois que você o abriu.',
    ),
    true,
  );
  assert.equal(
    DOCUMENT_MODEL_CONFLICT_MESSAGE.includes(
      'As alterações feitas nesta tela não foram salvas nem apagadas.',
    ),
    true,
  );
  assert.equal(
    DOCUMENT_MODEL_CONFLICT_PRIMARY_HINT.includes('versão mais recente'),
    true,
  );
  assert.equal(
    DOCUMENT_MODEL_CONFLICT_PRIMARY_HINT.includes('versão desatualizada'),
    true,
  );
  assert.equal(
    DOCUMENT_MODEL_CONFLICT_PRIMARY_ACTION,
    'Carregar versão mais recente',
  );
  assert.equal(
    DOCUMENT_MODEL_CONFLICT_SECONDARY_ACTION,
    'Manter esta versão aberta para copiar',
  );
  assert.equal(
    DOCUMENT_MODEL_CONFLICT_SECONDARY_HINT.includes(
      'mantenha esta versão aberta temporariamente para copiar',
    ),
    true,
  );
  assert.equal(conflictFn.includes('hideButton: true'), true);
  assert.equal(conflictFn.includes('DocumentModelConflictContent'), true);
  assert.equal(conflictContentSource.includes("variant=\"contained\""), true);
  assert.equal(conflictContentSource.includes("variant=\"outlined\""), true);
  assert.equal(
    conflictContentSource.indexOf('DOCUMENT_MODEL_CONFLICT_PRIMARY_ACTION') <
      conflictContentSource.indexOf('DOCUMENT_MODEL_CONFLICT_SECONDARY_ACTION'),
    true,
  );
  assert.equal(conflictFn.includes('Continuar editando'), false);
  assert.equal(conflictFn.includes('Recarregar versão atual'), false);
  assert.equal(conflictContentSource.includes('Continuar editando'), false);
  assert.equal(conflictContentSource.includes('Recarregar versão atual'), false);
  assert.equal(conflictContentSource.includes('Sobrescrever'), false);
  assert.equal(conflictContentSource.includes('location.reload'), false);
  assert.equal(persistSource.includes('force save'), false);
  assert.equal(persistSource.includes('forceSave'), false);
  assert.equal(persistSource.includes('location.reload'), false);
});

run('depois de manter aberta, Save stale continua 409', () => {
  const conflicted = persistClient(
    editClient(openClient(T1, { text: 'open' }), localB),
    { updated_at: T2, data: localA },
    T3,
  );
  const kept = applyContinueEditing(conflicted.state);
  const retry = persistClient(kept, conflicted.backend, T3);
  assert.equal(retry.result.status, 409);
  assert.equal(retry.state.token, T1);
  assert.deepStrictEqual(retry.state.localDocument, localB);
  assert.equal(retry.cacheWritten, false);
});

run('PATCH comum V1+V2 e cache só no 200', () => {
  assert.equal(persistFn.includes('expectedUpdatedAt'), true);
  assert.equal(persistFn.includes('[QueryEnum.DOCUMENT_MODEL, data.id'), true);
  assert.equal(persistFn.includes('[QueryEnum.DOCUMENT_MODEL_DATA, query]'), true);
});

console.log('\nFase C2 optimistic-lock: ok');
