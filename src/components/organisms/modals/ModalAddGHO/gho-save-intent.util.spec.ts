/**
 * Contrato STAY/EXIT do salvar do GSE.
 * Executar:
 * npx tsx src/components/organisms/modals/ModalAddGHO/gho-save-intent.util.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { getGseWizardTabOptions, GSE_WIZARD_STEP } from './gse-wizard-steps';
import {
  buildGhoStaySnapshot,
  getGhoEditorSnapshot,
  isGhoEditorDirty,
  resolveGhoSaveIntent,
  shouldStayAfterGhoSave,
} from './gho-save-intent.util';

assert.equal(
  resolveGhoSaveIntent({ layout: 'modal', requestedIntent: 'stay' }),
  'exit',
);
assert.equal(
  resolveGhoSaveIntent({ layout: 'modal', requestedIntent: 'exit' }),
  'exit',
);
assert.equal(resolveGhoSaveIntent({ layout: 'modal' }), 'exit');
assert.equal(resolveGhoSaveIntent({ layout: 'page' }), 'exit');
assert.equal(
  resolveGhoSaveIntent({ layout: 'page', requestedIntent: 'exit' }),
  'exit',
);
assert.equal(
  resolveGhoSaveIntent({ layout: 'page', requestedIntent: 'stay' }),
  'stay',
);

assert.equal(
  shouldStayAfterGhoSave({ intent: 'stay', savedId: 'gse-1' }),
  true,
);
assert.equal(shouldStayAfterGhoSave({ intent: 'exit', savedId: 'gse-1' }), false);
assert.equal(shouldStayAfterGhoSave({ intent: 'stay', savedId: '' }), false);
assert.equal(
  shouldStayAfterGhoSave({ intent: 'stay', savedId: undefined }),
  false,
);

const current = {
  id: '',
  name: 'rascunho',
  description: 'antes',
  layout: 'page' as const,
  workspaceIds: ['ws-1'],
  workspaceIdsTouched: true,
  status: 'ACTIVE',
};

const stayAfterCreate = buildGhoStaySnapshot({
  current,
  form: { name: 'GSE salvo', description: 'depois' },
  savedId: 'gse-created',
  workspaceIds: ['ws-1'],
});

assert.equal(stayAfterCreate.id, 'gse-created');
assert.equal(stayAfterCreate.name, 'GSE salvo');
assert.equal(stayAfterCreate.description, 'depois');
assert.equal(stayAfterCreate.workspaceIdsTouched, false);
assert.deepEqual(stayAfterCreate.workspaceIds, ['ws-1']);
assert.equal(stayAfterCreate.layout, 'page');

const viewedAfterStay = {
  ...stayAfterCreate,
  name: 'GSE salvo',
  description: 'depois',
};
assert.deepEqual(viewedAfterStay, stayAfterCreate);

const pageTabsAfterCreateStay = getGseWizardTabOptions({
  layout: 'page',
  isEdit: !!stayAfterCreate.id,
});
assert.equal(pageTabsAfterCreateStay[GSE_WIZARD_STEP.RISKS].disabled, false);
assert.equal(
  pageTabsAfterCreateStay[GSE_WIZARD_STEP.AI_ANALYSIS].disabled,
  false,
);

const stayAfterUpdate = buildGhoStaySnapshot({
  current: { ...current, id: 'gse-1' },
  form: { name: 'GSE editado', description: 'desc' },
  savedId: 'gse-1',
  workspaceIds: ['ws-2'],
});
assert.equal(stayAfterUpdate.id, 'gse-1');
assert.equal(stayAfterUpdate.name, 'GSE editado');
assert.equal(stayAfterUpdate.workspaceIdsTouched, false);

function simulateSubmitThen409Retry(params: {
  layout: 'modal' | 'page';
  requestedIntent: 'stay' | 'exit';
}) {
  const captured = resolveGhoSaveIntent({
    layout: params.layout,
    requestedIntent: params.requestedIntent,
  });
  const refAfterCapture: 'stay' | 'exit' = 'exit';
  const retryIntent = captured;
  return { captured, refAfterCapture, retryIntent };
}

const pageStay409 = simulateSubmitThen409Retry({
  layout: 'page',
  requestedIntent: 'stay',
});
assert.equal(pageStay409.captured, 'stay');
assert.equal(pageStay409.refAfterCapture, 'exit');
assert.equal(pageStay409.retryIntent, 'stay');

const pageExit409 = simulateSubmitThen409Retry({
  layout: 'page',
  requestedIntent: 'exit',
});
assert.equal(pageExit409.retryIntent, 'exit');

const modalStayIgnored409 = simulateSubmitThen409Retry({
  layout: 'modal',
  requestedIntent: 'stay',
});
assert.equal(modalStayIgnored409.captured, 'exit');
assert.equal(modalStayIgnored409.retryIntent, 'exit');

const formSource = readFileSync(
  resolve(
    'src/components/organisms/modals/ModalAddGHO/components/GhoFormContent.tsx',
  ),
  'utf8',
);
assert.equal(formSource.includes("setSaveIntent?.('stay')"), true);
assert.equal(formSource.includes("setSaveIntent?.('exit')"), true);
assert.equal(formSource.includes("'Salvar e Sair'"), true);
assert.equal(formSource.includes('Cancelar'), true);
assert.equal(formSource.includes('getSaveActionColor'), true);
assert.equal(formSource.includes('saveActionColor'), true);
assert.equal(formSource.includes('disabled={loading}'), true);
assert.equal(formSource.includes('Excluir'), true);
assert.equal(
  /Excluir[\s\S]{0,200}saveActionColor/.test(formSource),
  false,
);

assert.equal(
  isGhoEditorDirty(stayAfterCreate, stayAfterCreate),
  false,
  'stay baseline is pristine',
);
assert.equal(
  isGhoEditorDirty(
    { ...stayAfterCreate, name: 'GSE salvo editado' },
    stayAfterCreate,
  ),
  true,
  'persistent field edit is dirty',
);

assert.equal(
  getGhoEditorSnapshot({ name: 'GSE 1', description: 'desc' }, {}).name,
  'GSE 1',
);
assert.equal(
  getGhoEditorSnapshot(
    { name: 'GSE 1', description: '' },
    { description: 'carregada da query' },
  ).description,
  'carregada da query',
);
assert.equal(
  isGhoEditorDirty(
    getGhoEditorSnapshot(
      { name: 'GSE 1', description: 'carregada da query' },
      { name: 'GSE 1', description: 'carregada da query' },
    ),
    getGhoEditorSnapshot(
      { name: 'GSE 1', description: 'carregada da query' },
      { name: 'GSE 1', description: 'carregada da query' },
    ),
  ),
  false,
);

const modalSource = readFileSync(
  resolve('src/components/organisms/modals/ModalAddGHO/index.tsx'),
  'utf8',
);
assert.equal(modalSource.includes('Salvar e Sair'), false);
assert.equal(modalSource.includes("text: ghoData.id ? 'Salvar' : 'Criar'"), true);
assert.equal(modalSource.includes('setSaveIntent'), false);
assert.equal(modalSource.includes('getSaveActionColor'), false);
assert.equal(modalSource.includes('saveActionColor'), false);

const hookSource = readFileSync(
  resolve('src/components/organisms/modals/ModalAddGHO/hooks/useAddGho.ts'),
  'utf8',
);
assert.equal(hookSource.includes('preventDiscardIf'), true);
assert.equal(hookSource.includes('isGhoEditorDirty'), true);
assert.equal(hookSource.includes('applyStay'), true);

console.log('gho-save-intent.util.spec.ts ok');
