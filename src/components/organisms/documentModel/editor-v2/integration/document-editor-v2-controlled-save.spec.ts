/**
 * Fase 5B — persistência controlada (flag SAVE, planner, staging PATCH→Redux).
 *
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/documentModel/editor-v2/integration/document-editor-v2-controlled-save.spec.ts
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';

import { getSchema } from '@tiptap/core';
import { Node } from '@tiptap/pm/model';
import { EditorState, TextSelection } from '@tiptap/pm/state';
import { featureFlags } from '@v2/constants/feature-flags';
import {
  DocModelAlignmentType,
  DocModelPageOrientation,
  IDocumentModelData,
  IDocumentModelElement,
} from 'core/interfaces/api/IDocumentModel';
import {
  DocumentSectionChildrenTypeEnum,
  DocumentSectionTypeEnum,
  InlineStyleTypeEnum,
} from 'project/enum/document-model.enum';

import { persistJson, toDocumentEditorState } from '../adapter';
import { applyBlockFormatConversion, applyBulletLevelSet } from '../tiptap/apply-block-format';
import { applyBlockAlign, applyInlineStyle } from '../tiptap/apply-text-format';
import { createDocumentEditorExtensions } from '../tiptap/extensions/create-document-editor-extensions';
import { serializeTipTapDoc } from '../tiptap/schema';
import { applyStructuralJoinBackward, applyStructuralSplit } from '../tiptap/structural-join';
import { toTipTapState } from '../tiptap/to-tiptap-state';
import { assertAllowedCanonicalDiff } from '../domain/canonical-diff';
import {
  createElementSelection,
  createSectionSelection,
  projectEditorSlice,
} from '../domain/document-editor-slice';
import {
  rememberCanonicalBackup,
  readCanonicalBackup,
  documentEditorV2BackupKey,
} from './document-editor-v2-backup';
import {
  applyFailedV2Patch,
  applySuccessfulV2Patch,
  applyV2PersistPlanToStage,
  createOfficialPersistStage,
  planDocumentEditorV2Persist,
} from './document-editor-v2-controlled-save';
import {
  createV2SaveGuardSession,
  resolveClassicSwitchAttempt,
  resolveDiscardExperiment,
  resolveOfficialSaveAttempt,
  shouldRebaseOfficialDocument,
} from './document-editor-v2-save-guard';
import {
  requestSurfaceChange,
  resolveOfficialSaveButtonsDisabled,
  resolvePinnedSelection,
  shouldBlockOfficialSave,
} from './document-editor-v2-session';
import { DOCUMENT_EDITOR_V2_STALE_SAVE_REASON } from './document-editor-v2-notices';
import { createSectionTreeNode } from './document-editor-v2-projection';
import { toDocumentEditorSelection } from './document-editor-v2-selection';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

function paragraph(
  id: string,
  text: string,
  extra?: Partial<IDocumentModelElement>,
): IDocumentModelElement {
  return {
    id,
    type: DocumentSectionChildrenTypeEnum.PARAGRAPH,
    text,
    ...extra,
  };
}

function buildTwoSectionModel(body: IDocumentModelElement[]): IDocumentModelData {
  return {
    variables: [
      { type: 'NOME_DA_EMPRESA', label: 'Nome da Empresa' },
      { type: 'KEEP', label: 'Não mexer' },
    ],
    sections: [
      {
        label: 'Grupo A',
        data: [
          {
            id: 'section-body',
            type: DocumentSectionTypeEnum.SECTION,
            hasChildren: true,
            footerText: 'rodapé-oficial',
          },
          { id: 'section-other', type: DocumentSectionTypeEnum.SECTION, hasChildren: true },
        ],
        children: {
          'section-body': body,
          'section-other': [
            paragraph('el-other', 'Outra section', { removeWithAllValidVars: ['KEEP'] }),
          ],
        },
      },
    ],
  };
}

function headingWindowModel(): IDocumentModelData {
  return buildTwoSectionModel([
    paragraph('el-a', 'Prefixo A', {
      removeWithSomeEmptyVars: ['A'],
      addWithAllVars: ['X'],
    }),
    { id: 'el-h2-b', type: DocumentSectionChildrenTypeEnum.H2, text: 'Heading B' },
    paragraph('el-b1', 'Dentro de B'),
    paragraph('el-b2', 'Empresa ??NOME_DA_EMPRESA??'),
    { id: 'el-h2-c', type: DocumentSectionChildrenTypeEnum.H2, text: 'Heading C' },
    paragraph('el-c1', 'Sufixo C'),
  ]);
}

const schema = getSchema(createDocumentEditorExtensions());

function tipTapFromModel(model: IDocumentModelData) {
  return serializeTipTapDoc(toTipTapState(toDocumentEditorState(model)));
}

function stateFromModel(model: IDocumentModelData): EditorState {
  return EditorState.create({
    schema,
    doc: Node.fromJSON(schema, tipTapFromModel(model)),
  });
}

function findBlockPos(doc: Node, id: string) {
  let pos = -1;
  doc.descendants((node, nodePos) => {
    if (
      ['docParagraph', 'docBullet', 'docHeading', 'docCaption', 'docAtom'].includes(
        node.type.name,
      ) &&
      node.attrs.id === id
    ) {
      pos = nodePos;
      return false;
    }
  });
  if (pos < 0) throw new Error(`block ${id} not found`);
  return pos;
}

function setCursor(state: EditorState, id: string, offset: number) {
  return state.apply(
    state.tr.setSelection(TextSelection.create(state.doc, findBlockPos(state.doc, id) + 1 + offset)),
  );
}

function setRange(state: EditorState, id: string, from: number, to: number) {
  const pos = findBlockPos(state.doc, id);
  return state.apply(
    state.tr.setSelection(TextSelection.create(state.doc, pos + 1 + from, pos + 1 + to)),
  );
}

function planFromState(
  original: IDocumentModelData,
  state: EditorState,
  extras: {
    selected?: ReturnType<typeof createSectionSelection>;
    saveEnabled?: boolean;
    dirty?: boolean;
  } = {},
) {
  const selected = extras.selected || createSectionSelection('section-body');
  return planDocumentEditorV2Persist({
    surface: 'v2',
    saveEnabled: extras.saveEnabled ?? true,
    v2LocalDirty: extras.dirty ?? true,
    originalModel: original,
    selectedItem: selected,
    baselineProjection: projectEditorSlice(original, selected),
    tipTapDoc: state.doc.toJSON(),
  });
}

function persistSuccess(
  original: IDocumentModelData,
  state: EditorState,
  intent: 'stay' | 'exit' = 'stay',
) {
  const selected = createSectionSelection('section-body');
  const plan = planFromState(original, state, { selected });
  assert.equal(plan.type === 'patch' || plan.type === 'no-op', true, JSON.stringify(plan));
  const stage = createOfficialPersistStage(original, {
    v2LocalDirty: true,
    baseline: projectEditorSlice(original, selected),
  });
  if (plan.type === 'no-op') {
    return { plan, stage: applyV2PersistPlanToStage(stage, plan, intent) };
  }
  if (plan.type !== 'patch') throw new Error('expected patch');
  const afterPlan = applyV2PersistPlanToStage(stage, plan, intent);
  return {
    plan,
    stage: applySuccessfulV2Patch(afterPlan, plan.candidate, plan.built, intent),
  };
}

function bodyOf(model: IDocumentModelData) {
  return model.sections[0].children!['section-body'];
}

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    map,
  };
}

run('1. SAVE flag default off', () => {
  assert.equal(featureFlags.documentEditorV2Save, false);
  const flags = fs.readFileSync(
    path.join(__dirname, '../../../../../@v2/constants/feature-flags.ts'),
    'utf8',
  );
  assert.equal(flags.includes('NEXT_PUBLIC_FEATURE_DOCUMENT_EDITOR_V2_SAVE'), true);
  assert.equal(flags.includes("value === 'true'"), true);
});

run('2. surface on + save off bloqueia', () => {
  const dirty = createV2SaveGuardSession({ surface: 'v2', v2LocalDirty: true });
  assert.equal(shouldBlockOfficialSave(dirty), true);
  assert.equal(resolveOfficialSaveAttempt(dirty, 'stay').persist, false);
  assert.equal(resolveOfficialSaveAttempt(dirty, 'exit').close, false);
});

run('3. surface on + save on libera persist', () => {
  const dirty = createV2SaveGuardSession({
    surface: 'v2',
    v2LocalDirty: true,
    saveEnabled: true,
  });
  const stay = resolveOfficialSaveAttempt(dirty, 'stay');
  assert.equal(shouldBlockOfficialSave(dirty), false);
  assert.equal(stay.persist, true);
  assert.equal(stay.close, false);
  assert.equal(resolveOfficialSaveAttempt(dirty, 'exit').close, true);
});

run('4. candidate válido', () => {
  const original = headingWindowModel();
  let state = stateFromModel(projectEditorSlice(original, createSectionSelection('section-body')));
  state = setCursor(state, 'el-b1', 0);
  state = applyBlockFormatConversion(state, 'BULLET').state;
  const plan = planFromState(original, state);
  assert.equal(plan.type, 'patch');
  if (plan.type !== 'patch') return;
  assert.equal(plan.built.validation.ok, true);
});

run('5. candidate inválido', () => {
  const original = buildTwoSectionModel([
    paragraph('el-a', 'A'),
    {
      id: 'el-sb',
      type: DocumentSectionChildrenTypeEnum.SECTION_BREAK,
      text: '',
      orientation: 'diagonal' as never,
    },
  ]);
  const selected = createSectionSelection('section-body');
  const plan = planDocumentEditorV2Persist({
    surface: 'v2',
    saveEnabled: true,
    v2LocalDirty: true,
    originalModel: original,
    selectedItem: selected,
    baselineProjection: projectEditorSlice(original, selected),
    tipTapDoc: tipTapFromModel(projectEditorSlice(original, selected)),
  });
  assert.equal(plan.type, 'abort');
  if (plan.type === 'abort') assert.equal(plan.kind, 'validation');
});

run('6. stale candidate', () => {
  const original = headingWindowModel();
  const selected = createElementSelection('el-h2-b', 'H2', 'section-body');
  const baseline = projectEditorSlice(original, selected);
  const mutated = persistJson(original);
  mutated.sections[0].children!['section-body'] = bodyOf(mutated).filter(
    (item) => item.id !== 'el-h2-b',
  );
  const plan = planDocumentEditorV2Persist({
    surface: 'v2',
    saveEnabled: true,
    v2LocalDirty: true,
    originalModel: mutated,
    selectedItem: selected,
    baselineProjection: baseline,
    tipTapDoc: tipTapFromModel(baseline),
  });
  assert.equal(plan.type, 'abort');
  if (plan.type === 'abort') {
    assert.equal(plan.kind, 'stale');
    assert.equal(plan.message, DOCUMENT_EDITOR_V2_STALE_SAVE_REASON);
  }
});

run('7. no-op diff', () => {
  const original = headingWindowModel();
  const selected = createSectionSelection('section-body');
  const plan = planDocumentEditorV2Persist({
    surface: 'v2',
    saveEnabled: true,
    v2LocalDirty: true,
    originalModel: original,
    selectedItem: selected,
    baselineProjection: projectEditorSlice(original, selected),
    tipTapDoc: tipTapFromModel(projectEditorSlice(original, selected)),
  });
  assert.equal(plan.type, 'no-op');
});

run('8–14. mutation success/failure staging', () => {
  const original = headingWindowModel();
  let state = stateFromModel(projectEditorSlice(original, createSectionSelection('section-body')));
  state = setCursor(state, 'el-b1', 11);
  state.doc.descendants((node) => {
    if (node.attrs?.id === 'el-b1') {
      // keep walk
    }
  });
  const selected = createSectionSelection('section-body');
  const edited = persistJson(projectEditorSlice(original, selected));
  edited.sections[0].children!['section-body'][2].text = 'Dentro de B editado';
  const plan = planDocumentEditorV2Persist({
    surface: 'v2',
    saveEnabled: true,
    v2LocalDirty: true,
    originalModel: original,
    selectedItem: selected,
    baselineProjection: projectEditorSlice(original, selected),
    tipTapDoc: tipTapFromModel(edited),
  });
  assert.equal(plan.type, 'patch');
  if (plan.type !== 'patch') return;

  const before = createOfficialPersistStage(original, {
    v2LocalDirty: true,
    baseline: projectEditorSlice(original, selected),
  });
  const planned = applyV2PersistPlanToStage(before, plan);
  assert.equal(planned.reduxModel, original);
  assert.equal(planned.queryDocument, original);
  assert.equal(planned.v2LocalDirty, true);
  assert.equal(planned.backupCreated, true);

  const failed = applyFailedV2Patch(planned);
  assert.equal(failed.reduxModel, original);
  assert.equal(failed.queryDocument, original);
  assert.equal(failed.v2LocalDirty, true);
  assert.equal(failed.patchedPayload, null);
  assert.equal(failed.snackbar, 'error');
  assert.equal(failed.closed, false);

  const ok = applySuccessfulV2Patch(planned, plan.candidate, plan.built, 'stay');
  assert.deepStrictEqual(ok.reduxModel, plan.candidate);
  assert.deepStrictEqual(ok.queryDocument, plan.candidate);
  assert.equal(ok.v2LocalDirty, false);
  assert.equal(ok.needSynchronization, false);
  assert.equal(ok.snackbar, 'success');
  assert.equal(ok.closed, false);
  assert.ok(shouldRebaseOfficialDocument({ v2LocalDirty: ok.v2LocalDirty }));
});

function assertPersistedContent(
  label: string,
  mutate: (state: EditorState) => EditorState,
  assertBody: (candidate: IDocumentModelData, original: IDocumentModelData) => void,
) {
  run(label, () => {
    const original = headingWindowModel();
    const selected = createSectionSelection('section-body');
    let state = stateFromModel(projectEditorSlice(original, selected));
    state = mutate(state);
    const plan = planFromState(original, state, { selected });
    if (plan.type !== 'patch' && plan.type !== 'no-op') {
      throw new Error(`${label}: ${plan.type}`);
    }
    const candidate = plan.candidate;
    assert.equal(
      plan.type === 'no-op' || plan.built.validation.ok,
      true,
    );
    assertBody(candidate, original);
    assert.deepStrictEqual(
      persistJson(candidate.sections[0].children!['section-other']),
      persistJson(original.sections[0].children!['section-other']),
    );
    assert.deepStrictEqual(candidate.variables, original.variables);
  });
}

assertPersistedContent('15. editar texto P', (state) => {
  const pos = findBlockPos(state.doc, 'el-b1');
  return state.apply(state.tr.insertText('X', pos + 1, pos + 1));
}, (candidate, original) => {
  assert.notEqual(bodyOf(candidate)[2].text, bodyOf(original)[2].text);
  assert.deepStrictEqual(bodyOf(candidate)[0], bodyOf(original)[0]);
  assert.deepStrictEqual(bodyOf(candidate)[5], bodyOf(original)[5]);
});

assertPersistedContent('16. split P', (state) => {
  return applyStructuralSplit(setCursor(state, 'el-b1', 7)).state;
}, (candidate, original) => {
  assert.ok(bodyOf(candidate).length > bodyOf(original).length);
  assert.deepStrictEqual(bodyOf(candidate)[0], bodyOf(original)[0]);
});

assertPersistedContent('17. merge P', (state) => {
  return applyStructuralJoinBackward(setCursor(state, 'el-b2', 0)).state;
}, (candidate) => {
  assert.ok(bodyOf(candidate).some((item) => item.id === 'el-h2-c'));
});

assertPersistedContent('18. P→BULLET', (state) => {
  return applyBlockFormatConversion(setCursor(state, 'el-b1', 0), 'BULLET').state;
}, (candidate) => {
  assert.equal(bodyOf(candidate)[2].type, 'BULLET');
});

assertPersistedContent('19. BULLET→P', (state) => {
  const converted = applyBlockFormatConversion(setCursor(state, 'el-b1', 0), 'BULLET').state;
  return applyBlockFormatConversion(setCursor(converted, 'el-b1', 0), 'PARAGRAPH').state;
}, (candidate) => {
  assert.equal(bodyOf(candidate)[2].type, 'PARAGRAPH');
});

assertPersistedContent('20. P→H2', (state) => {
  return applyBlockFormatConversion(setCursor(state, 'el-b1', 0), 'H2').state;
}, (candidate) => {
  assert.equal(bodyOf(candidate)[2].type, 'H2');
});

assertPersistedContent('21. H2→H3', (state) => {
  return applyBlockFormatConversion(setCursor(state, 'el-h2-b', 0), 'H3').state;
}, (candidate) => {
  assert.equal(bodyOf(candidate)[1].type, 'H3');
});

run('22. bullet level', () => {
  const original = buildTwoSectionModel([
    paragraph('el-a', 'A'),
    { id: 'el-b', type: DocumentSectionChildrenTypeEnum.BULLET, text: 'Item', level: 0 },
    paragraph('el-c', 'C'),
  ]);
  const selected = createSectionSelection('section-body');
  let state = stateFromModel(projectEditorSlice(original, selected));
  state = applyBulletLevelSet(setCursor(state, 'el-b', 0), 2).state;
  const plan = planFromState(original, state, { selected });
  assert.equal(plan.type, 'patch');
  if (plan.type !== 'patch') return;
  assert.equal(bodyOf(plan.candidate)[1].level, 2);
});

run('23. BULLET_SPACE untouched', () => {
  const original = buildTwoSectionModel([
    paragraph('el-a', 'A'),
    { id: 'el-space', type: DocumentSectionChildrenTypeEnum.BULLET_SPACE, text: 'Espaço' },
    paragraph('el-c', 'C'),
  ]);
  const selected = createSectionSelection('section-body');
  const plan = planDocumentEditorV2Persist({
    surface: 'v2',
    saveEnabled: true,
    v2LocalDirty: true,
    originalModel: original,
    selectedItem: selected,
    baselineProjection: projectEditorSlice(original, selected),
    tipTapDoc: tipTapFromModel(projectEditorSlice(original, selected)),
  });
  assert.equal(plan.type, 'no-op');
  if (plan.type !== 'no-op') return;
  assert.equal(bodyOf(plan.candidate)[1].type, 'BULLET_SPACE');
});

run('24. variable untouched', () => {
  const original = headingWindowModel();
  const selected = createSectionSelection('section-body');
  const plan = planDocumentEditorV2Persist({
    surface: 'v2',
    saveEnabled: true,
    v2LocalDirty: false,
    originalModel: original,
    selectedItem: selected,
    baselineProjection: projectEditorSlice(original, selected),
    tipTapDoc: tipTapFromModel(projectEditorSlice(original, selected)),
  });
  assert.equal(plan.type, 'no-op');
  if (plan.type !== 'no-op') return;
  assert.equal(bodyOf(plan.candidate)[3].text, 'Empresa ??NOME_DA_EMPRESA??');
});

run('25. variable deleted', () => {
  const original = headingWindowModel();
  const selected = createSectionSelection('section-body');
  const edited = persistJson(projectEditorSlice(original, selected));
  edited.sections[0].children!['section-body'][3].text = 'Empresa ';
  const plan = planDocumentEditorV2Persist({
    surface: 'v2',
    saveEnabled: true,
    v2LocalDirty: true,
    originalModel: original,
    selectedItem: selected,
    baselineProjection: projectEditorSlice(original, selected),
    tipTapDoc: tipTapFromModel(edited),
  });
  assert.equal(plan.type, 'patch');
  if (plan.type !== 'patch') return;
  assertAllowedCanonicalDiff(original, plan.candidate, [
    'sections/0/children/section-body/[el-b2]/text',
  ]);
});

run('26. formatting inline', () => {
  const original = headingWindowModel();
  const selected = createSectionSelection('section-body');
  let state = stateFromModel(projectEditorSlice(original, selected));
  state = applyInlineStyle(setRange(state, 'el-a', 0, 7), InlineStyleTypeEnum.BOLD).state;
  const plan = planFromState(original, state, { selected });
  assert.equal(plan.type, 'patch');
  if (plan.type !== 'patch') return;
  assert.equal(bodyOf(plan.candidate)[0].inlineStyleRangeBlock?.[0][0].style, 'BOLD');
});

run('27. formatting block', () => {
  const original = headingWindowModel();
  const selected = createSectionSelection('section-body');
  let state = stateFromModel(projectEditorSlice(original, selected));
  state = applyBlockAlign(setCursor(state, 'el-a', 0), DocModelAlignmentType.CENTER).state;
  const plan = planFromState(original, state, { selected });
  assert.equal(plan.type, 'patch');
  if (plan.type !== 'patch') return;
  assert.equal(bodyOf(plan.candidate)[0].align, DocModelAlignmentType.CENTER);
});

run('28. caption', () => {
  const original = buildTwoSectionModel([
    paragraph('el-a', 'A'),
    { id: 'el-cap', type: DocumentSectionChildrenTypeEnum.PARAGRAPH_TABLE, text: 'Tabela 1' },
    paragraph('el-c', 'C'),
  ]);
  const selected = createSectionSelection('section-body');
  const edited = persistJson(projectEditorSlice(original, selected));
  edited.sections[0].children!['section-body'][1].text = 'Tabela 1 — nova';
  const plan = planDocumentEditorV2Persist({
    surface: 'v2',
    saveEnabled: true,
    v2LocalDirty: true,
    originalModel: original,
    selectedItem: selected,
    baselineProjection: projectEditorSlice(original, selected),
    tipTapDoc: tipTapFromModel(edited),
  });
  assert.equal(plan.type, 'patch');
  if (plan.type !== 'patch') return;
  assert.equal(bodyOf(plan.candidate)[1].text, 'Tabela 1 — nova');
  assert.deepStrictEqual(bodyOf(plan.candidate)[0], bodyOf(original)[0]);
});

run('29–32. atoms vizinhos intactos', () => {
  const original = buildTwoSectionModel([
    paragraph('el-a', 'A'),
    { id: 'el-image', type: DocumentSectionChildrenTypeEnum.IMAGE, text: '', url: '/x.png', width: 80 },
    { id: 'el-break', type: DocumentSectionChildrenTypeEnum.BREAK, text: '' },
    {
      id: 'el-sb',
      type: DocumentSectionChildrenTypeEnum.SECTION_BREAK,
      text: '',
      orientation: DocModelPageOrientation.LANDSCAPE,
    },
    { id: 'el-future', type: 'FUTURE_UNKNOWN_TYPE', text: '', url: '/keep' },
    paragraph('el-c', 'C'),
  ]);
  const selected = createSectionSelection('section-body');
  const edited = persistJson(projectEditorSlice(original, selected));
  edited.sections[0].children!['section-body'][0].text = 'A2';
  const plan = planDocumentEditorV2Persist({
    surface: 'v2',
    saveEnabled: true,
    v2LocalDirty: true,
    originalModel: original,
    selectedItem: selected,
    baselineProjection: projectEditorSlice(original, selected),
    tipTapDoc: tipTapFromModel(edited),
  });
  assert.equal(plan.type, 'patch');
  if (plan.type !== 'patch') return;
  assert.equal(bodyOf(plan.candidate)[1].url, '/x.png');
  assert.equal(bodyOf(plan.candidate)[2].type, 'BREAK');
  assert.equal(bodyOf(plan.candidate)[3].orientation, 'landscape');
  assert.equal(bodyOf(plan.candidate)[4].type, 'FUTURE_UNKNOWN_TYPE');
});

run('33–36. attrs / other section / ids / variables', () => {
  const original = headingWindowModel();
  const selected = createSectionSelection('section-body');
  const edited = persistJson(projectEditorSlice(original, selected));
  edited.sections[0].children!['section-body'][2].text = 'mudou';
  const plan = planDocumentEditorV2Persist({
    surface: 'v2',
    saveEnabled: true,
    v2LocalDirty: true,
    originalModel: original,
    selectedItem: selected,
    baselineProjection: projectEditorSlice(original, selected),
    tipTapDoc: tipTapFromModel(edited),
  });
  assert.equal(plan.type, 'patch');
  if (plan.type !== 'patch') return;
  assert.deepStrictEqual(bodyOf(plan.candidate)[0].removeWithSomeEmptyVars, ['A']);
  assert.equal(plan.candidate.sections[0].data[0].footerText, 'rodapé-oficial');
  assert.deepStrictEqual(
    persistJson(plan.candidate.sections[0].children!['section-other']),
    persistJson(original.sections[0].children!['section-other']),
  );
  assert.ok(bodyOf(plan.candidate).every((item, index) => item.id === bodyOf(original)[index].id));
  assert.deepStrictEqual(plan.candidate.variables, original.variables);
});

run('37. Save stay sucesso', () => {
  const original = headingWindowModel();
  const selected = createSectionSelection('section-body');
  const edited = persistJson(projectEditorSlice(original, selected));
  edited.sections[0].children!['section-body'][2].text = 'stay';
  const plan = planDocumentEditorV2Persist({
    surface: 'v2',
    saveEnabled: true,
    v2LocalDirty: true,
    originalModel: original,
    selectedItem: selected,
    baselineProjection: projectEditorSlice(original, selected),
    tipTapDoc: tipTapFromModel(edited),
  });
  if (plan.type !== 'patch') throw new Error('expected patch');
  const stage = applySuccessfulV2Patch(
    createOfficialPersistStage(original, { v2LocalDirty: true }),
    plan.candidate,
    plan.built,
    'stay',
  );
  assert.equal(stage.closed, false);
  assert.equal(stage.v2LocalDirty, false);
  assert.equal(stage.snackbar, 'success');
});

run('38. Save stay erro', () => {
  const original = headingWindowModel();
  const failed = applyFailedV2Patch(
    createOfficialPersistStage(original, { v2LocalDirty: true }),
  );
  assert.equal(failed.closed, false);
  assert.equal(failed.v2LocalDirty, true);
  assert.equal(failed.snackbar, 'error');
  assert.equal(failed.reduxModel, original);
});

run('39. Save exit sucesso', () => {
  const original = headingWindowModel();
  const selected = createSectionSelection('section-body');
  const edited = persistJson(projectEditorSlice(original, selected));
  edited.sections[0].children!['section-body'][2].text = 'exit';
  const plan = planDocumentEditorV2Persist({
    surface: 'v2',
    saveEnabled: true,
    v2LocalDirty: true,
    originalModel: original,
    selectedItem: selected,
    baselineProjection: projectEditorSlice(original, selected),
    tipTapDoc: tipTapFromModel(edited),
  });
  if (plan.type !== 'patch') throw new Error('expected patch');
  const stage = applySuccessfulV2Patch(
    createOfficialPersistStage(original, { v2LocalDirty: true }),
    plan.candidate,
    plan.built,
    'exit',
  );
  assert.equal(stage.closed, true);
  assert.equal(stage.v2LocalDirty, false);
});

run('40. Save exit erro', () => {
  const failed = applyFailedV2Patch(
    createOfficialPersistStage(headingWindowModel(), { v2LocalDirty: true }),
  );
  assert.equal(failed.closed, false);
  assert.equal(failed.v2LocalDirty, true);
});

run('41. Classic após save', () => {
  const after = createV2SaveGuardSession({
    surface: 'v2',
    v2LocalDirty: false,
    saveEnabled: true,
  });
  assert.equal(resolveClassicSwitchAttempt(after).allowed, true);
});

run('42. Classic antes do save exige descarte', () => {
  const dirty = createV2SaveGuardSession({
    surface: 'v2',
    v2LocalDirty: true,
    saveEnabled: true,
  });
  assert.equal(resolveClassicSwitchAttempt(dirty).allowed, false);
});

run('43. discard antes do save', () => {
  const dirty = createV2SaveGuardSession({ surface: 'v2', v2LocalDirty: true, saveEnabled: true });
  const discarded = resolveDiscardExperiment(dirty);
  assert.equal(discarded.v2LocalDirty, false);
  assert.equal(resolveClassicSwitchAttempt(discarded).allowed, true);
});

run('44. discard após um save retorna ao último baseline', () => {
  const original = headingWindowModel();
  const selected = createSectionSelection('section-body');
  const edited = persistJson(projectEditorSlice(original, selected));
  edited.sections[0].children!['section-body'][2].text = 'salvo';
  const plan = planDocumentEditorV2Persist({
    surface: 'v2',
    saveEnabled: true,
    v2LocalDirty: true,
    originalModel: original,
    selectedItem: selected,
    baselineProjection: projectEditorSlice(original, selected),
    tipTapDoc: tipTapFromModel(edited),
  });
  if (plan.type !== 'patch') throw new Error('expected patch');
  const saved = applySuccessfulV2Patch(
    createOfficialPersistStage(original, { v2LocalDirty: true }),
    plan.candidate,
    plan.built,
  );
  const discarded = resolveDiscardExperiment(
    createV2SaveGuardSession({ surface: 'v2', v2LocalDirty: true, saveEnabled: true }),
  );
  assert.equal(discarded.v2LocalDirty, false);
  assert.equal(bodyOf(saved.reduxModel)[2].text, 'salvo');
});

run('45. trocar section pristine', () => {
  const pinned = resolvePinnedSelection({
    selectedItem: createSectionTreeNode('section-other'),
    pinnedItem: createSectionTreeNode('section-body'),
    v2LocalDirty: false,
    surface: 'v2',
  });
  assert.equal(pinned.renderItem?.id, 'section-other');
  assert.equal(pinned.blockedSectionSwitch, false);
});

run('46. trocar section dirty bloqueia', () => {
  const pinned = resolvePinnedSelection({
    selectedItem: createSectionTreeNode('section-other'),
    pinnedItem: createSectionTreeNode('section-body'),
    v2LocalDirty: true,
    surface: 'v2',
  });
  assert.equal(pinned.renderItem?.id, 'section-body');
  assert.equal(pinned.blockedSectionSwitch, true);
});

run('47. editar após save volta dirty', () => {
  const saved = createV2SaveGuardSession({
    surface: 'v2',
    v2LocalDirty: false,
    saveEnabled: true,
  });
  assert.equal(saved.v2LocalDirty, false);
  const dirtyAgain = { ...saved, v2LocalDirty: true };
  assert.equal(dirtyAgain.v2LocalDirty, true);
  assert.equal(resolveOfficialSaveAttempt(dirtyAgain, 'stay').persist, true);
});

run('48. segundo Save sem mudança → no-op', () => {
  const original = headingWindowModel();
  const selected = createSectionSelection('section-body');
  const edited = persistJson(projectEditorSlice(original, selected));
  edited.sections[0].children!['section-body'][2].text = 'uma vez';
  const first = planDocumentEditorV2Persist({
    surface: 'v2',
    saveEnabled: true,
    v2LocalDirty: true,
    originalModel: original,
    selectedItem: selected,
    baselineProjection: projectEditorSlice(original, selected),
    tipTapDoc: tipTapFromModel(edited),
  });
  if (first.type !== 'patch') throw new Error('expected patch');
  const second = planDocumentEditorV2Persist({
    surface: 'v2',
    saveEnabled: true,
    v2LocalDirty: false,
    originalModel: first.candidate,
    selectedItem: selected,
    baselineProjection: first.built.editedProjected,
    tipTapDoc: tipTapFromModel(first.built.editedProjected),
  });
  assert.equal(second.type, 'no-op');
});

run('49. loading bloqueia ações', () => {
  const persist = fs.readFileSync(
    path.join(
      __dirname,
      '../../../modals/ModalEditDocumentModel/hooks/useEditDocumentModel.tsx',
    ),
    'utf8',
  );
  const persistFn = persist.slice(
    persist.indexOf('const saveDocumentModel'),
    persist.indexOf('const persistDocumentModel'),
  );
  assert.equal(persistFn.includes('saveMutation.isLoading'), true);
  const top = fs.readFileSync(
    path.join(
      __dirname,
      '../../../modals/ModalEditDocumentModel/components/2-viewDocumentModelStep/components/TopButtons/TopButtons.tsx',
    ),
    'utf8',
  );
  assert.equal(top.includes('saveBusy'), true);
});

run('50. snackbar sucesso só em sucesso real', () => {
  const original = headingWindowModel();
  const noOp = applyV2PersistPlanToStage(
    createOfficialPersistStage(original, { v2LocalDirty: true }),
    {
      type: 'no-op',
      candidate: original,
      built: {
        candidate: original,
        editedProjected: original,
        baselineProjection: original,
        diff: [],
        validation: { ok: true, errors: [] },
      },
    },
  );
  assert.equal(noOp.snackbar, null);
  const failed = applyFailedV2Patch(createOfficialPersistStage(original, { v2LocalDirty: true }));
  assert.equal(failed.snackbar, 'error');
});

run('31. V1↔V2 roundtrip após persist simulado', () => {
  const original = headingWindowModel();
  const selected = createSectionSelection('section-body');
  const edited = persistJson(projectEditorSlice(original, selected));
  edited.sections[0].children!['section-body'][2].text = 'B salvo';
  const plan = planDocumentEditorV2Persist({
    surface: 'v2',
    saveEnabled: true,
    v2LocalDirty: true,
    originalModel: original,
    selectedItem: selected,
    baselineProjection: projectEditorSlice(original, selected),
    tipTapDoc: tipTapFromModel(edited),
  });
  if (plan.type !== 'patch') throw new Error('expected patch');
  const saved = applySuccessfulV2Patch(
    createOfficialPersistStage(original, { v2LocalDirty: true }),
    plan.candidate,
    plan.built,
  );
  assert.equal(bodyOf(saved.reduxModel)[2].text, 'B salvo');
  assert.deepStrictEqual(bodyOf(saved.reduxModel)[0], bodyOf(original)[0]);
  assert.deepStrictEqual(bodyOf(saved.reduxModel)[5], bodyOf(original)[5]);
  const reprojection = projectEditorSlice(
    saved.reduxModel,
    toDocumentEditorSelection(createSectionTreeNode('section-body'))!,
  );
  assert.equal(reprojection.sections[0].children!['section-body'][2].text, 'B salvo');
  assert.equal(requestSurfaceChange({ current: 'v2', next: 'v1', v2LocalDirty: false }).allowed, true);
});

run('32. backup sessionStorage', () => {
  const original = headingWindowModel();
  const storage = memoryStorage();
  assert.equal(
    rememberCanonicalBackup(storage, {
      companyId: 'co-1',
      modelId: 9,
      original,
      now: '2026-08-22T00:00:00.000Z',
    }),
    true,
  );
  assert.equal(
    rememberCanonicalBackup(storage, {
      companyId: 'co-1',
      modelId: 9,
      original: persistJson(original),
    }),
    false,
  );
  const record = readCanonicalBackup(storage, 'co-1', 9);
  assert.ok(record);
  assert.deepStrictEqual(record?.document, original);
  assert.equal(documentEditorV2BackupKey('co-1', 9), 'document-editor-v2-backup:co-1:9');

  const persist = fs.readFileSync(
    path.join(
      __dirname,
      '../../../modals/ModalEditDocumentModel/hooks/useEditDocumentModel.tsx',
    ),
    'utf8',
  );
  const persistFn = persist.slice(
    persist.indexOf('const saveDocumentModel'),
    persist.indexOf('const persistDocumentModel'),
  );
  assert.equal(persistFn.includes('rememberCanonicalBackup'), true);
  assert.equal(persistFn.includes("plan.type === 'patch'"), true);
  assert.equal(persist.includes('localStorage'), false);
});

run('V1 intacto / SAVE OFF não cria backup', () => {
  const v1 = planDocumentEditorV2Persist({
    surface: 'v1',
    saveEnabled: false,
    v2LocalDirty: false,
    originalModel: headingWindowModel(),
    selectedItem: createSectionSelection('section-body'),
    baselineProjection: null,
    tipTapDoc: null,
  });
  assert.equal(v1.type, 'v1-redux');
  const blocked = planDocumentEditorV2Persist({
    surface: 'v2',
    saveEnabled: false,
    v2LocalDirty: true,
    originalModel: headingWindowModel(),
    selectedItem: createSectionSelection('section-body'),
    baselineProjection: null,
    tipTapDoc: null,
  });
  assert.equal(blocked.type, 'block');
});

run('hooks: PATCH antes do Redux; sem adapter no persist', () => {
  const persist = fs.readFileSync(
    path.join(
      __dirname,
      '../../../modals/ModalEditDocumentModel/hooks/useEditDocumentModel.tsx',
    ),
    'utf8',
  );
  const persistFn = persist.slice(
    persist.indexOf('const saveDocumentModel'),
    persist.indexOf('const persistDocumentModel'),
  );
  assert.equal(persistFn.includes('fromTipTapState'), false);
  assert.equal(persistFn.includes('fromDocumentEditorState'), false);
  assert.equal(
    persistFn.indexOf('mutateAsync') < persistFn.indexOf('setDocumentModel'),
    true,
  );
  assert.equal(persistFn.includes('needSynchronization'), false);
});

run('last-write-wins documentado no planner', () => {
  const source = fs.readFileSync(
    path.join(__dirname, './document-editor-v2-controlled-save.ts'),
    'utf8',
  );
  assert.equal(source.includes('No-op (diff vazio): sucesso local sem PATCH'), true);
});

run('GATE 1. V2 OFF → V1 save normal', () => {
  assert.equal(
    resolveOfficialSaveButtonsDisabled({
      hasSelection: true,
      saveBusy: false,
      surface: 'v1',
      v2LocalDirty: false,
      saveEnabled: false,
    }),
    false,
  );
});

run('GATE 2. V2 ON / SAVE OFF / dirty → Save disabled', () => {
  assert.equal(
    resolveOfficialSaveButtonsDisabled({
      hasSelection: true,
      saveBusy: false,
      surface: 'v2',
      v2LocalDirty: true,
      saveEnabled: false,
    }),
    true,
  );
  assert.equal(
    shouldBlockOfficialSave({
      surface: 'v2',
      v2LocalDirty: true,
      saveEnabled: false,
    }),
    true,
  );
});

run('GATE 3. V2 ON / SAVE ON / pristine → botões habilitados (pristine V1)', () => {
  assert.equal(
    resolveOfficialSaveButtonsDisabled({
      hasSelection: true,
      saveBusy: false,
      surface: 'v2',
      v2LocalDirty: false,
      saveEnabled: true,
    }),
    false,
  );
});

run('GATE 4–5. V2 ON / SAVE ON / dirty → Save e Save and exit ENABLED', () => {
  const disabled = resolveOfficialSaveButtonsDisabled({
    hasSelection: true,
    saveBusy: false,
    surface: 'v2',
    v2LocalDirty: true,
    saveEnabled: true,
  });
  assert.equal(disabled, false);
  assert.equal(
    shouldBlockOfficialSave({
      surface: 'v2',
      v2LocalDirty: true,
      saveEnabled: true,
    }),
    false,
  );
});

run('GATE 6. loading → ambos disabled', () => {
  assert.equal(
    resolveOfficialSaveButtonsDisabled({
      hasSelection: true,
      saveBusy: true,
      surface: 'v2',
      v2LocalDirty: true,
      saveEnabled: true,
    }),
    true,
  );
});

run('GATE 7. mutation error → habilitam novamente para retry', () => {
  const afterError = applyFailedV2Patch(
    createOfficialPersistStage(headingWindowModel(), { v2LocalDirty: true }),
  );
  assert.equal(afterError.v2LocalDirty, true);
  assert.equal(afterError.closed, false);
  assert.equal(
    resolveOfficialSaveButtonsDisabled({
      hasSelection: true,
      saveBusy: false,
      surface: 'v2',
      v2LocalDirty: afterError.v2LocalDirty,
      saveEnabled: true,
    }),
    false,
  );
});

run('GATE 8. SAVE OFF nunca chama persist V2', () => {
  const plan = planDocumentEditorV2Persist({
    surface: 'v2',
    saveEnabled: false,
    v2LocalDirty: true,
    originalModel: headingWindowModel(),
    selectedItem: createSectionSelection('section-body'),
    baselineProjection: null,
    tipTapDoc: { type: 'doc' },
  });
  assert.equal(plan.type, 'block');
  const nextConfig = fs.readFileSync(
    path.join(__dirname, '../../../../../../next.config.js'),
    'utf8',
  );
  assert.equal(
    nextConfig.includes('NEXT_PUBLIC_FEATURE_DOCUMENT_EDITOR_V2_SAVE'),
    true,
  );
  const topButtons = fs.readFileSync(
    path.join(
      __dirname,
      '../../../modals/ModalEditDocumentModel/components/2-viewDocumentModelStep/components/TopButtons/TopButtons.tsx',
    ),
    'utf8',
  );
  assert.equal(topButtons.includes('resolveOfficialSaveButtonsDisabled'), true);
});

run('validator abort: ZERO PATCH / Redux / baseline / dirty', () => {
  const original = buildTwoSectionModel([
    paragraph('el-a', 'Empresa ??NOME_DA_EMPRESA??'),
    paragraph('el-legacy', 'Missão ??MISSÃO_DA_EMPRESA??'),
  ]);
  const selected = createSectionSelection('section-body');
  const edited = persistJson(projectEditorSlice(original, selected));
  edited.sections[0].children!['section-body'][0].text = 'Empresa ??NOME_DA_EMPRESA?';
  const plan = planDocumentEditorV2Persist({
    surface: 'v2',
    saveEnabled: true,
    v2LocalDirty: true,
    originalModel: original,
    selectedItem: selected,
    baselineProjection: projectEditorSlice(original, selected),
    tipTapDoc: tipTapFromModel(edited),
  });
  assert.equal(plan.type, 'abort');
  if (plan.type !== 'abort') return;
  assert.equal(plan.kind, 'validation');
  assert.equal(plan.message, 'Token de variável incompleto ou corrompido.');
  const first = plan.errors?.[0];
  assert.equal(first?.code, 'invalid-variable-token');
  assert.equal(first?.elementId, 'el-a');
  assert.ok(first?.fragment?.includes('??NOME_DA_EMPRESA?'));

  const before = createOfficialPersistStage(original, {
    v2LocalDirty: true,
    baseline: projectEditorSlice(original, selected),
  });
  const after = applyV2PersistPlanToStage(before, plan);
  assert.equal(after.reduxModel, original);
  assert.equal(after.queryDocument, original);
  assert.equal(after.v2LocalDirty, true);
  assert.equal(after.patchedPayload, null);
  assert.equal(after.backupCreated, false);
  assert.equal(after.snackbar, 'validation');
  assert.equal(after.closed, false);
  assert.deepStrictEqual(after.baseline, before.baseline);
});

run('legado oficial com acento untouched não aborta o Save', () => {
  const original = buildTwoSectionModel([
    paragraph('el-a', 'Texto editável'),
    paragraph('el-legacy', 'Missão ??MISSÃO_DA_EMPRESA??'),
  ]);
  const selected = createSectionSelection('section-body');
  const edited = persistJson(projectEditorSlice(original, selected));
  edited.sections[0].children!['section-body'][0].text = 'Texto editável agora';
  const plan = planDocumentEditorV2Persist({
    surface: 'v2',
    saveEnabled: true,
    v2LocalDirty: true,
    originalModel: original,
    selectedItem: selected,
    baselineProjection: projectEditorSlice(original, selected),
    tipTapDoc: tipTapFromModel(edited),
  });
  assert.equal(plan.type, 'patch');
  if (plan.type !== 'patch') return;
  assert.equal(plan.built.validation.ok, true);
  assert.equal(
    plan.candidate.sections[0].children!['section-body'][1].text,
    'Missão ??MISSÃO_DA_EMPRESA??',
  );
});

run('range legado OOB untouched não aborta o Save', () => {
  const original = buildTwoSectionModel([paragraph('el-a', 'Texto editável')]);
  original.sections[0].children!['section-other'] = [
    paragraph('el-legacy', 'x'.repeat(41), {
      inlineStyleRangeBlock: [
        [{ offset: 449, length: 45, style: InlineStyleTypeEnum.BOLD }],
      ],
    }),
  ];
  const selected = createSectionSelection('section-body');
  const edited = persistJson(projectEditorSlice(original, selected));
  edited.sections[0].children!['section-body'][0].text = 'Texto editável agora';
  const plan = planDocumentEditorV2Persist({
    surface: 'v2',
    saveEnabled: true,
    v2LocalDirty: true,
    originalModel: original,
    selectedItem: selected,
    baselineProjection: projectEditorSlice(original, selected),
    tipTapDoc: tipTapFromModel(edited),
  });
  assert.equal(plan.type, 'patch');
  if (plan.type !== 'patch') return;
  assert.equal(plan.built.validation.ok, true);
  assert.deepStrictEqual(
    plan.candidate.sections[0].children!['section-other'][0].inlineStyleRangeBlock,
    [[{ offset: 449, length: 45, style: InlineStyleTypeEnum.BOLD }]],
  );
});

console.log('\nFase 5B controlled save: ok');
