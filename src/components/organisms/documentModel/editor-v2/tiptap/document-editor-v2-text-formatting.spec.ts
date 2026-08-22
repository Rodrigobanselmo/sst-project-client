/**
 * Fase 4B — formatação visual/editorial (EditorState, sem React).
 *
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/documentModel/editor-v2/tiptap/document-editor-v2-text-formatting.spec.ts
 */
import assert from 'assert';

import { getSchema } from '@tiptap/core';
import { Node } from '@tiptap/pm/model';
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
import { TEXT_FORMAT_NON_CANONICAL_FIELDS } from '../domain/text-format';
import { shouldBlockOfficialSave } from '../integration/document-editor-v2-session';
import { applyBlockFormatConversion } from './apply-block-format';
import {
  applyBlockAlign,
  applyBlockColor,
  applyBlockLineHeight,
  applyBlockSize,
  applyColorCommand,
  applyHighlight,
  applyInlineColor,
  applyInlineFontSize,
  applySizeCommand,
  applySubscript,
  applySuperscript,
  createBlockVisualTransaction,
  resolveTextFormatToolbarState,
} from './apply-text-format';
import { createDocumentEditorExtensions } from './extensions/create-document-editor-extensions';
import { fromTipTapState } from './from-tiptap-state';
import { serializeTipTapDoc } from './schema';
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

function setCursor(state: EditorState, id: string, offset: number) {
  const found = findBlockPos(state.doc, id);
  return state.apply(
    state.tr.setSelection(
      TextSelection.create(state.doc, found.pos + 1 + offset),
    ),
  );
}

function setRange(
  state: EditorState,
  id: string,
  from: number,
  to: number,
) {
  const found = findBlockPos(state.doc, id);
  return state.apply(
    state.tr.setSelection(
      TextSelection.create(
        state.doc,
        found.pos + 1 + from,
        found.pos + 1 + to,
      ),
    ),
  );
}

function restore(state: EditorState) {
  return fromDocumentEditorState(fromTipTapState(state.doc.toJSON()));
}

function childrenOf(model: IDocumentModelData) {
  return model.sections[0].children?.['section-body'] || [];
}

function canonicalChild(state: EditorState, id: string) {
  const child = childrenOf(restore(state)).find((item) => item.id === id);
  if (!child) throw new Error(`canonical ${id} not found`);
  return child;
}

function addMark(
  state: EditorState,
  id: string,
  from: number,
  to: number,
  mark: ReturnType<EditorState['schema']['marks'][string]['create']>,
) {
  const found = findBlockPos(state.doc, id);
  return state.apply(
    state.tr.addMark(found.pos + 1 + from, found.pos + 1 + to, mark),
  );
}

