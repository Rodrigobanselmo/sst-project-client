/**
 * Fase 4A — conversão estrutural de bloco (EditorState, sem React).
 *
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/documentModel/editor-v2/tiptap/document-editor-v2-block-format.spec.ts
 */
import assert from 'assert';

import { getSchema } from '@tiptap/core';
import { Node } from '@tiptap/pm/model';
import { history, undo } from '@tiptap/pm/history';
import { EditorState, NodeSelection, TextSelection } from '@tiptap/pm/state';
import {
  DocModelAlignmentType,
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
import { createSequentialIdFactory } from '../domain/document-editor-id';
import {
  clampBulletLevel,
  nextBulletLevel,
} from '../domain/block-format';
import { allowDocumentEditorV2Transaction } from '../integration/document-editor-v2-guards';
import {
  requestSurfaceChange,
  shouldBlockOfficialSave,
} from '../integration/document-editor-v2-session';
import {
  applyBlockFormatConversion,
  applyBulletLevelChange,
  applyBulletLevelSet,
  createBlockFormatTransaction,
  labelForActiveBlock,
  resolveActiveBlock,
} from './apply-block-format';
import { createDocumentEditorExtensions } from './extensions/create-document-editor-extensions';
import { applyStableEditableIds } from './extensions/structural-editing.extension';
import { fromTipTapState } from './from-tiptap-state';
import { serializeTipTapDoc } from './schema';
import {
  applyStructuralJoinBackward,
  applyStructuralJoinForward,
  applyStructuralSplit,
} from './structural-join';
import { toTipTapState } from './to-tiptap-state';

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

function bullet(
  id: string,
  text: string,
  extra?: Partial<IDocumentModelElement>,
): IDocumentModelElement {
  return {
    id,
    type: DocumentSectionChildrenTypeEnum.BULLET,
    text,
    level: extra?.level ?? 0,
    ...extra,
  };
}

function heading(
  id: string,
  type: DocumentSectionChildrenTypeEnum,
  text: string,
  extra?: Partial<IDocumentModelElement>,
): IDocumentModelElement {
  return { id, type, text, ...extra };
}

function modelWithChildren(
  children: IDocumentModelElement[],
): IDocumentModelData {
  return {
    variables: [{ type: 'NOME_DA_EMPRESA', label: 'Empresa' }],
    sections: [
      {
        data: [
          {
            id: 'section-body',
            type: DocumentSectionTypeEnum.SECTION,
            hasChildren: true,
          },
        ],
        children: { 'section-body': children },
      },
    ],
  };
}

const schema = getSchema(createDocumentEditorExtensions());

function stateFromChildren(children: IDocumentModelElement[]): EditorState {
  const json = serializeTipTapDoc(
    toTipTapState(toDocumentEditorState(modelWithChildren(children))),
  );
  return EditorState.create({
    schema,
    doc: Node.fromJSON(schema, json),
  });
}

function stateFromChildrenWithHistory(
  children: IDocumentModelElement[],
): EditorState {
  const json = serializeTipTapDoc(
    toTipTapState(toDocumentEditorState(modelWithChildren(children))),
  );
  return EditorState.create({
    schema,
    doc: Node.fromJSON(schema, json),
    plugins: [history()],
  });
}

function findBlockPos(doc: Node, id: string): { pos: number; node: Node } {
  let pos = -1;
  let found: Node | undefined;
  doc.descendants((node, nodePos) => {
    if (
      (node.type.name === 'docParagraph' ||
        node.type.name === 'docBullet' ||
        node.type.name === 'docHeading' ||
        node.type.name === 'docCaption' ||
        node.type.name === 'docAtom') &&
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

function dumpBlocks(doc: Node) {
  const blocks: Array<{ type: string; id: string; text: string; level?: number }> =
    [];
  doc.descendants((node) => {
    if (
      node.type.name === 'docParagraph' ||
      node.type.name === 'docBullet' ||
      node.type.name === 'docHeading' ||
      node.type.name === 'docCaption' ||
      node.type.name === 'docAtom'
    ) {
      blocks.push({
        type: node.type.name,
        id: String(node.attrs.id),
        text: node.textContent,
        ...(node.type.name === 'docBullet' && {
          level: Number(node.attrs.level ?? 0),
        }),
      });
    }
  });
  return blocks;
}

function setCursor(state: EditorState, id: string, offset: number) {
  const found = findBlockPos(state.doc, id);
  return state.apply(
    state.tr.setSelection(
      TextSelection.create(state.doc, found.pos + 1 + offset),
    ),
  );
}

function restore(state: EditorState) {
  return fromDocumentEditorState(fromTipTapState(state.doc.toJSON()));
}

function childrenOf(model: IDocumentModelData) {
  return model.sections[0].children?.['section-body'] || [];
}

function convert(
  state: EditorState,
  id: string,
  target: Parameters<typeof applyBlockFormatConversion>[1],
) {
  const next = setCursor(state, id, 0);
  return applyBlockFormatConversion(next, target);
}

function canonicalChild(state: EditorState, id: string) {
  const child = childrenOf(restore(state)).find((item) => item.id === id);
  if (!child) throw new Error(`canonical ${id} not found`);
  return child;
}

const richParagraph = paragraph('el-rich', 'Texto com marca', {
  removeWithSomeEmptyVars: ['A'],
  removeWithAllEmptyVars: ['B'],
  removeWithAllValidVars: ['C'],
  addWithAllVars: ['D'],
  align: DocModelAlignmentType.CENTER,
  size: 12,
  color: '#111111',
  lineHeight: 1.46,
  lineHeightBlock: [1.46],
  inlineStyleRangeBlock: [
    [{ offset: 0, length: 5, style: InlineStyleTypeEnum.BOLD }],
  ],
  entityRangeBlock: [
    [
      {
        offset: 10,
        length: 5,
        data: {
          type: 'LINK',
          mutability: 'MUTABLE',
          data: { url: 'https://simplesst.com', targetOption: '_blank' },
        },
      },
    ],
  ],
});

run('1. P → BULLET', () => {
  let state = stateFromChildren([paragraph('el-a', 'Item')]);
  const result = convert(state, 'el-a', 'BULLET');
  assert.equal(result.ok, true);
  assert.equal(dumpBlocks(result.state.doc)[0].type, 'docBullet');
  assert.equal(canonicalChild(result.state, 'el-a').type, 'BULLET');
});

run('2. BULLET → P', () => {
  let state = stateFromChildren([bullet('el-a', 'Item', { level: 2 })]);
  const result = convert(state, 'el-a', 'PARAGRAPH');
  assert.equal(result.ok, true);
  assert.equal(dumpBlocks(result.state.doc)[0].type, 'docParagraph');
  const child = canonicalChild(result.state, 'el-a');
  assert.equal(child.type, 'PARAGRAPH');
  assert.equal(child.level, undefined);
});

run('3. P → H1', () => {
  const result = convert(stateFromChildren([paragraph('el-a', 'Titulo')]), 'el-a', 'H1');
  assert.equal(canonicalChild(result.state, 'el-a').type, 'H1');
});

run('4. P → H2', () => {
  const result = convert(stateFromChildren([paragraph('el-a', 'Titulo')]), 'el-a', 'H2');
  assert.equal(canonicalChild(result.state, 'el-a').type, 'H2');
});

run('5. P → H6', () => {
  const result = convert(stateFromChildren([paragraph('el-a', 'Titulo')]), 'el-a', 'H6');
  assert.equal(canonicalChild(result.state, 'el-a').type, 'H6');
});

run('6. H1 → P', () => {
  const result = convert(
    stateFromChildren([heading('el-a', DocumentSectionChildrenTypeEnum.H1, 'Titulo')]),
    'el-a',
    'PARAGRAPH',
  );
  assert.equal(canonicalChild(result.state, 'el-a').type, 'PARAGRAPH');
});

run('7. H2 → H3', () => {
  const result = convert(
    stateFromChildren([heading('el-a', DocumentSectionChildrenTypeEnum.H2, 'Titulo')]),
    'el-a',
    'H3',
  );
  assert.equal(canonicalChild(result.state, 'el-a').type, 'H3');
  assert.equal(dumpBlocks(result.state.doc)[0].type, 'docHeading');
});

run('8. H6 → H1', () => {
  const result = convert(
    stateFromChildren([heading('el-a', DocumentSectionChildrenTypeEnum.H6, 'Titulo')]),
    'el-a',
    'H1',
  );
  assert.equal(canonicalChild(result.state, 'el-a').type, 'H1');
});

run('9. BULLET → H2', () => {
  const result = convert(stateFromChildren([bullet('el-a', 'Item')]), 'el-a', 'H2');
  assert.equal(canonicalChild(result.state, 'el-a').type, 'H2');
  assert.equal(canonicalChild(result.state, 'el-a').level, undefined);
});

run('10. H2 → BULLET', () => {
  const result = convert(
    stateFromChildren([heading('el-a', DocumentSectionChildrenTypeEnum.H2, 'Item')]),
    'el-a',
    'BULLET',
  );
  assert.equal(canonicalChild(result.state, 'el-a').type, 'BULLET');
  assert.equal(canonicalChild(result.state, 'el-a').level, 0);
});

run('11. id preservado em todas as conversões', () => {
  const targets = ['BULLET', 'H1', 'H2', 'H6'] as const;
  targets.forEach((target) => {
    const result = convert(
      stateFromChildren([paragraph('keep-id', 'X'), paragraph('neighbor', 'Y')]),
      'keep-id',
      target,
    );
    assert.equal(result.ok, true);
    assert.deepStrictEqual(
      dumpBlocks(result.state.doc).map((block) => block.id),
      ['keep-id', 'neighbor'],
    );
  });
  const fromHeading = convert(
    stateFromChildren([
      heading('keep-id', DocumentSectionChildrenTypeEnum.H2, 'X'),
      paragraph('neighbor', 'Y'),
    ]),
    'keep-id',
    'PARAGRAPH',
  );
  assert.equal(fromHeading.ok, true);
  assert.deepStrictEqual(
    dumpBlocks(fromHeading.state.doc).map((block) => block.id),
    ['keep-id', 'neighbor'],
  );
});

run('12. texto preservado', () => {
  const result = convert(
    stateFromChildren([paragraph('el-a', 'Texto original')]),
    'el-a',
    'H2',
  );
  assert.equal(canonicalChild(result.state, 'el-a').text, 'Texto original');
});

run('13. bold preservado', () => {
  const result = convert(stateFromChildren([richParagraph]), 'el-rich', 'H2');
  const child = canonicalChild(result.state, 'el-rich');
  assert.equal(child.type, 'H2');
  assert.ok(
    (child.inlineStyleRangeBlock?.[0] || []).some(
      (range) => range.style === InlineStyleTypeEnum.BOLD,
    ),
  );
});

run('14. hyperlink preservado', () => {
  const result = convert(stateFromChildren([richParagraph]), 'el-rich', 'BULLET');
  const child = canonicalChild(result.state, 'el-rich');
  assert.equal(
    child.entityRangeBlock?.[0]?.[0]?.data?.data?.url,
    'https://simplesst.com',
  );
});

run('15. ??VAR?? preservada', () => {
  const result = convert(
    stateFromChildren([paragraph('el-a', 'Empresa ??NOME_DA_EMPRESA??')]),
    'el-a',
    'H3',
  );
  assert.equal(canonicalChild(result.state, 'el-a').text, 'Empresa ??NOME_DA_EMPRESA??');
});

run('16. attrs opacos preservados', () => {
  const result = convert(stateFromChildren([richParagraph]), 'el-rich', 'H2');
  const child = canonicalChild(result.state, 'el-rich');
  assert.deepStrictEqual(child.removeWithSomeEmptyVars, ['A']);
  assert.deepStrictEqual(child.removeWithAllEmptyVars, ['B']);
  assert.deepStrictEqual(child.removeWithAllValidVars, ['C']);
  assert.deepStrictEqual(child.addWithAllVars, ['D']);
  assert.equal(child.align, DocModelAlignmentType.CENTER);
  assert.equal(child.size, 12);
  assert.equal(child.color, '#111111');
  assert.equal(child.lineHeight, 1.46);
  assert.deepStrictEqual(child.lineHeightBlock, [1.46]);
});

run('17. level default 0 ao criar BULLET', () => {
  const result = convert(stateFromChildren([paragraph('el-a', 'Item')]), 'el-a', 'BULLET');
  assert.equal(canonicalChild(result.state, 'el-a').level, 0);
  assert.equal(dumpBlocks(result.state.doc)[0].level, 0);
});

run('18. level 0→1', () => {
  let state = setCursor(stateFromChildren([bullet('el-a', 'Item')]), 'el-a', 0);
  const result = applyBulletLevelChange(state, 1);
  assert.equal(result.ok, true);
  assert.equal(result.level, 1);
  assert.equal(canonicalChild(result.state, 'el-a').level, 1);
});

run('19. level 1→0', () => {
  let state = setCursor(
    stateFromChildren([bullet('el-a', 'Item', { level: 1 })]),
    'el-a',
    0,
  );
  const result = applyBulletLevelChange(state, -1);
  assert.equal(result.level, 0);
  assert.equal(canonicalChild(result.state, 'el-a').level, 0);
});

run('20. limite inferior 0', () => {
  assert.equal(clampBulletLevel(-3), 0);
  let state = setCursor(stateFromChildren([bullet('el-a', 'Item')]), 'el-a', 0);
  const result = applyBulletLevelChange(state, -1);
  assert.equal(result.ok, false);
  assert.equal(canonicalChild(result.state, 'el-a').level, 0);
});

run('21. limite superior 6', () => {
  assert.equal(nextBulletLevel(6, 1), 6);
  let state = setCursor(
    stateFromChildren([bullet('el-a', 'Item', { level: 6 })]),
    'el-a',
    0,
  );
  const result = applyBulletLevelSet(state, 9);
  assert.equal(result.ok, false);
  assert.equal(canonicalChild(result.state, 'el-a').level, 6);
});

run('22. atom não convertível', () => {
  let state = stateFromChildren([
    paragraph('p-a', 'Antes'),
    {
      id: 'el-image',
      type: DocumentSectionChildrenTypeEnum.IMAGE,
      text: '',
      url: '/x.png',
    },
  ]);
  const atom = findBlockPos(state.doc, 'el-image');
  state = state.apply(
    state.tr.setSelection(NodeSelection.create(state.doc, atom.pos)),
  );
  const active = resolveActiveBlock(state);
  assert.equal(active.kind, 'atom');
  assert.equal(active.convertible, false);
  const result = applyBlockFormatConversion(state, 'PARAGRAPH');
  assert.equal(result.ok, false);
  assert.equal(canonicalChild(result.state, 'el-image').type, 'IMAGE');
});

function selectAcross(
  state: EditorState,
  fromId: string,
  toId: string,
): EditorState {
  const first = findBlockPos(state.doc, fromId);
  const last = findBlockPos(state.doc, toId);
  return state.apply(
    state.tr.setSelection(
      TextSelection.create(
        state.doc,
        first.pos + 1,
        last.pos + 1 + last.node.content.size,
      ),
    ),
  );
}

run('23. tipos mistos → Vários blocos; conversão bloqueada', () => {
  let state = selectAcross(
    stateFromChildren([
      heading('p-a', DocumentSectionChildrenTypeEnum.H1, 'AAA'),
      paragraph('p-b', 'BBB'),
    ]),
    'p-a',
    'p-b',
  );
  const active = resolveActiveBlock(state);
  assert.equal(active.kind, 'multi');
  assert.equal(labelForActiveBlock(active), 'Vários blocos');
  assert.equal(applyBlockFormatConversion(state, 'H2').ok, false);
  assert.equal(canonicalChild(state, 'p-a').type, 'H1');
  assert.equal(canonicalChild(state, 'p-b').type, 'PARAGRAPH');
});

run('24. conversão marca v2LocalDirty', () => {
  const state = setCursor(stateFromChildren([paragraph('el-a', 'X')]), 'el-a', 0);
  const transaction = createBlockFormatTransaction(state, 'H2');
  assert.ok(transaction);
  assert.equal(transaction.docChanged, true);
  assert.equal(
    shouldBlockOfficialSave({ surface: 'v2', v2LocalDirty: true }),
    true,
  );
});

run('25. save continua bloqueado', () => {
  assert.equal(
    shouldBlockOfficialSave({ surface: 'v2', v2LocalDirty: true }),
    true,
  );
  assert.equal(
    shouldBlockOfficialSave({ surface: 'v1', v2LocalDirty: true }),
    false,
  );
});

run('26. Clássico continua protegido', () => {
  const blocked = requestSurfaceChange({
    current: 'v2',
    next: 'v1',
    v2LocalDirty: true,
  });
  assert.equal(blocked.allowed, false);
});

run('27. Enter depois de P→BULLET cria BULLET', () => {
  let state = convert(stateFromChildren([paragraph('el-a', 'ABCDEF')]), 'el-a', 'BULLET')
    .state;
  state = setCursor(state, 'el-a', 3);
  const split = applyStructuralSplit(state);
  assert.equal(split.ok, true);
  state = applyStableEditableIds(split.state, createSequentialIdFactory());
  assert.deepStrictEqual(
    dumpBlocks(state.doc).map((block) => block.type),
    ['docBullet', 'docBullet'],
  );
});

run('28. Enter depois de BULLET→P cria P', () => {
  let state = convert(stateFromChildren([bullet('el-a', 'ABCDEF')]), 'el-a', 'PARAGRAPH')
    .state;
  state = setCursor(state, 'el-a', 3);
  const split = applyStructuralSplit(state);
  assert.equal(split.ok, true);
  state = applyStableEditableIds(split.state, createSequentialIdFactory());
  assert.deepStrictEqual(
    dumpBlocks(state.doc).map((block) => block.type),
    ['docParagraph', 'docParagraph'],
  );
});

run('29. Fase 3 boundaries continuam intactos', () => {
  let state = stateFromChildren([
    paragraph('p-a', 'Antes'),
    {
      id: 'el-image',
      type: DocumentSectionChildrenTypeEnum.IMAGE,
      text: '',
      url: '/x.png',
    },
    paragraph('p-b', 'Um'),
    paragraph('p-c', 'Dois'),
  ]);
  state = convert(state, 'p-a', 'H2').state;
  state = setCursor(state, 'p-a', 5);
  assert.equal(applyStructuralJoinForward(state).decision.type, 'block');
  state = setCursor(state, 'p-c', 0);
  const joined = applyStructuralJoinBackward(state);
  assert.equal(joined.decision.type, 'join');
  assert.equal(canonicalChild(joined.state, 'p-b').text, 'UmDois');
});

run('30. roundtrip canonical sem perda fora do campo alterado', () => {
  const before = persistJson(modelWithChildren([richParagraph, paragraph('p-b', 'Vizinho')]));
  const converted = convert(stateFromChildren(before.sections[0].children!['section-body']), 'el-rich', 'H2');
  const after = persistJson(restore(converted.state));
  const [firstBefore, secondBefore] = before.sections[0].children!['section-body'];
  const [firstAfter, secondAfter] = after.sections[0].children!['section-body'];
  assert.deepStrictEqual(secondAfter, secondBefore);
  assert.equal(firstAfter.id, firstBefore.id);
  assert.equal(firstAfter.text, firstBefore.text);
  assert.equal(firstAfter.type, 'H2');
  assert.deepStrictEqual(
    firstAfter.removeWithSomeEmptyVars,
    firstBefore.removeWithSomeEmptyVars,
  );
  assert.deepStrictEqual(
    firstAfter.inlineStyleRangeBlock,
    firstBefore.inlineStyleRangeBlock,
  );
  assert.deepStrictEqual(firstAfter.entityRangeBlock, firstBefore.entityRangeBlock);

  const back = convert(converted.state, 'el-rich', 'PARAGRAPH');
  const restored = persistJson(restore(back.state));
  assert.deepStrictEqual(
    restored.sections[0].children!['section-body'][0].type,
    'PARAGRAPH',
  );
  assert.deepStrictEqual(
    restored.sections[0].children!['section-body'][0].inlineStyleRangeBlock,
    firstBefore.inlineStyleRangeBlock,
  );
});

run('guard: conversão explícita H→P é permitida; atom continua protegido', () => {
  const state = setCursor(
    stateFromChildren([
      heading('el-h2', DocumentSectionChildrenTypeEnum.H2, 'Titulo'),
      {
        id: 'el-image',
        type: DocumentSectionChildrenTypeEnum.IMAGE,
        text: '',
        url: '/x.png',
      },
    ]),
    'el-h2',
    0,
  );
  const transaction = createBlockFormatTransaction(state, 'PARAGRAPH');
  assert.ok(transaction);
  assert.equal(
    allowDocumentEditorV2Transaction(transaction, state),
    true,
  );
  assert.equal(
    allowDocumentEditorV2Transaction(
      { docChanged: true, doc: state.doc },
      { doc: state.doc },
    ),
    true,
  );
});

run('Enter em heading convertido continua bloqueado', () => {
  let state = convert(
    stateFromChildren([paragraph('el-a', 'Titulo')]),
    'el-a',
    'H2',
  ).state;
  state = setCursor(state, 'el-a', 3);
  assert.equal(applyStructuralSplit(state).ok, false);
});

const richBulletSpace = {
  id: 'el-space',
  type: DocumentSectionChildrenTypeEnum.BULLET_SPACE,
  text: 'Texto com marca',
  inlineStyleRangeBlock: [
    [{ offset: 0, length: 5, style: InlineStyleTypeEnum.BOLD }],
  ],
  entityRangeBlock: [
    [
      {
        offset: 10,
        length: 5,
        data: {
          type: 'LINK',
          mutability: 'MUTABLE',
          data: { url: 'https://simplesst.com', targetOption: '_blank' },
        },
      },
    ],
  ],
} as IDocumentModelElement;

run('BULLET_SPACE → renderiza como docBullet', () => {
  const state = stateFromChildren([
    {
      id: 'el-space',
      type: DocumentSectionChildrenTypeEnum.BULLET_SPACE,
      text: 'Recuado',
    },
  ]);
  assert.equal(dumpBlocks(state.doc)[0].type, 'docBullet');
  assert.equal(dumpBlocks(state.doc)[0].id, 'el-space');
});

run('BULLET_SPACE default level = 1', () => {
  const state = stateFromChildren([
    {
      id: 'el-space',
      type: DocumentSectionChildrenTypeEnum.BULLET_SPACE,
      text: 'Recuado',
    },
  ]);
  assert.equal(dumpBlocks(state.doc)[0].level, 1);
  assert.equal(resolveActiveBlock(setCursor(state, 'el-space', 0)).kind, 'convertible');
});

run('BULLET_SPACE preserva id, texto, ranges, hyperlink e variável', () => {
  const state = stateFromChildren([
    {
      ...richBulletSpace,
      text: 'Texto com marca ??NOME_DA_EMPRESA??',
    },
  ]);
  const child = canonicalChild(state, 'el-space');
  assert.equal(child.id, 'el-space');
  assert.equal(child.text, 'Texto com marca ??NOME_DA_EMPRESA??');
  assert.equal(child.type, 'BULLET_SPACE');
  assert.ok(
    (child.inlineStyleRangeBlock?.[0] || []).some(
      (range) => range.style === InlineStyleTypeEnum.BOLD,
    ),
  );
  assert.equal(
    child.entityRangeBlock?.[0]?.[0]?.data?.data?.url,
    'https://simplesst.com',
  );
});

run('roundtrip sem edição retorna BULLET_SPACE', () => {
  const before = persistJson(
    modelWithChildren([
      {
        id: 'el-space',
        type: DocumentSectionChildrenTypeEnum.BULLET_SPACE,
        text: 'Recuado',
      },
    ]),
  );
  const state = stateFromChildren(before.sections[0].children!['section-body']);
  assert.deepStrictEqual(persistJson(restore(state)), before);
});

run('BULLET normal continua intacto e level 1 não vira BULLET_SPACE', () => {
  const before = persistJson(
    modelWithChildren([bullet('el-b', 'Normal', { level: 1 })]),
  );
  const state = stateFromChildren(before.sections[0].children!['section-body']);
  assert.equal(dumpBlocks(state.doc)[0].type, 'docBullet');
  assert.equal(dumpBlocks(state.doc)[0].level, 1);
  assert.equal(canonicalChild(state, 'el-b').type, 'BULLET');
  assert.deepStrictEqual(persistJson(restore(state)), before);
});

run('Enter depois de BULLET_SPACE visual cria BULLET', () => {
  let state = stateFromChildren([
    {
      id: 'el-space',
      type: DocumentSectionChildrenTypeEnum.BULLET_SPACE,
      text: 'ABCDEF',
    },
  ]);
  state = setCursor(state, 'el-space', 3);
  const split = applyStructuralSplit(state);
  assert.equal(split.ok, true);
  state = applyStableEditableIds(split.state, createSequentialIdFactory());
  const blocks = dumpBlocks(state.doc);
  assert.deepStrictEqual(
    blocks.map((block) => block.type),
    ['docBullet', 'docBullet'],
  );
  const restored = childrenOf(restore(state));
  assert.equal(restored[0].type, 'BULLET_SPACE');
  assert.equal(restored[0].id, 'el-space');
  assert.equal(restored[1].type, 'BULLET');
  assert.notEqual(restored[1].id, 'el-space');
});

run('BULLET_SPACE: level local não normaliza o canonical', () => {
  let state = setCursor(
    stateFromChildren([
      {
        id: 'el-space',
        type: DocumentSectionChildrenTypeEnum.BULLET_SPACE,
        text: 'Recuado',
      },
    ]),
    'el-space',
    0,
  );
  const changed = applyBulletLevelChange(state, 1);
  assert.equal(changed.ok, true);
  assert.equal(changed.level, 2);
  assert.equal(dumpBlocks(changed.state.doc)[0].level, 2);
  assert.equal(canonicalChild(changed.state, 'el-space').type, 'BULLET_SPACE');
  assert.equal(canonicalChild(changed.state, 'el-space').level, undefined);
});

run('BULLET_SPACE convertido explicitamente assume o novo type', () => {
  const result = convert(
    stateFromChildren([
      {
        id: 'el-space',
        type: DocumentSectionChildrenTypeEnum.BULLET_SPACE,
        text: 'Recuado',
      },
    ]),
    'el-space',
    'H2',
  );
  assert.equal(result.ok, true);
  assert.equal(canonicalChild(result.state, 'el-space').type, 'H2');
});

run('BULLET_SPACE não quebra boundaries da Fase 3', () => {
  let state = stateFromChildren([
    {
      id: 'el-space',
      type: DocumentSectionChildrenTypeEnum.BULLET_SPACE,
      text: 'Antes',
    },
    {
      id: 'el-image',
      type: DocumentSectionChildrenTypeEnum.IMAGE,
      text: '',
      url: '/x.png',
    },
    paragraph('p-b', 'Um'),
    paragraph('p-c', 'Dois'),
  ]);
  state = setCursor(state, 'el-space', 5);
  assert.equal(applyStructuralJoinForward(state).decision.type, 'block');
  state = setCursor(state, 'p-c', 0);
  const joined = applyStructuralJoinBackward(state);
  assert.equal(joined.decision.type, 'join');
  assert.equal(canonicalChild(joined.state, 'p-b').text, 'UmDois');
});

run('vários H1 → toolbar mostra H1', () => {
  const state = selectAcross(
    stateFromChildren([
      heading('h-a', DocumentSectionChildrenTypeEnum.H1, 'Um'),
      heading('h-b', DocumentSectionChildrenTypeEnum.H1, 'Dois'),
      heading('h-c', DocumentSectionChildrenTypeEnum.H1, 'Tres'),
    ]),
    'h-a',
    'h-c',
  );
  const active = resolveActiveBlock(state);
  assert.equal(active.kind, 'convertible');
  assert.equal(active.convertible, true);
  if (active.kind !== 'convertible') throw new Error('expected convertible');
  assert.equal(active.format, 'H1');
  assert.equal(active.blockCount, 3);
  assert.equal(labelForActiveBlock(active), 'H1');
});

run('vários Parágrafos → toolbar mostra Parágrafo', () => {
  const state = selectAcross(
    stateFromChildren([
      paragraph('p-a', 'Um'),
      paragraph('p-b', 'Dois'),
    ]),
    'p-a',
    'p-b',
  );
  const active = resolveActiveBlock(state);
  assert.equal(active.kind, 'convertible');
  if (active.kind !== 'convertible') throw new Error('expected convertible');
  assert.equal(active.format, 'PARAGRAPH');
  assert.equal(labelForActiveBlock(active), 'Parágrafo');
});

run('H2 + Bullet → Vários blocos', () => {
  const state = selectAcross(
    stateFromChildren([
      heading('h-a', DocumentSectionChildrenTypeEnum.H2, 'Titulo'),
      bullet('b-a', 'Item'),
    ]),
    'h-a',
    'b-a',
  );
  assert.equal(labelForActiveBlock(resolveActiveBlock(state)), 'Vários blocos');
});

run('Parágrafo + Caption → Vários blocos', () => {
  const state = selectAcross(
    stateFromChildren([
      paragraph('p-a', 'Texto'),
      {
        id: 'c-a',
        type: DocumentSectionChildrenTypeEnum.LEGEND,
        text: 'Legenda',
      },
    ]),
    'p-a',
    'c-a',
  );
  assert.equal(labelForActiveBlock(resolveActiveBlock(state)), 'Vários blocos');
});

run('vários H1 → Parágrafo em uma transaction', () => {
  const state = selectAcross(
    stateFromChildren([
      heading('h-a', DocumentSectionChildrenTypeEnum.H1, 'Um'),
      heading('h-b', DocumentSectionChildrenTypeEnum.H1, 'Dois'),
      heading('h-c', DocumentSectionChildrenTypeEnum.H1, 'Tres'),
      heading('h-d', DocumentSectionChildrenTypeEnum.H1, 'Quatro'),
      heading('h-e', DocumentSectionChildrenTypeEnum.H1, 'Cinco'),
    ]),
    'h-a',
    'h-e',
  );
  const transaction = createBlockFormatTransaction(state, 'PARAGRAPH');
  assert.ok(transaction);
  assert.equal(transaction.docChanged, true);
  assert.ok(transaction.steps.length >= 5);
  const result = applyBlockFormatConversion(state, 'PARAGRAPH');
  assert.equal(result.ok, true);
  const types = childrenOf(restore(result.state)).map((child) => child.type);
  assert.deepStrictEqual(types, [
    'PARAGRAPH',
    'PARAGRAPH',
    'PARAGRAPH',
    'PARAGRAPH',
    'PARAGRAPH',
  ]);
  assert.deepStrictEqual(
    dumpBlocks(result.state.doc).map((block) => block.id),
    ['h-a', 'h-b', 'h-c', 'h-d', 'h-e'],
  );
});

run('vários Parágrafos → H2', () => {
  const state = selectAcross(
    stateFromChildren([
      paragraph('p-a', 'Um'),
      paragraph('p-b', 'Dois'),
      paragraph('p-c', 'Tres'),
    ]),
    'p-a',
    'p-c',
  );
  const result = applyBlockFormatConversion(state, 'H2');
  assert.equal(result.ok, true);
  assert.deepStrictEqual(
    childrenOf(restore(result.state)).map((child) => child.type),
    ['H2', 'H2', 'H2'],
  );
});

run('batch: marks, link, variável e ids preservados', () => {
  const marked = (id: string, text: string): IDocumentModelElement =>
    paragraph(id, text, {
      inlineStyleRangeBlock: [
        [
          { offset: 0, length: 4, style: InlineStyleTypeEnum.BOLD },
          { offset: 0, length: 4, style: InlineStyleTypeEnum.ITALIC },
          { offset: 0, length: 4, style: InlineStyleTypeEnum.UNDERLINE },
          {
            offset: 5,
            length: 4,
            style: InlineStyleTypeEnum.COLOR,
            value: '#FF0000',
          },
          {
            offset: 5,
            length: 4,
            style: InlineStyleTypeEnum.FONTSIZE,
            value: '18',
          },
          { offset: 10, length: 3, style: InlineStyleTypeEnum.SUPERSCRIPT },
        ],
      ],
      entityRangeBlock: [
        [
          {
            offset: 14,
            length: 4,
            data: {
              type: 'LINK',
              mutability: 'MUTABLE',
              data: { url: 'https://simplesst.com', targetOption: '_blank' },
            },
          },
        ],
      ],
    });

  const state = selectAcross(
    stateFromChildren([
      marked('p-a', 'Bold texto sup link ??NOME_DA_EMPRESA??'),
      marked('p-b', 'Bold texto sup link ??NOME_DA_EMPRESA??'),
    ]),
    'p-a',
    'p-b',
  );
  const result = applyBlockFormatConversion(state, 'H3');
  assert.equal(result.ok, true);

  for (const id of ['p-a', 'p-b']) {
    const child = canonicalChild(result.state, id);
    assert.equal(child.type, 'H3');
    assert.equal(child.id, id);
    assert.equal(child.text, 'Bold texto sup link ??NOME_DA_EMPRESA??');
    const styles = child.inlineStyleRangeBlock?.[0] || [];
    assert.ok(styles.some((range) => range.style === InlineStyleTypeEnum.BOLD));
    assert.ok(styles.some((range) => range.style === InlineStyleTypeEnum.ITALIC));
    assert.ok(
      styles.some((range) => range.style === InlineStyleTypeEnum.UNDERLINE),
    );
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
    assert.ok(
      styles.some((range) => range.style === InlineStyleTypeEnum.SUPERSCRIPT),
    );
    assert.equal(
      child.entityRangeBlock?.[0]?.[0]?.data?.data?.url,
      'https://simplesst.com',
    );
  }
});

run('atom no range bloqueia a conversão inteira', () => {
  let state = stateFromChildren([
    paragraph('p-a', 'Antes'),
    {
      id: 'el-image',
      type: DocumentSectionChildrenTypeEnum.IMAGE,
      text: '',
      url: '/x.png',
    },
    paragraph('p-b', 'Depois'),
  ]);
  const first = findBlockPos(state.doc, 'p-a');
  const last = findBlockPos(state.doc, 'p-b');
  state = state.apply(
    state.tr.setSelection(
      TextSelection.create(
        state.doc,
        first.pos + 1,
        last.pos + 1 + last.node.content.size,
      ),
    ),
  );
  assert.equal(resolveActiveBlock(state).kind, 'multi');
  assert.equal(applyBlockFormatConversion(state, 'H2').ok, false);
  assert.equal(canonicalChild(state, 'p-a').type, 'PARAGRAPH');
  assert.equal(canonicalChild(state, 'p-b').type, 'PARAGRAPH');
  assert.equal(canonicalChild(state, 'el-image').type, 'IMAGE');
});

run('Undo desfaz a conversão inteira', () => {
  const selected = selectAcross(
    stateFromChildrenWithHistory([
      heading('h-a', DocumentSectionChildrenTypeEnum.H1, 'Um'),
      heading('h-b', DocumentSectionChildrenTypeEnum.H1, 'Dois'),
    ]),
    'h-a',
    'h-b',
  );
  const converted = applyBlockFormatConversion(selected, 'PARAGRAPH');
  assert.equal(converted.ok, true);
  assert.equal(canonicalChild(converted.state, 'h-a').type, 'PARAGRAPH');
  let undone = converted.state;
  const ok = undo(converted.state, (tr) => {
    undone = converted.state.apply(tr);
  });
  assert.equal(ok, true);
  assert.equal(canonicalChild(undone, 'h-a').type, 'H1');
  assert.equal(canonicalChild(undone, 'h-b').type, 'H1');
});

run('dirty só quando há mudança real', () => {
  const same = selectAcross(
    stateFromChildren([
      paragraph('p-a', 'Um'),
      paragraph('p-b', 'Dois'),
    ]),
    'p-a',
    'p-b',
  );
  assert.equal(createBlockFormatTransaction(same, 'PARAGRAPH'), null);

  const changed = createBlockFormatTransaction(same, 'H2');
  assert.ok(changed);
  assert.equal(changed.docChanged, true);
});

run('seleção parcial em um bloco converte só aquele bloco', () => {
  let state = stateFromChildren([
    paragraph('p-a', 'ABCDEF'),
    paragraph('p-b', 'XYZ'),
  ]);
  const first = findBlockPos(state.doc, 'p-a');
  state = state.apply(
    state.tr.setSelection(
      TextSelection.create(state.doc, first.pos + 1, first.pos + 4),
    ),
  );
  const result = applyBlockFormatConversion(state, 'H2');
  assert.equal(result.ok, true);
  assert.equal(canonicalChild(result.state, 'p-a').type, 'H2');
  assert.equal(canonicalChild(result.state, 'p-b').type, 'PARAGRAPH');
});

run('seleção do meio de um bloco ao outro converte os dois', () => {
  let state = stateFromChildren([
    paragraph('p-a', 'ABCDEF'),
    paragraph('p-b', 'XYZ'),
  ]);
  const first = findBlockPos(state.doc, 'p-a');
  const second = findBlockPos(state.doc, 'p-b');
  state = state.apply(
    state.tr.setSelection(
      TextSelection.create(state.doc, first.pos + 3, second.pos + 2),
    ),
  );
  const result = applyBlockFormatConversion(state, 'H2');
  assert.equal(result.ok, true);
  assert.equal(canonicalChild(result.state, 'p-a').type, 'H2');
  assert.equal(canonicalChild(result.state, 'p-b').type, 'H2');
});

run('bullets iguais → Bullet; captions iguais → Legenda', () => {
  const bullets = selectAcross(
    stateFromChildren([
      bullet('b-a', 'Um', { level: 1 }),
      bullet('b-b', 'Dois', { level: 2 }),
    ]),
    'b-a',
    'b-b',
  );
  const bulletActive = resolveActiveBlock(bullets);
  assert.equal(bulletActive.kind, 'convertible');
  if (bulletActive.kind !== 'convertible') throw new Error('expected bullet');
  assert.equal(bulletActive.format, 'BULLET');
  assert.equal(labelForActiveBlock(bulletActive), 'Marcador');

  const captions = selectAcross(
    stateFromChildren([
      {
        id: 'c-a',
        type: DocumentSectionChildrenTypeEnum.LEGEND,
        text: 'Um',
      },
      {
        id: 'c-b',
        type: DocumentSectionChildrenTypeEnum.LEGEND,
        text: 'Dois',
      },
    ]),
    'c-a',
    'c-b',
  );
  const captionActive = resolveActiveBlock(captions);
  assert.equal(captionActive.kind, 'caption');
  assert.equal(captionActive.convertible, false);
  assert.equal(labelForActiveBlock(captionActive), 'Legenda');
  assert.equal(applyBlockFormatConversion(captions, 'PARAGRAPH').ok, false);
});

run('heading + heading iguais', () => {
  const state = selectAcross(
    stateFromChildren([
      heading('h-a', DocumentSectionChildrenTypeEnum.H3, 'Um'),
      heading('h-b', DocumentSectionChildrenTypeEnum.H3, 'Dois'),
    ]),
    'h-a',
    'h-b',
  );
  const active = resolveActiveBlock(state);
  assert.equal(active.kind, 'convertible');
  if (active.kind !== 'convertible') throw new Error('expected H3');
  assert.equal(active.format, 'H3');
  assert.equal(labelForActiveBlock(active), 'H3');
});

console.log('\nFase 4A block-format specs: ok');
