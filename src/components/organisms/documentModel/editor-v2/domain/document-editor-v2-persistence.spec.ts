/**
 * Fase 5A — merge/diff/validator (funções puras, sem persistência real).
 *
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/documentModel/editor-v2/domain/document-editor-v2-persistence.spec.ts
 */
import assert from 'assert';

import { getSchema } from '@tiptap/core';
import { Node } from '@tiptap/pm/model';
import { EditorState, TextSelection } from '@tiptap/pm/state';
import {
  DocModelPageOrientation,
  IDocumentModelData,
  IDocumentModelElement,
} from 'core/interfaces/api/IDocumentModel';
import {
  DocumentSectionChildrenTypeEnum,
  DocumentSectionTypeEnum,
  InlineStyleTypeEnum,
} from 'project/enum/document-model.enum';

import {
  fromDocumentEditorState,
  persistJson,
  toDocumentEditorState,
} from '../adapter';
import { buildInlineChildrenModel } from '../adapter/fixtures/poc-canonical.fixture';
import { applyBlockFormatConversion, applyBulletLevelSet } from '../tiptap/apply-block-format';
import {
  applyInlineColor,
  applyInlineFontSize,
  applyInlineStyle,
} from '../tiptap/apply-text-format';
import { applyStableEditableIds } from '../tiptap/assign-stable-ids';
import { createDocumentEditorExtensions } from '../tiptap/extensions/create-document-editor-extensions';
import { fromTipTapState } from '../tiptap/from-tiptap-state';
import { serializeTipTapDoc } from '../tiptap/schema';
import { applyStructuralJoinBackward, applyStructuralSplit } from '../tiptap/structural-join';
import { toTipTapState } from '../tiptap/to-tiptap-state';
import { buildDocumentEditorCandidate } from './build-document-editor-candidate';
import {
  assertAllowedCanonicalDiff,
  canonicalDiff,
} from './canonical-diff';
import { createSequentialIdFactory } from './document-editor-id';
import {
  createElementSelection,
  createSectionSelection,
  projectEditorSlice,
} from './document-editor-slice';
import { mergeEditorSliceIntoDocumentModel } from './merge-editor-slice';
import { StaleDocumentEditorSliceError } from './stale-document-editor-slice.error';
import { validateDocumentModelCandidate } from './validate-document-model';

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

function buildTwoSectionModel(
  body: IDocumentModelElement[],
  extras: Partial<IDocumentModelData> = {},
): IDocumentModelData {
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
          {
            id: 'section-other',
            type: DocumentSectionTypeEnum.SECTION,
            hasChildren: true,
          },
        ],
        children: {
          'section-body': body,
          'section-other': [
            paragraph('el-other', 'Outra section', {
              removeWithAllValidVars: ['KEEP'],
            }),
          ],
        },
      },
    ],
    ...extras,
  };
}

