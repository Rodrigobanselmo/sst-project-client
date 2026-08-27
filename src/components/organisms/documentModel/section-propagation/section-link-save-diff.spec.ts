/**
 * Runnable with:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/documentModel/section-propagation/section-link-save-diff.spec.ts
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';

import { IDocumentModelData } from 'core/interfaces/api/IDocumentModel';

import {
  diffChangedHeadingWindows,
  listHeadingWindowFingerprints,
  resolveAfterSaveQueueAdvance,
} from './section-link-save-diff';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

function model(p1 = 'oficial', extra: Array<{ id: string; type: string; text: string }> = []): IDocumentModelData {
  return {
    variables: [] as any,
    sections: [
      {
        data: [{ id: 'sec', type: 'SECTION' }],
        children: {
          sec: [
            { id: 'hx', type: 'H3', text: 'Seção X' },
            { id: 'px', type: 'PARAGRAPH', text: p1 },
            { id: 'hy', type: 'H3', text: 'Seção Y' },
            { id: 'py', type: 'PARAGRAPH', text: 'y' },
            ...extra,
          ],
        },
      },
    ],
  };
}

run('alterar X muda só o fingerprint de X', () => {
  const before = listHeadingWindowFingerprints(model('oficial'));
  const after = listHeadingWindowFingerprints(model('novo'));
  const changed = diffChangedHeadingWindows(before, after);
  assert.deepEqual(
    changed.map((item) => item.headingId),
    ['hx'],
  );
});

run('alterar outra parte com X selecionável não marca X', () => {
  const before = listHeadingWindowFingerprints(model('oficial'));
  const next = model('oficial');
  next.sections[0].children!.sec[3].text = 'y mudou';
  const changed = diffChangedHeadingWindows(before, listHeadingWindowFingerprints(next));
  assert.deepEqual(
    changed.map((item) => item.headingId),
    ['hy'],
  );
});

run('save sem alteração da janela → zero', () => {
  const before = listHeadingWindowFingerprints(model('oficial'));
  const after = listHeadingWindowFingerprints(model('oficial'));
  assert.equal(diffChangedHeadingWindows(before, after).length, 0);
});

run('X e Y alteradas são ambas lembradas', () => {
  const before = listHeadingWindowFingerprints(model('oficial'));
  const next = model('oficial');
  next.sections[0].children!.sec[1].text = 'x novo';
  next.sections[0].children!.sec[3].text = 'y novo';
  const changed = diffChangedHeadingWindows(before, listHeadingWindowFingerprints(next));
  assert.deepEqual(
    changed.map((item) => item.headingId).sort(),
    ['hx', 'hy'],
  );
});

run('fila X depois Y: cancelar Analyze de X não apaga Y', () => {
  const afterX = resolveAfterSaveQueueAdvance({ queueLength: 2, currentIndex: 0 });
  assert.equal(afterX.done, false);
  assert.equal(afterX.nextIndex, 1);
  const afterY = resolveAfterSaveQueueAdvance({ queueLength: 2, currentIndex: 1 });
  assert.equal(afterY.done, true);
  const actionSource = fs.readFileSync(
    path.join(__dirname, 'DocumentModelSectionPropagationAction.tsx'),
    'utf8',
  );
  const dialogStart = actionSource.indexOf('<DocumentModelSectionPropagationDialog');
  const closeHandler = actionSource.slice(
    actionSource.indexOf('onClose={() => {', dialogStart),
    actionSource.indexOf('<DocumentModelSectionLinkManageDialog'),
  );
  assert.equal(closeHandler.includes('fromQueue'), true);
  assert.equal(closeHandler.includes('advanceQueue()'), true);
  assert.equal(closeHandler.includes('finishQueue()'), false);
});

run('Save/Exit só fecha depois da fila inteira', () => {
  const viewSource = fs.readFileSync(
    path.join(
      __dirname,
      '../../modals/ModalEditDocumentModel/components/2-viewDocumentModelStep/hooks/useViewDocumentModel.ts',
    ),
    'utf8',
  );
  assert.equal(viewSource.includes('pendingExitRef'), true);
  assert.equal(viewSource.includes('onLinkedSaveSettled'), true);
  const actionSource = fs.readFileSync(
    path.join(__dirname, 'DocumentModelSectionPropagationAction.tsx'),
    'utf8',
  );
  assert.equal(actionSource.includes('finishQueue'), true);
  assert.equal(actionSource.includes('onLinkedSaveSettled?.()'), true);
});

run('contentSync de UX passa o DocumentModel aberto, sem master acidental', () => {
  const mutSource = fs.readFileSync(
    path.join(
      __dirname,
      '../../../../core/services/hooks/mutations/manager/document-model/useMutDocumentModelSectionLinks/useMutDocumentModelSectionLinks.ts',
    ),
    'utf8',
  );
  assert.equal(mutSource.includes('/${data.id}/section-links'), true);
  assert.equal(mutSource.includes('relativeToModelId: data.relativeToModelId'), true);
  const manageSource = fs.readFileSync(
    path.join(__dirname, 'DocumentModelSectionLinkManageDialog.tsx'),
    'utf8',
  );
  assert.equal(manageSource.includes('id: modelId'), true);
  assert.equal(manageSource.includes('relativeToModelId: modelId'), true);
  const actionSource = fs.readFileSync(
    path.join(__dirname, 'DocumentModelSectionPropagationAction.tsx'),
    'utf8',
  );
  assert.equal(actionSource.includes('relativeToModelId: modelId'), true);
  assert.equal(actionSource.includes('masterDocumentId'), false);
  assert.equal(mutSource.includes('masterDocumentId'), false);
});

run('view save/exit espera decisão e não fecha na hora', () => {
  const viewSource = fs.readFileSync(
    path.join(
      __dirname,
      '../../modals/ModalEditDocumentModel/components/2-viewDocumentModelStep/hooks/useViewDocumentModel.ts',
    ),
    'utf8',
  );
  assert.equal(viewSource.includes('diffChangedHeadingWindows'), true);
  assert.equal(viewSource.includes('linkedSaveEvent'), true);
  assert.equal(viewSource.includes("if (ok && intent === 'exit')"), true);
  assert.equal(viewSource.includes('onLinkedSaveSettled'), true);
  const persistSource = fs.readFileSync(
    path.join(
      __dirname,
      '../../modals/ModalEditDocumentModel/hooks/useEditDocumentModel.tsx',
    ),
    'utf8',
  );
  assert.equal(persistSource.includes('useMutApplySectionPropagation'), false);
});

console.log('section-link-save-diff ok');