const richParagraph = paragraph('el-rich', 'Texto com marca', {
  removeWithSomeEmptyVars: ['A'],
  removeWithAllEmptyVars: ['B'],
  removeWithAllValidVars: ['C'],
  addWithAllVars: ['D'],
  align: DocModelAlignmentType.START,
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

run('1. P start', () => {
  const result = applyBlockAlign(
    setCursor(stateFromChildren([paragraph('el-a', 'Texto')]), 'el-a', 0),
    DocModelAlignmentType.START,
  );
  assert.equal(result.ok, true);
  assert.equal(canonicalChild(result.state, 'el-a').align, 'start');
});

run('2. P center', () => {
  const result = applyBlockAlign(
    setCursor(stateFromChildren([paragraph('el-a', 'Texto')]), 'el-a', 0),
    DocModelAlignmentType.CENTER,
  );
  assert.equal(canonicalChild(result.state, 'el-a').align, 'center');
});

run('3. P end', () => {
  const result = applyBlockAlign(
    setCursor(stateFromChildren([paragraph('el-a', 'Texto')]), 'el-a', 0),
    DocModelAlignmentType.END,
  );
  assert.equal(canonicalChild(result.state, 'el-a').align, 'end');
});

run('4. P both', () => {
  const result = applyBlockAlign(
    setCursor(stateFromChildren([paragraph('el-a', 'Texto')]), 'el-a', 0),
    DocModelAlignmentType.BOTH,
  );
  assert.equal(canonicalChild(result.state, 'el-a').align, 'both');
});

run('5. id preservado no align', () => {
  const result = applyBlockAlign(
    setCursor(stateFromChildren([paragraph('el-a', 'Texto')]), 'el-a', 0),
    DocModelAlignmentType.CENTER,
  );
  assert.equal(canonicalChild(result.state, 'el-a').id, 'el-a');
});

run('6. source / attrs opacos preservados no align', () => {
  const result = applyBlockAlign(
    setCursor(stateFromChildren([richParagraph]), 'el-rich', 0),
    DocModelAlignmentType.BOTH,
  );
  const child = canonicalChild(result.state, 'el-rich');
  assert.equal(child.text, 'Texto com marca');
  assert.deepStrictEqual(child.removeWithSomeEmptyVars, ['A']);
  assert.deepStrictEqual(child.inlineStyleRangeBlock, richParagraph.inlineStyleRangeBlock);
  assert.deepStrictEqual(child.entityRangeBlock, richParagraph.entityRangeBlock);
});

run('7. block size', () => {
  const result = applyBlockSize(
    setCursor(stateFromChildren([paragraph('el-a', 'Texto')]), 'el-a', 0),
    16,
  );
  assert.equal(canonicalChild(result.state, 'el-a').size, 16);
  assert.equal(
    canonicalChild(result.state, 'el-a').inlineStyleRangeBlock,
    undefined,
  );
});

run('8. inline FONTSIZE', () => {
  const result = applyInlineFontSize(
    setRange(stateFromChildren([paragraph('el-a', 'Texto longo')]), 'el-a', 0, 5),
    18,
  );
  const child = canonicalChild(result.state, 'el-a');
  assert.equal(child.size, undefined);
  assert.ok(
    (child.inlineStyleRangeBlock?.[0] || []).some(
      (range) =>
        range.style === InlineStyleTypeEnum.FONTSIZE &&
        range.value === '18' &&
        range.offset === 0 &&
        range.length === 5,
    ),
  );
});

run('9. size não apaga ranges existentes', () => {
  const result = applyBlockSize(
    setCursor(stateFromChildren([richParagraph]), 'el-rich', 0),
    24,
  );
  const child = canonicalChild(result.state, 'el-rich');
  assert.equal(child.size, 24);
  assert.deepStrictEqual(
    child.inlineStyleRangeBlock,
    richParagraph.inlineStyleRangeBlock,
  );
  assert.deepStrictEqual(child.entityRangeBlock, richParagraph.entityRangeBlock);
});

run('10. block color', () => {
  const result = applyBlockColor(
    setCursor(stateFromChildren([paragraph('el-a', 'Texto')]), 'el-a', 0),
    '#0000FF',
  );
  assert.equal(canonicalChild(result.state, 'el-a').color, '#0000FF');
});

run('11. inline COLOR', () => {
  const result = applyInlineColor(
    setRange(stateFromChildren([paragraph('el-a', 'Texto longo')]), 'el-a', 6, 11),
    '#FF0000',
  );
  const child = canonicalChild(result.state, 'el-a');
  assert.equal(child.color, undefined);
  assert.ok(
    (child.inlineStyleRangeBlock?.[0] || []).some(
      (range) =>
        range.style === InlineStyleTypeEnum.COLOR &&
        range.value === '#FF0000' &&
        range.offset === 6,
    ),
  );
});

run('12. reset/default color', () => {
  let state = applyBlockColor(
    setCursor(stateFromChildren([paragraph('el-a', 'Texto', { color: '#111' })]), 'el-a', 0),
    null,
  ).state;
  assert.equal(canonicalChild(state, 'el-a').color, undefined);
  state = applyInlineColor(
    setRange(
      stateFromChildren([
        paragraph('el-b', 'Texto longo', {
          inlineStyleRangeBlock: [
            [
              {
                offset: 0,
                length: 5,
                style: InlineStyleTypeEnum.COLOR,
                value: '#FF0000',
              },
            ],
          ],
        }),
      ]),
      'el-b',
      0,
      5,
    ),
    null,
  ).state;
  assert.ok(
    !(canonicalChild(state, 'el-b').inlineStyleRangeBlock?.[0] || []).some(
      (range) => range.style === InlineStyleTypeEnum.COLOR,
    ),
  );
});

run('13. COLOR não remove bold/link', () => {
  const result = applyInlineColor(
    setRange(stateFromChildren([richParagraph]), 'el-rich', 0, 5),
    '#0000FF',
  );
  const child = canonicalChild(result.state, 'el-rich');
  assert.ok(
    (child.inlineStyleRangeBlock?.[0] || []).some(
      (range) => range.style === InlineStyleTypeEnum.BOLD,
    ),
  );
  assert.ok(
    (child.inlineStyleRangeBlock?.[0] || []).some(
      (range) => range.style === InlineStyleTypeEnum.COLOR,
    ),
  );
  assert.equal(
    child.entityRangeBlock?.[0]?.[0]?.data?.data?.url,
    'https://simplesst.com',
  );
});

run('14. BG_COLOR', () => {
  const result = applyHighlight(
    setRange(stateFromChildren([paragraph('el-a', 'Texto longo')]), 'el-a', 0, 5),
    '#FFFF00',
  );
  assert.ok(
    (canonicalChild(result.state, 'el-a').inlineStyleRangeBlock?.[0] || []).some(
      (range) =>
        range.style === InlineStyleTypeEnum.BG_COLOR &&
        range.value === '#FFFF00',
    ),
  );
});

run('15. reset BG_COLOR', () => {
  const result = applyHighlight(
    setRange(
      stateFromChildren([
        paragraph('el-a', 'Texto longo', {
          inlineStyleRangeBlock: [
            [
              {
                offset: 0,
                length: 5,
                style: InlineStyleTypeEnum.BG_COLOR,
                value: '#FFFF00',
              },
            ],
          ],
        }),
      ]),
      'el-a',
      0,
      5,
    ),
    null,
  );
  assert.ok(
    !(canonicalChild(result.state, 'el-a').inlineStyleRangeBlock?.[0] || []).some(
      (range) => range.style === InlineStyleTypeEnum.BG_COLOR,
    ),
  );
});

run('16. lineHeight', () => {
  const result = applyBlockLineHeight(
    setCursor(stateFromChildren([paragraph('el-a', 'Uma linha')]), 'el-a', 0),
    1.5,
  );
  const child = canonicalChild(result.state, 'el-a');
  assert.equal(child.lineHeight, 1.5);
  assert.deepStrictEqual(child.lineHeightBlock, [1.5]);
});

run('17. lineHeightBlock por linha', () => {
  const result = applyBlockLineHeight(
    setCursor(
      stateFromChildren([paragraph('el-a', 'Linha um\nLinha dois')]),
      'el-a',
      0,
    ),
    2,
  );
  const child = canonicalChild(result.state, 'el-a');
  assert.equal(child.lineHeight, 2);
  assert.deepStrictEqual(child.lineHeightBlock, [2, 2]);
});

run('18. mixed não normaliza no load', () => {
  const before = persistJson(
    modelWithChildren([
      paragraph('el-a', 'Linha um\nLinha dois', {
        lineHeightBlock: [1, 2],
      }),
    ]),
  );
  const restored = persistJson(
    restore(stateFromChildren(before.sections[0].children!['section-body'])),
  );
  assert.deepStrictEqual(
    restored.sections[0].children!['section-body'][0].lineHeightBlock,
    [1, 2],
  );
  assert.equal(
    restored.sections[0].children!['section-body'][0].lineHeight,
    undefined,
  );
  const ui = resolveTextFormatToolbarState(
    setCursor(
      stateFromChildren(before.sections[0].children!['section-body']),
      'el-a',
      0,
    ),
  );
  assert.equal(ui.lineHeight.kind, 'mixed');
});

run('19. superscript', () => {
  const result = applySuperscript(
    setRange(stateFromChildren([paragraph('el-a', 'x2 extra')]), 'el-a', 1, 2),
  );
  assert.ok(
    (canonicalChild(result.state, 'el-a').inlineStyleRangeBlock?.[0] || []).some(
      (range) => range.style === InlineStyleTypeEnum.SUPERSCRIPT,
    ),
  );
});

run('20. subscript', () => {
  const result = applySubscript(
    setRange(stateFromChildren([paragraph('el-a', 'H2O extra')]), 'el-a', 1, 2),
  );
  assert.ok(
    (canonicalChild(result.state, 'el-a').inlineStyleRangeBlock?.[0] || []).some(
      (range) => range.style === InlineStyleTypeEnum.SUBSCRIPT,
    ),
  );
});

run('21. exclusão mútua super/sub', () => {
  let state = applySuperscript(
    setRange(stateFromChildren([paragraph('el-a', 'x2 extra')]), 'el-a', 1, 2),
  ).state;
  state = applySubscript(setRange(state, 'el-a', 1, 2)).state;
  const styles = canonicalChild(state, 'el-a').inlineStyleRangeBlock?.[0] || [];
  assert.ok(styles.some((range) => range.style === InlineStyleTypeEnum.SUBSCRIPT));
  assert.ok(
    !styles.some((range) => range.style === InlineStyleTypeEnum.SUPERSCRIPT),
  );
});

run('22. roundtrip super/sub', () => {
  const model = modelWithChildren([
    paragraph('el-a', 'x2 extra', {
      inlineStyleRangeBlock: [
        [{ offset: 1, length: 1, style: InlineStyleTypeEnum.SUPERSCRIPT }],
      ],
    }),
  ]);
  const restored = persistJson(
    restore(stateFromChildren(model.sections[0].children!['section-body'])),
  );
  assert.deepStrictEqual(
    restored.sections[0].children!['section-body'][0].inlineStyleRangeBlock,
    model.sections[0].children!['section-body'][0].inlineStyleRangeBlock,
  );
});

run('23. bold + color', () => {
  let state = addMark(
    setCursor(stateFromChildren([paragraph('el-a', 'Texto')]), 'el-a', 0),
    'el-a',
    0,
    5,
    schema.marks.bold.create(),
  );
  state = applyInlineColor(setRange(state, 'el-a', 0, 5), '#0000FF').state;
  const styles = canonicalChild(state, 'el-a').inlineStyleRangeBlock?.[0] || [];
  assert.ok(styles.some((range) => range.style === InlineStyleTypeEnum.BOLD));
  assert.ok(styles.some((range) => range.style === InlineStyleTypeEnum.COLOR));
});

run('24. link + color', () => {
  const result = applyInlineColor(
    setRange(stateFromChildren([richParagraph]), 'el-rich', 10, 15),
    '#00AA00',
  );
  const child = canonicalChild(result.state, 'el-rich');
  assert.equal(
    child.entityRangeBlock?.[0]?.[0]?.data?.data?.url,
    'https://simplesst.com',
  );
  assert.ok(
    (child.inlineStyleRangeBlock?.[0] || []).some(
      (range) => range.style === InlineStyleTypeEnum.COLOR,
    ),
  );
});

run('25. fontsize + bold', () => {
  let state = addMark(
    setCursor(stateFromChildren([paragraph('el-a', 'Texto')]), 'el-a', 0),
    'el-a',
    0,
    5,
    schema.marks.bold.create(),
  );
  state = applyInlineFontSize(setRange(state, 'el-a', 0, 5), 14).state;
  const styles = canonicalChild(state, 'el-a').inlineStyleRangeBlock?.[0] || [];
  assert.ok(styles.some((range) => range.style === InlineStyleTypeEnum.BOLD));
  assert.ok(styles.some((range) => range.style === InlineStyleTypeEnum.FONTSIZE));
});

run('26. variável com style antes/depois', () => {
  const result = applyInlineColor(
    setRange(
      stateFromChildren([
        paragraph('el-a', 'Antes ??NOME_DA_EMPRESA?? depois'),
      ]),
      'el-a',
      0,
      6,
    ),
    '#0000FF',
  );
  const child = canonicalChild(result.state, 'el-a');
  assert.equal(child.text, 'Antes ??NOME_DA_EMPRESA?? depois');
  assert.ok(child.text.includes('??NOME_DA_EMPRESA??'));
});

run('27. variável não corrompida (expansão do token)', () => {
  let state = stateFromChildren([
    paragraph('el-a', 'Antes ??NOME_DA_EMPRESA?? depois'),
  ]);
  let variablePos = -1;
  state.doc.descendants((node, pos) => {
    if (node.type.name === 'docVariable' && node.attrs.type === 'NOME_DA_EMPRESA') {
      variablePos = pos;
      return false;
    }
  });
  assert.ok(variablePos >= 0);
  state = state.apply(
    state.tr.setSelection(
      TextSelection.create(state.doc, variablePos, variablePos + 1),
    ),
  );
  const result = applyInlineColor(state, '#FF0000');
  const child = canonicalChild(result.state, 'el-a');
  assert.equal(child.text, 'Antes ??NOME_DA_EMPRESA?? depois');
  assert.ok(child.text.includes('??NOME_DA_EMPRESA??'));
  const color = (child.inlineStyleRangeBlock?.[0] || []).find(
    (range) => range.style === InlineStyleTypeEnum.COLOR,
  );
  assert.ok(color);
  assert.equal(
    child.text.slice(color!.offset, color!.offset + color!.length),
    '??NOME_DA_EMPRESA??',
  );
});

run('28. P→BULLET mantém formatação', () => {
  let state = applyBlockAlign(
    setCursor(stateFromChildren([richParagraph]), 'el-rich', 0),
    DocModelAlignmentType.CENTER,
  ).state;
  state = applyBlockFormatConversion(state, 'BULLET').state;
  const child = canonicalChild(state, 'el-rich');
  assert.equal(child.type, 'BULLET');
  assert.equal(child.align, 'center');
  assert.deepStrictEqual(
    child.inlineStyleRangeBlock,
    richParagraph.inlineStyleRangeBlock,
  );
});

run('29. BULLET→P mantém formatação', () => {
  let state = applyInlineColor(
    setRange(
      stateFromChildren([bullet('el-a', 'Item marcado', { level: 1 })]),
      'el-a',
      0,
      4,
    ),
    '#0000FF',
  ).state;
  state = applyBlockFormatConversion(state, 'PARAGRAPH').state;
  const child = canonicalChild(state, 'el-a');
  assert.equal(child.type, 'PARAGRAPH');
  assert.ok(
    (child.inlineStyleRangeBlock?.[0] || []).some(
      (range) => range.style === InlineStyleTypeEnum.COLOR,
    ),
  );
});

run('30. H2 mantém formatação e headingType', () => {
  let state = applyBlockAlign(
    setCursor(
      stateFromChildren([
        heading('el-h2', DocumentSectionChildrenTypeEnum.H2, 'Titulo azul'),
      ]),
      'el-h2',
      0,
    ),
    DocModelAlignmentType.CENTER,
  ).state;
  state = applyInlineColor(setRange(state, 'el-h2', 0, 6), '#0000FF').state;
  const child = canonicalChild(state, 'el-h2');
  assert.equal(child.type, 'H2');
  assert.equal(child.align, 'center');
  assert.ok(
    (child.inlineStyleRangeBlock?.[0] || []).some(
      (range) => range.style === InlineStyleTypeEnum.COLOR,
    ),
  );
});

run('31. atom bloqueado', () => {
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
  assert.equal(applyBlockAlign(state, DocModelAlignmentType.CENTER).ok, false);
  assert.equal(applyBlockSize(state, 16).ok, false);
  assert.equal(applyColorCommand(state, '#FF0000').ok, false);
  assert.equal(canonicalChild(state, 'el-image').type, 'IMAGE');
  assert.equal(canonicalChild(state, 'el-image').color, undefined);
});

run('32. multi-block block-format protegido', () => {
  let state = stateFromChildren([
    paragraph('p-a', 'AAA'),
    paragraph('p-b', 'BBB'),
  ]);
  const first = findBlockPos(state.doc, 'p-a');
  const second = findBlockPos(state.doc, 'p-b');
  state = state.apply(
    state.tr.setSelection(
      TextSelection.create(state.doc, first.pos + 1, second.pos + 2),
    ),
  );
  assert.equal(applyBlockAlign(state, DocModelAlignmentType.CENTER).ok, false);
  assert.equal(applyBlockLineHeight(state, 2).ok, false);
  assert.equal(canonicalChild(state, 'p-a').align, undefined);
  assert.equal(canonicalChild(state, 'p-b').align, undefined);
});

run('33. v2LocalDirty / transação visual', () => {
  const state = setCursor(stateFromChildren([paragraph('el-a', 'X')]), 'el-a', 0);
  const transaction = createBlockVisualTransaction(state, {
    align: DocModelAlignmentType.CENTER,
  });
  assert.ok(transaction);
  assert.equal(transaction.docChanged, true);
  assert.equal(
    shouldBlockOfficialSave({ surface: 'v2', v2LocalDirty: true }),
    true,
  );
});

run('34. save continua bloqueado', () => {
  assert.equal(
    shouldBlockOfficialSave({ surface: 'v2', v2LocalDirty: true }),
    true,
  );
  assert.equal(
    shouldBlockOfficialSave({ surface: 'v1', v2LocalDirty: true }),
    false,
  );
});

run('35. roundtrip sem edição idêntico', () => {
  const before = persistJson(modelWithChildren([richParagraph, paragraph('p-b', 'Vizinho')]));
  const after = persistJson(
    restore(stateFromChildren(before.sections[0].children!['section-body'])),
  );
  assert.deepStrictEqual(after, before);
});

run('36. somente campo alterado muda', () => {
  const before = persistJson(modelWithChildren([richParagraph, paragraph('p-b', 'Vizinho')]));
  const result = applyBlockAlign(
    setCursor(
      stateFromChildren(before.sections[0].children!['section-body']),
      'el-rich',
      0,
    ),
    DocModelAlignmentType.END,
  );
  const after = persistJson(restore(result.state));
  assert.deepStrictEqual(
    after.sections[0].children!['section-body'][1],
    before.sections[0].children!['section-body'][1],
  );
  const first = after.sections[0].children!['section-body'][0];
  assert.equal(first.align, 'end');
  assert.equal(first.size, 12);
  assert.deepStrictEqual(first.inlineStyleRangeBlock, richParagraph.inlineStyleRangeBlock);
});

run('37. attrs opacos intactos', () => {
  const result = applySizeCommand(
    setCursor(stateFromChildren([richParagraph]), 'el-rich', 0),
    30,
  );
  const child = canonicalChild(result.state, 'el-rich');
  assert.deepStrictEqual(child.removeWithAllEmptyVars, ['B']);
  assert.deepStrictEqual(child.addWithAllVars, ['D']);
});

run('38. BULLET_SPACE continua canonical BULLET_SPACE', () => {
  const result = applyBlockAlign(
    setCursor(
      stateFromChildren([
        {
          id: 'el-space',
          type: DocumentSectionChildrenTypeEnum.BULLET_SPACE,
          text: 'Recuado',
        },
      ]),
      'el-space',
      0,
    ),
    DocModelAlignmentType.CENTER,
  );
  const child = canonicalChild(result.state, 'el-space');
  assert.equal(child.type, 'BULLET_SPACE');
  assert.equal(child.align, 'center');
  assert.equal(child.id, 'el-space');
});

run('não inventa paragraphSpacing / margin / indent', () => {
  const result = applyBlockLineHeight(
    setCursor(stateFromChildren([paragraph('el-a', 'Texto')]), 'el-a', 0),
    1.5,
  );
  const child = canonicalChild(result.state, 'el-a') as unknown as Record<
    string,
    unknown
  >;
  TEXT_FORMAT_NON_CANONICAL_FIELDS.forEach((key) => {
    assert.equal(key in child, false, `campo inventado: ${key}`);
  });
  assert.equal('paragraphSpacing' in child, false);
});

run('BG_COLOR sem seleção não aplica no bloco', () => {
  const result = applyHighlight(
    setCursor(stateFromChildren([paragraph('el-a', 'Texto')]), 'el-a', 0),
    '#FFFF00',
  );
  assert.equal(result.ok, false);
  assert.equal(
    canonicalChild(result.state, 'el-a').color,
    undefined,
  );
});

run('size command: cursor = bloco; seleção = FONTSIZE', () => {
  const block = applySizeCommand(
    setCursor(stateFromChildren([paragraph('el-a', 'Texto longo')]), 'el-a', 0),
    12,
  );
  assert.equal(canonicalChild(block.state, 'el-a').size, 12);
  const inline = applySizeCommand(
    setRange(stateFromChildren([paragraph('el-b', 'Texto longo')]), 'el-b', 0, 5),
    12,
  );
  assert.equal(canonicalChild(inline.state, 'el-b').size, undefined);
  assert.ok(
    (canonicalChild(inline.state, 'el-b').inlineStyleRangeBlock?.[0] || []).some(
      (range) => range.style === InlineStyleTypeEnum.FONTSIZE,
    ),
  );
});

console.log('\nFase 4B text-formatting: ok');