function headingWindowModel(): IDocumentModelData {
  return buildTwoSectionModel([
    paragraph('el-a', 'Prefixo A', {
      removeWithSomeEmptyVars: ['A'],
      removeWithAllEmptyVars: ['B'],
      removeWithAllValidVars: ['C'],
      addWithAllVars: ['X'],
      extraUnknownField: 'keep-me',
    } as Partial<IDocumentModelElement> & { extraUnknownField: string }),
    {
      id: 'el-h2-b',
      type: DocumentSectionChildrenTypeEnum.H2,
      text: 'Heading B',
    },
    paragraph('el-b1', 'Dentro de B'),
    paragraph('el-b2', 'Empresa ??NOME_DA_EMPRESA??'),
    {
      id: 'el-h2-c',
      type: DocumentSectionChildrenTypeEnum.H2,
      text: 'Heading C',
    },
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
  let found: Node | undefined;
  doc.descendants((node, nodePos) => {
    if (
      ['docParagraph', 'docBullet', 'docHeading', 'docCaption', 'docAtom'].includes(
        node.type.name,
      ) &&
      node.attrs.id === id
    ) {
      pos = nodePos;
      found = node;
      return false;
    }
  });
  if (pos < 0 || !found) throw new Error(`block ${id} not found`);
  return { pos, node: found };
}

function setRange(state: EditorState, id: string, from: number, to: number) {
  const found = findBlockPos(state.doc, id);
  return state.apply(
    state.tr.setSelection(
      TextSelection.create(state.doc, found.pos + 1 + from, found.pos + 1 + to),
    ),
  );
}

function setCursor(state: EditorState, id: string, offset: number) {
  const found = findBlockPos(state.doc, id);
  return state.apply(
    state.tr.setSelection(TextSelection.create(state.doc, found.pos + 1 + offset)),
  );
}

function candidateFromTipTap(
  original: IDocumentModelData,
  selected: ReturnType<typeof createSectionSelection>,
  state: EditorState,
  baseline = projectEditorSlice(original, selected),
) {
  return buildDocumentEditorCandidate({
    originalModel: original,
    selectedItem: selected,
    baselineProjection: baseline,
    tipTapDoc: state.doc.toJSON(),
    createId: createSequentialIdFactory(),
  });
}

function bodyOf(model: IDocumentModelData) {
  return model.sections[0].children!['section-body'];
}

function noOpCandidate(
  original: IDocumentModelData,
  selected: ReturnType<typeof createSectionSelection>,
) {
  const baseline = projectEditorSlice(original, selected);
  return buildDocumentEditorCandidate({
    originalModel: original,
    selectedItem: selected,
    baselineProjection: baseline,
    tipTapDoc: tipTapFromModel(baseline),
    createId: createSequentialIdFactory(),
  });
}

run('1. section no-op → diff vazio', () => {
  const original = headingWindowModel();
  const selected = createSectionSelection('section-body');
  const result = noOpCandidate(original, selected);
  assert.deepStrictEqual(result.diff, []);
  assert.deepStrictEqual(persistJson(result.candidate), persistJson(original));
  assert.equal(result.validation.ok, true);
});

run('2. heading no-op → diff vazio', () => {
  const original = headingWindowModel();
  const selected = createElementSelection('el-h2-b', 'H2', 'section-body');
  const result = noOpCandidate(original, selected);
  assert.deepStrictEqual(result.diff, []);
  assert.deepStrictEqual(persistJson(result.candidate), persistJson(original));
  assert.deepStrictEqual(bodyOf(result.candidate)[0], bodyOf(original)[0]);
  assert.deepStrictEqual(bodyOf(result.candidate)[4], bodyOf(original)[4]);
});

run('3. inline children no-op → diff vazio', () => {
  const original = buildInlineChildrenModel();
  const selected = createSectionSelection('section-inline');
  const result = noOpCandidate(original, selected);
  assert.deepStrictEqual(result.diff, []);
  assert.deepStrictEqual(persistJson(result.candidate), persistJson(original));
  assert.ok(result.candidate.sections[0].data[0].children);
  assert.equal(result.candidate.sections[0].children, undefined);
});

run('4. editar B não toca A/C + paths explícitos', () => {
  const original = headingWindowModel();
  const selected = createElementSelection('el-h2-b', 'H2', 'section-body');
  const baseline = projectEditorSlice(original, selected);
  const edited = persistJson(baseline);
  edited.sections[0].children!['section-body'][2].text = 'Empresa alterada';
  const candidate = mergeEditorSliceIntoDocumentModel({
    originalModel: original,
    selectedItem: selected,
    projectedBefore: baseline,
    editedProjected: edited,
  });
  const changes = assertAllowedCanonicalDiff(original, candidate, [
    'sections/0/children/section-body/[el-b2]/text',
  ]);
  assert.equal(changes.length, 1);
  assert.equal(changes[0].path, 'sections/0/children/section-body/[el-b2]/text');
  assert.deepStrictEqual(bodyOf(candidate)[0], bodyOf(original)[0]);
  assert.deepStrictEqual(bodyOf(candidate)[4], bodyOf(original)[4]);
  assert.deepStrictEqual(
    candidate.sections[0].children!['section-other'],
    original.sections[0].children!['section-other'],
  );
});

run('5. split paragraph preserva vizinhos', () => {
  const original = headingWindowModel();
  const selected = createSectionSelection('section-body');
  const baseline = projectEditorSlice(original, selected);
  let state = stateFromModel(baseline);
  state = setCursor(state, 'el-b1', 7);
  state = applyStructuralSplit(state).state;
  const result = candidateFromTipTap(original, selected, state, baseline);
  assert.equal(result.validation.ok, true, JSON.stringify(result.validation.errors));
  assert.deepStrictEqual(bodyOf(result.candidate)[0], bodyOf(original)[0]);
  assert.deepStrictEqual(
    bodyOf(result.candidate).find((item) => item.id === 'el-c1'),
    bodyOf(original).find((item) => item.id === 'el-c1'),
  );
});

run('6. merge paragraph preserva vizinhos', () => {
  const original = headingWindowModel();
  const selected = createSectionSelection('section-body');
  const baseline = projectEditorSlice(original, selected);
  let state = stateFromModel(baseline);
  state = setCursor(state, 'el-b2', 0);
  state = applyStructuralJoinBackward(state).state;
  const result = candidateFromTipTap(original, selected, state, baseline);
  assert.equal(result.validation.ok, true);
  assert.deepStrictEqual(bodyOf(result.candidate)[0], bodyOf(original)[0]);
  assert.equal(bodyOf(result.candidate).some((item) => item.id === 'el-h2-c'), true);
});

run('7. P→BULLET paths', () => {
  const original = headingWindowModel();
  const selected = createSectionSelection('section-body');
  const baseline = projectEditorSlice(original, selected);
  let state = stateFromModel(baseline);
  state = setCursor(state, 'el-b1', 0);
  state = applyBlockFormatConversion(state, 'BULLET').state;
  const result = candidateFromTipTap(original, selected, state, baseline);
  const changes = assertAllowedCanonicalDiff(original, result.candidate, [
    'sections/0/children/section-body/[el-b1]/type',
    'sections/0/children/section-body/[el-b1]/level',
  ]);
  assert.ok(changes.some((item) => item.path.endsWith('/type')));
  assert.equal(bodyOf(result.candidate)[2].type, 'BULLET');
  assert.deepStrictEqual(bodyOf(result.candidate)[0], bodyOf(original)[0]);
});

run('8. BULLET→P', () => {
  const original = buildTwoSectionModel([
    paragraph('el-a', 'A'),
    {
      id: 'el-b',
      type: DocumentSectionChildrenTypeEnum.BULLET,
      text: 'Item',
      level: 1,
    },
    paragraph('el-c', 'C'),
  ]);
  const selected = createSectionSelection('section-body');
  const baseline = projectEditorSlice(original, selected);
  let state = stateFromModel(baseline);
  state = setCursor(state, 'el-b', 0);
  state = applyBlockFormatConversion(state, 'PARAGRAPH').state;
  const result = candidateFromTipTap(original, selected, state, baseline);
  assert.equal(bodyOf(result.candidate)[1].type, 'PARAGRAPH');
  assert.deepStrictEqual(bodyOf(result.candidate)[0], bodyOf(original)[0]);
});

run('9. P→H2', () => {
  const original = buildTwoSectionModel([
    paragraph('el-a', 'A'),
    paragraph('el-b', 'Titulo'),
    paragraph('el-c', 'C'),
  ]);
  const selected = createSectionSelection('section-body');
  const baseline = projectEditorSlice(original, selected);
  let state = stateFromModel(baseline);
  state = setCursor(state, 'el-b', 0);
  state = applyBlockFormatConversion(state, 'H2').state;
  const result = candidateFromTipTap(original, selected, state, baseline);
  assert.equal(bodyOf(result.candidate)[1].type, 'H2');
  assert.deepStrictEqual(bodyOf(result.candidate)[2], bodyOf(original)[2]);
});

run('10. H2→H3', () => {
  const original = headingWindowModel();
  const selected = createSectionSelection('section-body');
  const baseline = projectEditorSlice(original, selected);
  let state = stateFromModel(baseline);
  state = setCursor(state, 'el-h2-b', 0);
  state = applyBlockFormatConversion(state, 'H3').state;
  const result = candidateFromTipTap(original, selected, state, baseline);
  assert.equal(bodyOf(result.candidate)[1].type, 'H3');
  assert.equal(bodyOf(result.candidate)[4].type, 'H2');
});

run('11. bullet level + paths', () => {
  const original = buildTwoSectionModel([
    paragraph('el-a', 'A'),
    {
      id: 'el-b',
      type: DocumentSectionChildrenTypeEnum.BULLET,
      text: 'Item',
      level: 0,
    },
    paragraph('el-c', 'C'),
  ]);
  const selected = createSectionSelection('section-body');
  const baseline = projectEditorSlice(original, selected);
  let state = stateFromModel(baseline);
  state = setCursor(state, 'el-b', 0);
  state = applyBulletLevelSet(state, 2).state;
  const result = candidateFromTipTap(original, selected, state, baseline);
  const changes = assertAllowedCanonicalDiff(original, result.candidate, [
    'sections/0/children/section-body/[el-b]/level',
  ]);
  assert.equal(changes[0].after, 2);
  assert.deepStrictEqual(bodyOf(result.candidate)[2], bodyOf(original)[2]);
});

run('12. BULLET_SPACE untouched', () => {
  const original = buildTwoSectionModel([
    paragraph('el-a', 'A'),
    {
      id: 'el-space',
      type: DocumentSectionChildrenTypeEnum.BULLET_SPACE,
      text: 'Espaço',
    },
    paragraph('el-c', 'C'),
  ]);
  const selected = createSectionSelection('section-body');
  const result = noOpCandidate(original, selected);
  assert.deepStrictEqual(result.diff, []);
  assert.equal(bodyOf(result.candidate)[1].type, 'BULLET_SPACE');
});

run('13. children inline merge edita só o elemento', () => {
  const original = buildInlineChildrenModel();
  const selected = createSectionSelection('section-inline');
  const baseline = projectEditorSlice(original, selected);
  const edited = persistJson(baseline);
  edited.sections[0].data[0].children![1].text = 'Primeiro parágrafo mudou';
  const candidate = mergeEditorSliceIntoDocumentModel({
    originalModel: original,
    selectedItem: selected,
    projectedBefore: baseline,
    editedProjected: edited,
  });
  assert.equal(candidate.sections[0].children, undefined);
  assert.equal(
    candidate.sections[0].data[0].children![1].text,
    'Primeiro parágrafo mudou',
  );
  assert.deepStrictEqual(
    candidate.sections[0].data[0].children![0],
    original.sections[0].data[0].children![0],
  );
});

run('14. unknown type intacto', () => {
  const original = buildTwoSectionModel([
    paragraph('el-a', 'A'),
    { id: 'el-future', type: 'FUTURE_UNKNOWN_TYPE', text: '', url: '/keep' },
    paragraph('el-c', 'C'),
  ]);
  const selected = createSectionSelection('section-body');
  const result = noOpCandidate(original, selected);
  assert.deepStrictEqual(result.diff, []);
  assert.equal(bodyOf(result.candidate)[1].type, 'FUTURE_UNKNOWN_TYPE');
  assert.equal(bodyOf(result.candidate)[1].url, '/keep');
});

run('15. variable untouched', () => {
  const original = headingWindowModel();
  const selected = createSectionSelection('section-body');
  const result = noOpCandidate(original, selected);
  assert.equal(bodyOf(result.candidate)[3].text, 'Empresa ??NOME_DA_EMPRESA??');
  assert.deepStrictEqual(result.candidate.variables, original.variables);
});

run('16. variable deleted muda só elemento + paths', () => {
  const original = headingWindowModel();
  const selected = createElementSelection('el-h2-b', 'H2', 'section-body');
  const baseline = projectEditorSlice(original, selected);
  const edited = persistJson(baseline);
  edited.sections[0].children!['section-body'][2].text = 'Empresa ';
  const candidate = mergeEditorSliceIntoDocumentModel({
    originalModel: original,
    selectedItem: selected,
    projectedBefore: baseline,
    editedProjected: edited,
  });
  const changes = assertAllowedCanonicalDiff(original, candidate, [
    'sections/0/children/section-body/[el-b2]/text',
  ]);
  assert.equal(changes.length, 1);
  assert.deepStrictEqual(candidate.variables, original.variables);
});

run('17. bold/color/fontsize/link', () => {
  const original = buildTwoSectionModel([
    paragraph('el-a', 'Prefixo A'),
    paragraph('el-b', 'Texto longo', {
      entityRangeBlock: [
        [
          {
            offset: 0,
            length: 5,
            data: {
              type: 'LINK',
              mutability: 'MUTABLE',
              data: { url: 'https://simplesst.com', targetOption: '_blank' },
            },
          },
        ],
      ],
    }),
    paragraph('el-c', 'Sufixo C'),
  ]);
  const selected = createSectionSelection('section-body');
  const baseline = projectEditorSlice(original, selected);
  let state = stateFromModel(baseline);
  state = applyInlineStyle(
    setRange(state, 'el-b', 0, 5),
    InlineStyleTypeEnum.BOLD,
  ).state;
  state = applyInlineColor(setRange(state, 'el-b', 6, 11), '#FF0000').state;
  state = applyInlineFontSize(setRange(state, 'el-b', 6, 11), 18).state;
  const result = candidateFromTipTap(original, selected, state, baseline);
  assert.equal(result.validation.ok, true);
  const edited = bodyOf(result.candidate)[1];
  const styles = edited.inlineStyleRangeBlock?.[0] || [];
  assert.ok(styles.some((range) => range.style === InlineStyleTypeEnum.BOLD));
  assert.ok(
    styles.some(
      (range) =>
        range.style === InlineStyleTypeEnum.COLOR && range.value === '#FF0000',
    ),
  );
  assert.ok(
    styles.some(
      (range) =>
        range.style === InlineStyleTypeEnum.FONTSIZE && range.value === '18',
    ),
  );
  assert.equal(edited.entityRangeBlock?.[0]?.[0]?.data?.type, 'LINK');
  assert.deepStrictEqual(bodyOf(result.candidate)[0], bodyOf(original)[0]);
  assert.deepStrictEqual(bodyOf(result.candidate)[2], bodyOf(original)[2]);
});

run('18. ranges válidos após split', () => {
  const original = buildTwoSectionModel([
    paragraph('el-a', 'ABCDEF', {
      inlineStyleRangeBlock: [
        [{ offset: 0, length: 6, style: InlineStyleTypeEnum.BOLD }],
      ],
    }),
    paragraph('el-c', 'C'),
  ]);
  const selected = createSectionSelection('section-body');
  const baseline = projectEditorSlice(original, selected);
  let state = stateFromModel(baseline);
  state = setCursor(state, 'el-a', 3);
  state = applyStructuralSplit(state).state;
  const result = candidateFromTipTap(original, selected, state, baseline);
  assert.equal(result.validation.ok, true);
});

run('19. caption edit + paths', () => {
  const original = buildTwoSectionModel([
    paragraph('el-a', 'A'),
    {
      id: 'el-cap',
      type: DocumentSectionChildrenTypeEnum.PARAGRAPH_TABLE,
      text: 'Tabela 1',
    },
    paragraph('el-c', 'C'),
  ]);
  const selected = createSectionSelection('section-body');
  const baseline = projectEditorSlice(original, selected);
  const edited = persistJson(baseline);
  edited.sections[0].children!['section-body'][1].text = 'Tabela 1 — nova';
  const candidate = mergeEditorSliceIntoDocumentModel({
    originalModel: original,
    selectedItem: selected,
    projectedBefore: baseline,
    editedProjected: edited,
  });
  const changes = assertAllowedCanonicalDiff(original, candidate, [
    'sections/0/children/section-body/[el-cap]/text',
  ]);
  assert.equal(changes.length, 1);
  assert.deepStrictEqual(bodyOf(candidate)[0], bodyOf(original)[0]);
});

run('20. IMAGE attrs intactos', () => {
  const original = buildTwoSectionModel([
    paragraph('el-a', 'A'),
    {
      id: 'el-image',
      type: DocumentSectionChildrenTypeEnum.IMAGE,
      text: '',
      url: '/x.png',
      width: 80,
    },
    paragraph('el-c', 'C'),
  ]);
  const selected = createElementSelection('el-image', 'IMAGE', 'section-body');
  const result = noOpCandidate(original, selected);
  assert.deepStrictEqual(result.diff, []);
  assert.equal(bodyOf(result.candidate)[1].url, '/x.png');
  assert.equal(bodyOf(result.candidate)[1].width, 80);
});

run('21. BREAK intacto', () => {
  const original = buildTwoSectionModel([
    paragraph('el-a', 'A'),
    { id: 'el-break', type: DocumentSectionChildrenTypeEnum.BREAK, text: '' },
    paragraph('el-c', 'C'),
  ]);
  const result = noOpCandidate(original, createSectionSelection('section-body'));
  assert.deepStrictEqual(result.diff, []);
  assert.equal(bodyOf(result.candidate)[1].type, 'BREAK');
});

run('22. SECTION_BREAK orientation intacta', () => {
  const original = buildTwoSectionModel([
    paragraph('el-a', 'A'),
    {
      id: 'el-sb',
      type: DocumentSectionChildrenTypeEnum.SECTION_BREAK,
      text: '',
      orientation: DocModelPageOrientation.LANDSCAPE,
    },
    paragraph('el-c', 'C'),
  ]);
  const result = noOpCandidate(original, createSectionSelection('section-body'));
  assert.deepStrictEqual(result.diff, []);
  assert.equal(bodyOf(result.candidate)[1].orientation, 'landscape');
});

run('23. unknown atom intacto em merge vizinho', () => {
  const original = buildTwoSectionModel([
    paragraph('el-a', 'A'),
    { id: 'el-future', type: 'FUTURE_UNKNOWN_TYPE', text: '' },
    paragraph('el-c', 'C'),
  ]);
  const selected = createElementSelection('el-a', 'PARAGRAPH', 'section-body');
  const baseline = projectEditorSlice(original, selected);
  const edited = persistJson(baseline);
  edited.sections[0].children!['section-body'][0].text = 'A2';
  const candidate = mergeEditorSliceIntoDocumentModel({
    originalModel: original,
    selectedItem: selected,
    projectedBefore: baseline,
    editedProjected: edited,
  });
  assert.deepStrictEqual(bodyOf(candidate)[1], bodyOf(original)[1]);
});

run('24. other section untouched', () => {
  const original = headingWindowModel();
  const selected = createSectionSelection('section-body');
  const baseline = projectEditorSlice(original, selected);
  const edited = persistJson(baseline);
  edited.sections[0].children!['section-body'][2].text = 'mudou';
  const candidate = mergeEditorSliceIntoDocumentModel({
    originalModel: original,
    selectedItem: selected,
    projectedBefore: baseline,
    editedProjected: edited,
  });
  assert.deepStrictEqual(
    persistJson(candidate.sections[0].children!['section-other']),
    persistJson(original.sections[0].children!['section-other']),
  );
});

run('25. variables untouched', () => {
  const original = headingWindowModel();
  const selected = createSectionSelection('section-body');
  const baseline = projectEditorSlice(original, selected);
  const edited = persistJson(baseline);
  edited.variables[0].label = 'não deveria ir para o merge';
  const candidate = mergeEditorSliceIntoDocumentModel({
    originalModel: original,
    selectedItem: selected,
    projectedBefore: baseline,
    editedProjected: edited,
  });
  assert.deepStrictEqual(candidate.variables, original.variables);
});

run('26. ids preservados no no-op', () => {
  const original = headingWindowModel();
  const result = noOpCandidate(original, createSectionSelection('section-body'));
  assert.deepStrictEqual(
    bodyOf(result.candidate).map((item) => item.id),
    bodyOf(original).map((item) => item.id),
  );
});

run('27. attrs opacos preservados', () => {
  const original = headingWindowModel();
  const result = noOpCandidate(original, createSectionSelection('section-body'));
  assert.deepStrictEqual(bodyOf(result.candidate)[0].removeWithSomeEmptyVars, [
    'A',
  ]);
  assert.deepStrictEqual(bodyOf(result.candidate)[0].removeWithAllEmptyVars, [
    'B',
  ]);
  assert.deepStrictEqual(bodyOf(result.candidate)[0].removeWithAllValidVars, [
    'C',
  ]);
  assert.deepStrictEqual(bodyOf(result.candidate)[0].addWithAllVars, ['X']);
  assert.equal(
    (bodyOf(result.candidate)[0] as IDocumentModelElement & {
      extraUnknownField?: string;
    }).extraUnknownField,
    'keep-me',
  );
  assert.equal(result.candidate.sections[0].data[0].footerText, 'rodapé-oficial');
});

run('28. section ausente → erro', () => {
  const original = headingWindowModel();
  assert.throws(
    () =>
      mergeEditorSliceIntoDocumentModel({
        originalModel: original,
        selectedItem: createSectionSelection('section-missing'),
        projectedBefore: projectEditorSlice(
          original,
          createSectionSelection('section-missing'),
        ),
        editedProjected: projectEditorSlice(
          original,
          createSectionSelection('section-missing'),
        ),
      }),
    (error: unknown) =>
      error instanceof StaleDocumentEditorSliceError &&
      error.reason === 'section-missing',
  );
});

run('29. heading âncora ausente → erro', () => {
  const original = headingWindowModel();
  const selected = createElementSelection('el-h2-b', 'H2', 'section-body');
  const baseline = projectEditorSlice(original, selected);
  const mutated = persistJson(original);
  mutated.sections[0].children!['section-body'] = bodyOf(mutated).filter(
    (item) => item.id !== 'el-h2-b',
  );
  assert.throws(
    () =>
      mergeEditorSliceIntoDocumentModel({
        originalModel: mutated,
        selectedItem: selected,
        projectedBefore: baseline,
        editedProjected: baseline,
      }),
    (error: unknown) =>
      error instanceof StaleDocumentEditorSliceError &&
      error.reason === 'anchor-missing',
  );
});

run('30. window incompatível → erro', () => {
  const original = headingWindowModel();
  const selected = createElementSelection('el-h2-b', 'H2', 'section-body');
  const baseline = projectEditorSlice(original, selected);
  const mutated = persistJson(original);
  mutated.sections[0].children!['section-body'].splice(3, 0, paragraph('el-x', 'intruso'));
  assert.throws(
    () =>
      mergeEditorSliceIntoDocumentModel({
        originalModel: mutated,
        selectedItem: selected,
        projectedBefore: baseline,
        editedProjected: baseline,
      }),
    (error: unknown) =>
      error instanceof StaleDocumentEditorSliceError &&
      error.reason === 'window-mismatch',
  );
});

function duplicateSecond(
  model: IDocumentModelData,
  firstId: string,
  secondId: string,
) {
  const json = tipTapFromModel(model);
  const walk = (node: any) => {
    if (node?.attrs?.id === secondId) node.attrs.id = firstId;
    node?.content?.forEach(walk);
  };
  walk(json);
  return applyStableEditableIds(
    EditorState.create({ schema, doc: Node.fromJSON(schema, json) }),
    createSequentialIdFactory('dup'),
  );
}

run('31. duplicate paragraph', () => {
  const model = buildTwoSectionModel([
    paragraph('el-a', 'A'),
    paragraph('el-b', 'B'),
  ]);
  const state = duplicateSecond(model, 'el-a', 'el-b');
  const restored = fromDocumentEditorState(fromTipTapState(state.doc.toJSON()));
  const ids = restored.sections[0].children!['section-body'].map((item) => item.id);
  assert.deepStrictEqual(ids, ['el-a', 'dup-1']);
});

run('32. duplicate bullet', () => {
  const model = buildTwoSectionModel([
    {
      id: 'el-a',
      type: DocumentSectionChildrenTypeEnum.BULLET,
      text: 'A',
      level: 0,
    },
    {
      id: 'el-b',
      type: DocumentSectionChildrenTypeEnum.BULLET,
      text: 'B',
      level: 0,
    },
  ]);
  const state = duplicateSecond(model, 'el-a', 'el-b');
  const ids = fromDocumentEditorState(fromTipTapState(state.doc.toJSON()))
    .sections[0].children!['section-body'].map((item) => item.id);
  assert.deepStrictEqual(ids, ['el-a', 'dup-1']);
});

run('33. duplicate heading', () => {
  const model = buildTwoSectionModel([
    { id: 'el-a', type: DocumentSectionChildrenTypeEnum.H2, text: 'A' },
    { id: 'el-b', type: DocumentSectionChildrenTypeEnum.H3, text: 'B' },
  ]);
  const state = duplicateSecond(model, 'el-a', 'el-b');
  const ids = fromDocumentEditorState(fromTipTapState(state.doc.toJSON()))
    .sections[0].children!['section-body'].map((item) => item.id);
  assert.deepStrictEqual(ids, ['el-a', 'dup-1']);
});

run('34. duplicate caption', () => {
  const model = buildTwoSectionModel([
    {
      id: 'el-a',
      type: DocumentSectionChildrenTypeEnum.PARAGRAPH_TABLE,
      text: 'T1',
    },
    {
      id: 'el-b',
      type: DocumentSectionChildrenTypeEnum.LEGEND,
      text: 'L2',
    },
  ]);
  const state = duplicateSecond(model, 'el-a', 'el-b');
  const ids = fromDocumentEditorState(fromTipTapState(state.doc.toJSON()))
    .sections[0].children!['section-body'].map((item) => item.id);
  assert.deepStrictEqual(ids, ['el-a', 'dup-1']);
});

run('35. duplicate atom', () => {
  const model = buildTwoSectionModel([
    { id: 'el-a', type: DocumentSectionChildrenTypeEnum.BREAK, text: '' },
    { id: 'el-b', type: DocumentSectionChildrenTypeEnum.IMAGE, text: '', url: '/x' },
  ]);
  const state = duplicateSecond(model, 'el-a', 'el-b');
  const ids = fromDocumentEditorState(fromTipTapState(state.doc.toJSON()))
    .sections[0].children!['section-body'].map((item) => item.id);
  assert.deepStrictEqual(ids, ['el-a', 'dup-1']);
});

run('36. não duplicados não mudam', () => {
  const model = headingWindowModel();
  const state = applyStableEditableIds(
    stateFromModel(model),
    createSequentialIdFactory('dup'),
  );
  const ids = fromDocumentEditorState(fromTipTapState(state.doc.toJSON()))
    .sections[0].children!['section-body'].map((item) => item.id);
  assert.deepStrictEqual(
    ids,
    bodyOf(model).map((item) => item.id),
  );
});

run('37. validator: duplicate id rejeitado', () => {
  const model = buildTwoSectionModel([
    paragraph('el-a', 'A'),
    paragraph('el-a', 'B'),
  ]);
  const result = validateDocumentModelCandidate(model);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((item) => item.code === 'duplicate-id'));
});

run('38. validator: range inválido rejeitado', () => {
  const model = buildTwoSectionModel([
    paragraph('el-a', 'ABC', {
      inlineStyleRangeBlock: [
        [{ offset: 2, length: 5, style: InlineStyleTypeEnum.BOLD }],
      ],
    }),
  ]);
  const result = validateDocumentModelCandidate(model);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((item) => item.code === 'invalid-range'));
});

