/**
 * Runnable with:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/documentModel/editor-v2/integration/document-editor-v2-integration.spec.ts
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';

import {
  featureFlags,
  isDocumentEditorV2Enabled,
} from '@v2/constants/feature-flags';
import { persistJson, toDocumentEditorState } from '../adapter';
import { buildPocCanonicalModel } from '../adapter/fixtures/poc-canonical.fixture';
import { buildDefinitionsExcerptModel } from '../adapter/fixtures/poc-canonical.fixture';
import { LARGE_RUN_PARAGRAPH_COUNT } from '../tiptap/fixtures/large-run.fixture';
import { buildLargeDefinitionsRunModel } from '../tiptap/fixtures/large-run.fixture';
import { toTipTapState } from '../tiptap/to-tiptap-state';
import { formatAtomPlaceholder } from './atom-placeholder-label';
import { allowDocumentEditorV2Transaction } from './document-editor-v2-guards';
import {
  collectTipTapNodeIds,
  createSectionTreeNode,
  projectSelectedContentToDocumentData,
  summarizeEditorProjection,
} from './document-editor-v2-projection';
import {
  canLeaveV2WithoutProtection,
  isEditorSwitchVisible,
  requestSurfaceChange,
  resolvePinnedSelection,
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

const catalogSections = {};

run('1. flag off → V1 intacto', () => {
  assert.equal(isDocumentEditorV2Enabled(undefined), false);
  assert.equal(isDocumentEditorV2Enabled(null), false);
  assert.equal(isDocumentEditorV2Enabled('false'), false);
  assert.equal(isDocumentEditorV2Enabled('true'), true);
  assert.equal(featureFlags.documentEditorV2, false);
  assert.equal(
    resolveVisibleSurface({ flagEnabled: false, surface: 'v2' }),
    'v1',
  );
  assert.equal(isEditorSwitchVisible(false), false);

  const content = readRel(
    '../../DocumentModelContent/DocumentModelContent.tsx',
  );
  assert.equal(content.includes('TypeSectionItem'), true);
  assert.equal(content.includes('DocumentModelEditorBoundary'), true);
  assert.equal(content.includes('v1='), true);

  const flags = fs.readFileSync(
    path.join(__dirname, '../../../../../@v2/constants/feature-flags.ts'),
    'utf8',
  );
  assert.equal(flags.includes('NEXT_PUBLIC_FEATURE_DOCUMENT_EDITOR_V2'), true);
  assert.equal(flags.includes("value === 'true'"), true);
});

run('2. flag on → switch disponível', () => {
  assert.equal(isEditorSwitchVisible(true), true);
  assert.equal(
    resolveVisibleSurface({ flagEnabled: true, surface: 'v2' }),
    'v2',
  );
  const boundary = readRel('./DocumentModelEditorBoundary.tsx');
  assert.equal(boundary.includes('Clássico'), true);
  assert.equal(boundary.includes('V2 experimental'), true);
});

run('3. V2 lê a mesma SECTION da árvore', () => {
  const model = buildPocCanonicalModel();
  const selected = createSectionTreeNode('section-body');
  const projected = projectSelectedContentToDocumentData(
    model,
    catalogSections,
    selected,
  );
  assert.ok(projected);
  assert.deepStrictEqual(
    projected!.sections[0].data.map((section) => section.id),
    ['section-body'],
  );
  assert.ok(projected!.sections[0].children?.['section-body']);
  assert.equal(
    projected!.sections[0].children?.['section-body']?.[0]?.id,
    'el-h2',
  );
});

run('4. runs agrupados corretamente', () => {
  const model = buildPocCanonicalModel();
  const projected = projectSelectedContentToDocumentData(
    model,
    catalogSections,
    createSectionTreeNode('section-body'),
  );
  const summary = summarizeEditorProjection(toDocumentEditorState(projected!));
  assert.deepStrictEqual(summary.textRuns[0], ['el-p-a', 'el-p-b', 'el-p-c']);
  assert.deepStrictEqual(summary.textRuns[1], ['el-p-d']);
  assert.deepStrictEqual(summary.textRuns[2], ['el-p-e']);
  assert.deepStrictEqual(summary.textRuns[3], ['el-p-f']);

  const definitions = projectSelectedContentToDocumentData(
    buildDefinitionsExcerptModel(),
    catalogSections,
    createSectionTreeNode('section-definitions'),
  );
  const defSummary = summarizeEditorProjection(
    toDocumentEditorState(definitions!),
  );
  assert.equal(defSummary.textRuns.length, 1);
  assert.equal(defSummary.textRuns[0].length, 8);
});

run('5. headings são boundaries', () => {
  const projected = projectSelectedContentToDocumentData(
    buildPocCanonicalModel(),
    catalogSections,
    createSectionTreeNode('section-body'),
  );
  const summary = summarizeEditorProjection(toDocumentEditorState(projected!));
  assert.deepStrictEqual(summary.headings, [{ id: 'el-h2', type: 'H2' }]);
});

run('6. atoms são boundaries', () => {
  const projected = projectSelectedContentToDocumentData(
    buildPocCanonicalModel(),
    catalogSections,
    createSectionTreeNode('section-body'),
  );
  const summary = summarizeEditorProjection(toDocumentEditorState(projected!));
  assert.deepStrictEqual(
    summary.atoms.map((atom) => atom.type),
    ['BULLET', 'IMAGE', 'SECTION_BREAK'],
  );
  assert.equal(formatAtomPlaceholder('IMAGE'), 'IMAGEM');
  assert.equal(formatAtomPlaceholder('BREAK'), 'QUEBRA DE PÁGINA');
  assert.equal(
    formatAtomPlaceholder('SECTION_BREAK', { orientation: 'portrait' }),
    'QUEBRA DE SEÇÃO — RETRATO',
  );
  assert.equal(formatAtomPlaceholder('APR_TABLE'), 'INVENTÁRIO DE RISCOS');
  assert.equal(formatAtomPlaceholder('PLAN_TABLE'), 'PLANO DE AÇÃO');
  assert.equal(formatAtomPlaceholder('TABLE_GSE'), 'TABLE_GSE');
});

run('7. atom desconhecido permanece visível', () => {
  const model = persistJson(buildPocCanonicalModel());
  model.sections[0].children!['section-body'].push({
    id: 'el-unknown',
    type: 'WORKSPACE_BLOCK',
    text: '',
  });
  const projected = projectSelectedContentToDocumentData(
    model,
    catalogSections,
    createSectionTreeNode('section-body'),
  );
  const summary = summarizeEditorProjection(toDocumentEditorState(projected!));
  assert.ok(summary.atoms.some((atom) => atom.type === 'WORKSPACE_BLOCK'));
  assert.equal(
    formatAtomPlaceholder('WORKSPACE_BLOCK'),
    'ELEMENTO NÃO SUPORTADO: WORKSPACE_BLOCK',
  );
});

run('8. edição local não altera o modelo Redux/canônico', () => {
  const model = buildPocCanonicalModel();
  const snapshot = persistJson(model);
  const projected = projectSelectedContentToDocumentData(
    model,
    catalogSections,
    createSectionTreeNode('section-body'),
  );
  projected!.sections[0].children!['section-body'][1].text = 'editado só no V2';

  assert.deepStrictEqual(persistJson(model), snapshot);

  const integrationDir = fs.readdirSync(__dirname);
  integrationDir.forEach((file) => {
    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;
    if (file.endsWith('.spec.ts')) return;
    const source = readRel(`./${file}`);
    assert.equal(source.includes('setDocumentEditElementChild'), false, file);
    assert.equal(source.includes('setDocumentModel('), false, file);
    assert.equal(source.includes('needSynchronization = true'), false, file);
  });
});

run('9. edição local não marca document dirty', () => {
  assert.equal(
    shouldBlockOfficialSave({ surface: 'v2', v2LocalDirty: true }),
    true,
  );
  const sessionState = {
    v2LocalDirty: true,
    needSynchronization: false,
  };
  assert.equal(sessionState.needSynchronization, false);

  const dirtyHelper = fs.readFileSync(
    path.join(
      __dirname,
      '../../../modals/ModalEditDocumentModel/helpers/document-model-dirty.ts',
    ),
    'utf8',
  );
  assert.equal(dirtyHelper.includes('v2LocalDirty'), false);
});

run('10. troca de SECTION com v2LocalDirty protegida', () => {
  const pinned = resolvePinnedSelection({
    selectedItem: createSectionTreeNode('section-other'),
    pinnedItem: createSectionTreeNode('section-body'),
    v2LocalDirty: true,
    surface: 'v2',
  });
  assert.equal(pinned.renderItem?.id, 'section-body');
  assert.equal(pinned.blockedSectionSwitch, true);
  assert.equal(
    requestSurfaceChange({
      current: 'v2',
      next: 'v1',
      v2LocalDirty: true,
    }).allowed,
    false,
  );
});

run('11. voltar V1 sem dirty funciona', () => {
  assert.equal(canLeaveV2WithoutProtection(false), true);
  assert.equal(
    requestSurfaceChange({
      current: 'v2',
      next: 'v1',
      v2LocalDirty: false,
    }).allowed,
    true,
  );
  const clean = resolvePinnedSelection({
    selectedItem: createSectionTreeNode('section-other'),
    pinnedItem: createSectionTreeNode('section-body'),
    v2LocalDirty: false,
    surface: 'v2',
  });
  assert.equal(clean.renderItem?.id, 'section-other');
  assert.equal(clean.blockedSectionSwitch, false);
});

run('12. run grande renderiza', () => {
  const model = buildLargeDefinitionsRunModel();
  const projected = projectSelectedContentToDocumentData(
    model,
    catalogSections,
    createSectionTreeNode('section-large-run'),
  );
  const state = toDocumentEditorState(projected!);
  const summary = summarizeEditorProjection(state);
  assert.equal(summary.textRuns[0].length, LARGE_RUN_PARAGRAPH_COUNT);
  assert.equal(summary.headings[0].id, 'el-large-h1');
  assert.equal(summary.atoms[0].type, 'TABLE_GSE');

  const json = toTipTapState(state);
  assert.equal(
    collectTipTapNodeIds(json, 'docParagraph').length,
    LARGE_RUN_PARAGRAPH_COUNT + 1,
  );
  assert.equal(collectTipTapNodeIds(json, 'docHeading').length, 1);
  assert.equal(collectTipTapNodeIds(json, 'docAtom').length, 1);
});

run('proteção: atom/heading não podem sumir na transação V2', () => {
  const before = {
    descendants(fn: (node: any) => void) {
      fn({ type: { name: 'docAtom' }, attrs: { id: 'el-image' } });
      fn({ type: { name: 'docHeading' }, attrs: { id: 'el-h2' } });
    },
  };
  const deletedAtom = {
    descendants(fn: (node: any) => void) {
      fn({ type: { name: 'docHeading' }, attrs: { id: 'el-h2' } });
    },
  };
  assert.equal(
    allowDocumentEditorV2Transaction(
      { docChanged: true, doc: deletedAtom },
      { doc: before },
    ),
    false,
  );
  assert.equal(
    allowDocumentEditorV2Transaction(
      { docChanged: true, doc: before },
      { doc: before },
    ),
    true,
  );
});

run('save oficial bloqueado no fluxo do modal', () => {
  const editHook = fs.readFileSync(
    path.join(
      __dirname,
      '../../../modals/ModalEditDocumentModel/hooks/useEditDocumentModel.tsx',
    ),
    'utf8',
  );
  const viewHook = fs.readFileSync(
    path.join(
      __dirname,
      '../../../modals/ModalEditDocumentModel/components/2-viewDocumentModelStep/hooks/useViewDocumentModel.ts',
    ),
    'utf8',
  );
  const topButtons = fs.readFileSync(
    path.join(
      __dirname,
      '../../../modals/ModalEditDocumentModel/components/2-viewDocumentModelStep/components/TopButtons/TopButtons.tsx',
    ),
    'utf8',
  );

  assert.equal(editHook.includes('shouldBlockOfficialSave'), true);
  assert.equal(editHook.includes('v2Session.v2LocalDirty'), true);
  assert.equal(viewHook.includes('shouldBlockOfficialSave'), true);
  assert.equal(topButtons.includes('officialSaveBlocked'), true);
  assert.equal(editHook.includes('fromTipTapState'), false);
  assert.equal(viewHook.includes('fromTipTapState'), false);
});

console.log('\nFase 2 integration specs: ok');