run('39. validator: bullet level inválido rejeitado', () => {
  const model = buildTwoSectionModel([
    {
      id: 'el-b',
      type: DocumentSectionChildrenTypeEnum.BULLET,
      text: 'x',
      level: 9,
    },
  ]);
  const result = validateDocumentModelCandidate(model);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((item) => item.code === 'invalid-bullet-level'));
});

run('40. validator: SECTION_BREAK orientation inválida rejeitada', () => {
  const model = buildTwoSectionModel([
    {
      id: 'el-sb',
      type: DocumentSectionChildrenTypeEnum.SECTION_BREAK,
      text: '',
      orientation: 'diagonal' as never,
    },
  ]);
  const result = validateDocumentModelCandidate(model);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((item) => item.code === 'invalid-orientation'));
});

run('41. validator: unknown type aceito', () => {
  const model = buildTwoSectionModel([
    { id: 'el-future', type: 'FUTURE_UNKNOWN_TYPE', text: '' },
  ]);
  const result = validateDocumentModelCandidate(model);
  assert.equal(result.ok, true);
});

run('42. validator: candidate válido aceito', () => {
  const result = validateDocumentModelCandidate(headingWindowModel());
  assert.equal(result.ok, true);
});

run('canonicalDiff distingue no-op de edição', () => {
  const original = headingWindowModel();
  assert.deepStrictEqual(canonicalDiff(original, persistJson(original)), []);
  const next = persistJson(original);
  next.sections[0].children!['section-body'][2].text = 'x';
  assert.ok(canonicalDiff(original, next).length > 0);
});

console.log('\nFase 5A persistence infrastructure: ok');
