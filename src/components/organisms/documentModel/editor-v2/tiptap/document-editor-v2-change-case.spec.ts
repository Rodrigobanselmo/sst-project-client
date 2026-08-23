/**
 * Fase 7A — Change Case / capitalização (EditorState, sem React).
 *
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/documentModel/editor-v2/tiptap/document-editor-v2-change-case.spec.ts
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';

import { getSchema } from '@tiptap/core';
import { history, redo, undo } from '@tiptap/pm/history';
import { Node } from '@tiptap/pm/model';
import { EditorState, NodeSelection, TextSelection } from '@tiptap/pm/state';
import {
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
import { buildDocumentEditorCandidate } from '../domain/build-document-editor-candidate';
import { assertAllowedCanonicalDiff, canonicalDiff } from '../domain/canonical-diff';
import { createSequentialIdFactory } from '../domain/document-editor-id';
import {
  createSectionSelection,
  projectEditorSlice,
} from '../domain/document-editor-slice';
import {
  CHANGE_CASE_CYCLE_TOOLTIP,
  CHANGE_CASE_MENU_ITEMS,
  classifySelectedTextCase,
  createTextCaseStreamState,
  resolveShiftF3Mode,
  toLocaleLowerPtBr,
  toLocaleUpperPtBr,
  transformTextCaseChunk,
} from '../domain/text-case';
import { resolveDocumentEditorV2Access } from '../integration/document-editor-v2-access';
import {
  DOCUMENT_MODEL_CONFLICT,
  DOCUMENT_MODEL_CONFLICT_TITLE,
  isDocumentModelConflict,
} from '../../../modals/ModalEditDocumentModel/helpers/document-model-optimistic-lock';
import {
  applyChangeCase,
  applyCycledChangeCase,
  collectSelectedHumanText,
  createChangeCaseTransaction,
  createCycledChangeCaseTransaction,
  isChangeCaseEnabled,
  resolveCycledChangeCaseMode,
} from './apply-text-case';
import { hasPartialTextSelection, selectionTouchesAtom } from './apply-text-format';
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
  variables: IDocumentModelData['variables'] = [
    { type: 'NOME_DA_EMPRESA', label: 'Empresa' },
  ],
): IDocumentModelData {
  return {
    variables,
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

function stateFromChildren(
  children: IDocumentModelElement[],
  variables?: IDocumentModelData['variables'],
  withHistory = false,
): EditorState {
  const json = serializeTipTapDoc(
    toTipTapState(toDocumentEditorState(modelWithChildren(children, variables))),
  );
  return EditorState.create({
    schema,
    doc: Node.fromJSON(schema, json),
    plugins: withHistory ? [history()] : undefined,
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

function findVariablePos(doc: Node, type: string): { pos: number; node: Node } {
  let pos = -1;
  let found: Node | undefined;
  doc.descendants((node, nodePos) => {
    if (node.type.name === 'docVariable' && node.attrs.type === type) {
      pos = nodePos;
      found = node;
      return false;
    }
  });
  if (pos < 0 || !found) throw new Error(`variable ${type} not found`);
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

function setRange(state: EditorState, id: string, from: number, to: number) {
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

function selectBlockContent(state: EditorState, id: string) {
  const found = findBlockPos(state.doc, id);
  return state.apply(
    state.tr.setSelection(
      TextSelection.create(
        state.doc,
        found.pos + 1,
        found.pos + 1 + found.node.content.size,
      ),
    ),
  );
}

function selectAcross(state: EditorState, fromId: string, toId: string) {
  const start = findBlockPos(state.doc, fromId);
  const end = findBlockPos(state.doc, toId);
  return state.apply(
    state.tr.setSelection(
      TextSelection.create(
        state.doc,
        start.pos + 1,
        end.pos + 1 + end.node.content.size,
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

function applyOnBlock(
  children: IDocumentModelElement[],
  id: string,
  mode: Parameters<typeof applyChangeCase>[1],
) {
  return applyChangeCase(selectBlockContent(stateFromChildren(children), id), mode);
}

run('1. lowercase', () => {
  const result = applyOnBlock(
    [paragraph('el-a', 'RISCO QUÍMICO')],
    'el-a',
    'lower',
  );
  assert.equal(result.ok, true);
  assert.equal(canonicalChild(result.state, 'el-a').text, 'risco químico');
});

run('2. uppercase', () => {
  const result = applyOnBlock(
    [paragraph('el-a', 'Risco químico')],
    'el-a',
    'upper',
  );
  assert.equal(canonicalChild(result.state, 'el-a').text, 'RISCO QUÍMICO');
});

run('3. sentence case simples', () => {
  const result = applyOnBlock(
    [paragraph('el-a', 'RISCO QUÍMICO')],
    'el-a',
    'sentence',
  );
  assert.equal(canonicalChild(result.state, 'el-a').text, 'Risco químico');
});

run('4. sentence duas frases', () => {
  const result = applyOnBlock(
    [paragraph('el-a', 'RISCO QUÍMICO. EXPOSIÇÃO OCUPACIONAL.')],
    'el-a',
    'sentence',
  );
  assert.equal(
    canonicalChild(result.state, 'el-a').text,
    'Risco químico. Exposição ocupacional.',
  );
});

run('5. initials / title mecânico', () => {
  const result = applyOnBlock(
    [paragraph('el-a', 'não relacionadas à frequência ou intensidade')],
    'el-a',
    'title',
  );
  assert.equal(
    canonicalChild(result.state, 'el-a').text,
    'Não Relacionadas À Frequência Ou Intensidade',
  );
});

run('6. acentos pt-BR', () => {
  assert.equal(toLocaleUpperPtBr('ação'), 'AÇÃO');
  assert.equal(toLocaleLowerPtBr('NÃO'), 'não');
  assert.equal(toLocaleUpperPtBr('frequência'), 'FREQUÊNCIA');
  assert.equal(toLocaleUpperPtBr('exposição'), 'EXPOSIÇÃO');
  assert.equal(toLocaleUpperPtBr('químico'), 'QUÍMICO');
  assert.equal(toLocaleLowerPtBr('ÇÃÊ'), 'çãê');
  const result = applyOnBlock(
    [paragraph('el-a', 'AÇÃO NÃO FREQUÊNCIA EXPOSIÇÃO QUÍMICO ÇÃÊ')],
    'el-a',
    'lower',
  );
  assert.equal(
    canonicalChild(result.state, 'el-a').text,
    'ação não frequência exposição químico çãê',
  );
});

run('7. números', () => {
  const result = applyOnBlock(
    [paragraph('el-a', 'ISO 45001 E NR-01')],
    'el-a',
    'sentence',
  );
  assert.equal(canonicalChild(result.state, 'el-a').text, 'Iso 45001 e nr-01');
});

run('8. hífen', () => {
  const result = applyOnBlock([paragraph('el-a', 'NR-01')], 'el-a', 'sentence');
  assert.equal(canonicalChild(result.state, 'el-a').text, 'Nr-01');
});

run('9. siglas mecânicas', () => {
  const result = applyOnBlock([paragraph('el-a', 'PGR E GRO')], 'el-a', 'sentence');
  assert.equal(canonicalChild(result.state, 'el-a').text, 'Pgr e gro');
});

run('10. partial word', () => {
  const result = applyChangeCase(
    setRange(
      stateFromChildren([paragraph('el-a', 'Risco químico ocupacional')]),
      'el-a',
      6,
      13,
    ),
    'upper',
  );
  assert.equal(
    canonicalChild(result.state, 'el-a').text,
    'Risco QUÍMICO ocupacional',
  );
});

run('11. bold preservado', () => {
  const result = applyOnBlock(
    [
      paragraph('el-a', 'risco químico', {
        inlineStyleRangeBlock: [
          [{ offset: 6, length: 7, style: InlineStyleTypeEnum.BOLD }],
        ],
      }),
    ],
    'el-a',
    'upper',
  );
  const child = canonicalChild(result.state, 'el-a');
  assert.equal(child.text, 'RISCO QUÍMICO');
  assert.deepStrictEqual(child.inlineStyleRangeBlock, [
    [{ offset: 6, length: 7, style: InlineStyleTypeEnum.BOLD }],
  ]);
});

run('12. italic preservado', () => {
  const result = applyOnBlock(
    [
      paragraph('el-a', 'risco químico', {
        inlineStyleRangeBlock: [
          [{ offset: 0, length: 5, style: InlineStyleTypeEnum.ITALIC }],
        ],
      }),
    ],
    'el-a',
    'upper',
  );
  const styles = canonicalChild(result.state, 'el-a').inlineStyleRangeBlock?.[0] || [];
  assert.ok(
    styles.some(
      (range) =>
        range.style === InlineStyleTypeEnum.ITALIC &&
        range.offset === 0 &&
        range.length === 5,
    ),
  );
});

run('13. underline preservado', () => {
  const result = applyOnBlock(
    [
      paragraph('el-a', 'risco químico', {
        inlineStyleRangeBlock: [
          [{ offset: 6, length: 7, style: InlineStyleTypeEnum.UNDERLINE }],
        ],
      }),
    ],
    'el-a',
    'upper',
  );
  const styles = canonicalChild(result.state, 'el-a').inlineStyleRangeBlock?.[0] || [];
  assert.ok(styles.some((range) => range.style === InlineStyleTypeEnum.UNDERLINE));
});

run('14. color preservado', () => {
  const result = applyOnBlock(
    [
      paragraph('el-a', 'risco químico', {
        inlineStyleRangeBlock: [
          [
            {
              offset: 0,
              length: 13,
              style: InlineStyleTypeEnum.COLOR,
              value: '#FF0000',
            },
          ],
        ],
      }),
    ],
    'el-a',
    'upper',
  );
  const styles = canonicalChild(result.state, 'el-a').inlineStyleRangeBlock?.[0] || [];
  assert.ok(
    styles.some(
      (range) =>
        range.style === InlineStyleTypeEnum.COLOR && range.value === '#FF0000',
    ),
  );
});

run('15. font size preservado', () => {
  const result = applyOnBlock(
    [
      paragraph('el-a', 'risco químico', {
        inlineStyleRangeBlock: [
          [
            {
              offset: 6,
              length: 7,
              style: InlineStyleTypeEnum.FONTSIZE,
              value: '18',
            },
          ],
        ],
      }),
    ],
    'el-a',
    'upper',
  );
  const styles = canonicalChild(result.state, 'el-a').inlineStyleRangeBlock?.[0] || [];
  assert.ok(
    styles.some(
      (range) =>
        range.style === InlineStyleTypeEnum.FONTSIZE && range.value === '18',
    ),
  );
});

run('16. link preservado', () => {
  const result = applyOnBlock(
    [
      paragraph('el-a', 'risco químico', {
        entityRangeBlock: [
          [
            {
              offset: 6,
              length: 7,
              data: {
                type: 'LINK',
                mutability: 'MUTABLE',
                data: { url: 'https://simplesst.com', targetOption: '_blank' },
              },
            },
          ],
        ],
      }),
    ],
    'el-a',
    'upper',
  );
  const child = canonicalChild(result.state, 'el-a');
  assert.equal(child.text, 'RISCO QUÍMICO');
  assert.equal(child.entityRangeBlock?.[0]?.[0]?.data?.data?.url, 'https://simplesst.com');
  assert.equal(child.entityRangeBlock?.[0]?.[0]?.offset, 6);
  assert.equal(child.entityRangeBlock?.[0]?.[0]?.length, 7);
});

run('17. super/sub preservados', () => {
  const result = applyOnBlock(
    [
      paragraph('el-a', 'risco x2 h2o', {
        inlineStyleRangeBlock: [
          [
            { offset: 7, length: 1, style: InlineStyleTypeEnum.SUPERSCRIPT },
            { offset: 10, length: 1, style: InlineStyleTypeEnum.SUBSCRIPT },
          ],
        ],
      }),
    ],
    'el-a',
    'upper',
  );
  const styles = canonicalChild(result.state, 'el-a').inlineStyleRangeBlock?.[0] || [];
  assert.ok(styles.some((range) => range.style === InlineStyleTypeEnum.SUPERSCRIPT));
  assert.ok(styles.some((range) => range.style === InlineStyleTypeEnum.SUBSCRIPT));
});

run('18. variável no meio', () => {
  const result = applyOnBlock(
    [paragraph('el-a', 'ANTES ??NOME_DA_EMPRESA?? DEPOIS')],
    'el-a',
    'lower',
  );
  const child = canonicalChild(result.state, 'el-a');
  assert.equal(child.text, 'antes ??NOME_DA_EMPRESA?? depois');
  const variable = findVariablePos(result.state.doc, 'NOME_DA_EMPRESA');
  assert.equal(variable.node.attrs.type, 'NOME_DA_EMPRESA');
});

run('19. somente variável', () => {
  let state = stateFromChildren([
    paragraph('el-a', 'ANTES ??NOME_DA_EMPRESA?? DEPOIS'),
  ]);
  const variable = findVariablePos(state.doc, 'NOME_DA_EMPRESA');
  state = state.apply(
    state.tr.setSelection(NodeSelection.create(state.doc, variable.pos)),
  );
  const result = applyChangeCase(state, 'lower');
  assert.equal(result.ok, false);
  assert.equal(createChangeCaseTransaction(state, 'lower'), null);
  assert.equal(
    canonicalChild(result.state, 'el-a').text,
    'ANTES ??NOME_DA_EMPRESA?? DEPOIS',
  );
});

run('20. unknown variable', () => {
  const result = applyOnBlock(
    [paragraph('el-a', 'TEXTO ??VAR_DESCONHECIDA?? FIM')],
    'el-a',
    'lower',
  );
  assert.equal(
    canonicalChild(result.state, 'el-a').text,
    'texto ??VAR_DESCONHECIDA?? fim',
  );
  assert.equal(
    findVariablePos(result.state.doc, 'VAR_DESCONHECIDA').node.attrs.type,
    'VAR_DESCONHECIDA',
  );
});

run('21. P→P', () => {
  const result = applyChangeCase(
    selectAcross(
      stateFromChildren([
        paragraph('el-a', 'PRIMEIRO'),
        paragraph('el-b', 'SEGUNDO'),
      ]),
      'el-a',
      'el-b',
    ),
    'sentence',
  );
  assert.equal(canonicalChild(result.state, 'el-a').text, 'Primeiro');
  assert.equal(canonicalChild(result.state, 'el-b').text, 'Segundo');
});

run('22. P→BULLET', () => {
  const result = applyChangeCase(
    selectAcross(
      stateFromChildren([
        paragraph('el-a', 'PARÁGRAFO'),
        bullet('el-b', 'ITEM', { level: 1 }),
      ]),
      'el-a',
      'el-b',
    ),
    'sentence',
  );
  assert.equal(canonicalChild(result.state, 'el-a').text, 'Parágrafo');
  assert.equal(canonicalChild(result.state, 'el-b').text, 'Item');
  assert.equal(canonicalChild(result.state, 'el-b').type, 'BULLET');
  assert.equal(canonicalChild(result.state, 'el-b').level, 1);
});

run('23. BULLET→BULLET', () => {
  const result = applyChangeCase(
    selectAcross(
      stateFromChildren([
        bullet('el-a', 'UM', { level: 0 }),
        bullet('el-b', 'DOIS', { level: 2 }),
      ]),
      'el-a',
      'el-b',
    ),
    'lower',
  );
  assert.equal(canonicalChild(result.state, 'el-a').text, 'um');
  assert.equal(canonicalChild(result.state, 'el-b').text, 'dois');
  assert.equal(canonicalChild(result.state, 'el-b').level, 2);
});

run('24. heading→P', () => {
  const result = applyChangeCase(
    selectAcross(
      stateFromChildren([
        heading('el-h', DocumentSectionChildrenTypeEnum.H2, 'TÍTULO'),
        paragraph('el-p', 'CORPO'),
      ]),
      'el-h',
      'el-p',
    ),
    'sentence',
  );
  assert.equal(canonicalChild(result.state, 'el-h').text, 'Título');
  assert.equal(canonicalChild(result.state, 'el-h').type, 'H2');
  assert.equal(canonicalChild(result.state, 'el-p').text, 'Corpo');
});

run('25. caption', () => {
  const result = applyOnBlock(
    [
      {
        id: 'el-cap',
        type: DocumentSectionChildrenTypeEnum.PARAGRAPH_TABLE,
        text: 'LEGENDA DA TABELA',
      },
    ],
    'el-cap',
    'sentence',
  );
  const child = canonicalChild(result.state, 'el-cap');
  assert.equal(child.text, 'Legenda da tabela');
  assert.equal(child.type, 'PARAGRAPH_TABLE');
});

run('26. atom bloqueia', () => {
  const state = selectAcross(
    stateFromChildren([
      paragraph('el-a', 'ANTES'),
      {
        id: 'el-img',
        type: DocumentSectionChildrenTypeEnum.IMAGE,
        text: '',
        url: '/x.png',
      },
      paragraph('el-b', 'DEPOIS'),
    ]),
    'el-a',
    'el-b',
  );
  assert.equal(selectionTouchesAtom(state), true);
  assert.equal(isChangeCaseEnabled(state), false);
  const result = applyChangeCase(state, 'lower');
  assert.equal(result.ok, false);
  assert.equal(canonicalChild(result.state, 'el-a').text, 'ANTES');
  assert.equal(canonicalChild(result.state, 'el-b').text, 'DEPOIS');
  assert.equal(canonicalChild(result.state, 'el-img').type, 'IMAGE');
});

run('27. sem seleção', () => {
  const state = setCursor(
    stateFromChildren([paragraph('el-a', 'Texto')]),
    'el-a',
    2,
  );
  assert.equal(hasPartialTextSelection(state), false);
  assert.equal(isChangeCaseEnabled(state), false);
  const result = applyChangeCase(state, 'upper');
  assert.equal(result.ok, false);
  assert.equal(createChangeCaseTransaction(state, 'upper'), null);
});

run('28. no-op', () => {
  const state = selectBlockContent(
    stateFromChildren([paragraph('el-a', 'RISCO')]),
    'el-a',
  );
  const result = applyChangeCase(state, 'upper');
  assert.equal(result.ok, false);
  assert.equal(createChangeCaseTransaction(state, 'upper'), null);
  assert.equal(canonicalChild(state, 'el-a').text, 'RISCO');
});

run('29. hardBreak', () => {
  const result = applyOnBlock(
    [paragraph('el-a', 'FOO\nBAR')],
    'el-a',
    'sentence',
  );
  assert.equal(canonicalChild(result.state, 'el-a').text, 'Foo\nBar');
});

run('30. marks múltiplos na mesma frase', () => {
  const result = applyOnBlock(
    [
      paragraph('el-a', 'RISCO QUÍMICO OCUPACIONAL', {
        inlineStyleRangeBlock: [
          [{ offset: 6, length: 7, style: InlineStyleTypeEnum.BOLD }],
        ],
      }),
    ],
    'el-a',
    'sentence',
  );
  const child = canonicalChild(result.state, 'el-a');
  assert.equal(child.text, 'Risco químico ocupacional');
  assert.deepStrictEqual(child.inlineStyleRangeBlock, [
    [{ offset: 6, length: 7, style: InlineStyleTypeEnum.BOLD }],
  ]);
});

run('31. Unicode length change', () => {
  const before = stateFromChildren([
    paragraph('el-a', 'straße', {
      inlineStyleRangeBlock: [
        [{ offset: 0, length: 6, style: InlineStyleTypeEnum.BOLD }],
      ],
    }),
    paragraph('el-b', 'intacto'),
  ]);
  const result = applyChangeCase(selectBlockContent(before, 'el-a'), 'upper');
  const child = canonicalChild(result.state, 'el-a');
  assert.equal(child.text, 'STRASSE');
  assert.equal(child.text.length, 7);
  assert.deepStrictEqual(child.inlineStyleRangeBlock, [
    [{ offset: 0, length: 7, style: InlineStyleTypeEnum.BOLD }],
  ]);
  assert.deepStrictEqual(
    persistJson(canonicalChild(result.state, 'el-b')),
    persistJson(canonicalChild(before, 'el-b')),
  );
});

run('32. undo', () => {
  let state = selectBlockContent(
    stateFromChildren([paragraph('el-a', 'risco')], undefined, true),
    'el-a',
  );
  const changed = applyChangeCase(state, 'upper');
  assert.equal(canonicalChild(changed.state, 'el-a').text, 'RISCO');
  let undone = changed.state;
  const ok = undo(changed.state, (tr) => {
    undone = changed.state.apply(tr);
  });
  assert.equal(ok, true);
  assert.equal(canonicalChild(undone, 'el-a').text, 'risco');
});

run('33. redo', () => {
  let state = selectBlockContent(
    stateFromChildren([paragraph('el-a', 'risco')], undefined, true),
    'el-a',
  );
  const changed = applyChangeCase(state, 'upper');
  let undone = changed.state;
  undo(changed.state, (tr) => {
    undone = changed.state.apply(tr);
  });
  let redone = undone;
  const ok = redo(undone, (tr) => {
    redone = undone.apply(tr);
  });
  assert.equal(ok, true);
  assert.equal(canonicalChild(redone, 'el-a').text, 'RISCO');
});

run('34. dirty só com docChanged', () => {
  const changed = selectBlockContent(
    stateFromChildren([paragraph('el-a', 'risco')]),
    'el-a',
  );
  const transaction = createChangeCaseTransaction(changed, 'upper');
  assert.ok(transaction);
  assert.equal(transaction.docChanged, true);

  const noop = selectBlockContent(
    stateFromChildren([paragraph('el-a', 'RISCO')]),
    'el-a',
  );
  assert.equal(createChangeCaseTransaction(noop, 'upper'), null);
});

run('35. Aa menu', () => {
  assert.deepStrictEqual(
    CHANGE_CASE_MENU_ITEMS.map((item) => item.label),
    ['Tipo de frase', 'minúsculas', 'MAIÚSCULAS', 'Iniciais Maiúsculas'],
  );
  assert.equal(CHANGE_CASE_MENU_ITEMS[0].shortcut, 'Shift+F3');
  assert.equal(CHANGE_CASE_MENU_ITEMS[3].mode, 'title');
  assert.equal('shortcut' in CHANGE_CASE_MENU_ITEMS[3], false);
  const toolbar = fs.readFileSync(
    path.join(__dirname, '../integration/DocumentEditorV2Toolbar.tsx'),
    'utf8',
  );
  assert.ok(toolbar.includes('Aa'));
  assert.ok(toolbar.includes('DocumentEditorV2ChangeCaseMenu'));
  assert.ok(toolbar.includes('isChangeCaseEnabled'));
  assert.ok(toolbar.includes('CHANGE_CASE_MENU_ITEMS'));
});

run('36. Shift+F3 upper→lower', () => {
  const state = selectBlockContent(
    stateFromChildren([paragraph('el-a', 'RISCO QUÍMICO')]),
    'el-a',
  );
  assert.equal(resolveCycledChangeCaseMode(state), 'lower');
  const result = applyCycledChangeCase(state);
  assert.equal(canonicalChild(result.state, 'el-a').text, 'risco químico');
});

run('37. Shift+F3 lower→sentence', () => {
  const state = selectBlockContent(
    stateFromChildren([paragraph('el-a', 'risco químico')]),
    'el-a',
  );
  assert.equal(resolveCycledChangeCaseMode(state), 'sentence');
  const result = applyCycledChangeCase(state);
  assert.equal(canonicalChild(result.state, 'el-a').text, 'Risco químico');
});

run('38. Shift+F3 mixed→upper', () => {
  const state = selectBlockContent(
    stateFromChildren([paragraph('el-a', 'Risco químico')]),
    'el-a',
  );
  assert.equal(resolveCycledChangeCaseMode(state), 'upper');
  const result = applyCycledChangeCase(state);
  assert.equal(canonicalChild(result.state, 'el-a').text, 'RISCO QUÍMICO');
});

run('39. canonical roundtrip', () => {
  const original = modelWithChildren([
    paragraph('el-a', 'risco químico', {
      align: undefined,
      size: 12,
      color: '#111111',
      inlineStyleRangeBlock: [
        [{ offset: 0, length: 5, style: InlineStyleTypeEnum.BOLD }],
      ],
    }),
    paragraph('el-b', 'vizinho ??NOME_DA_EMPRESA??'),
  ]);
  const result = applyChangeCase(
    selectBlockContent(
      stateFromChildren(original.sections[0].children!['section-body']),
      'el-a',
    ),
    'upper',
  );
  const restored = persistJson(restore(result.state));
  const again = persistJson(
    restore(
      stateFromChildren(restored.sections[0].children!['section-body']),
    ),
  );
  assert.deepStrictEqual(again, restored);
  assert.equal(childrenOf(restored)[0].id, 'el-a');
  assert.equal(childrenOf(restored)[0].text, 'RISCO QUÍMICO');
  assert.equal(childrenOf(restored)[1].text, 'vizinho ??NOME_DA_EMPRESA??');
});

run('40. Save 5B candidate', () => {
  const original = modelWithChildren([
    paragraph('el-keep', 'intacto'),
    paragraph('el-a', 'RISCO QUÍMICO'),
    {
      id: 'el-img',
      type: DocumentSectionChildrenTypeEnum.IMAGE,
      text: '',
      url: '/x.png',
    },
  ]);
  const selected = createSectionSelection('section-body');
  const baseline = projectEditorSlice(original, selected);
  const edited = applyChangeCase(
    selectBlockContent(
      stateFromChildren(original.sections[0].children!['section-body']),
      'el-a',
    ),
    'lower',
  );
  const candidate = buildDocumentEditorCandidate({
    originalModel: original,
    selectedItem: selected,
    baselineProjection: baseline,
    tipTapDoc: edited.state.doc.toJSON(),
    createId: createSequentialIdFactory(),
  });
  assert.equal(candidate.validation.ok, true, JSON.stringify(candidate.validation.errors));
  const changes = assertAllowedCanonicalDiff(original, candidate.candidate, [
    'sections/0/children/section-body/[el-a]/text',
  ]);
  assert.equal(changes.length, 1);
  assert.equal(childrenOf(candidate.candidate)[0].text, 'intacto');
  assert.equal(childrenOf(candidate.candidate)[1].text, 'risco químico');
  assert.equal(childrenOf(candidate.candidate)[2].type, 'IMAGE');
});

run('41. optimistic lock C2 regressão', () => {
  assert.equal(DOCUMENT_MODEL_CONFLICT, 'DOCUMENT_MODEL_CONFLICT');
  assert.equal(DOCUMENT_MODEL_CONFLICT_TITLE, 'Modelo alterado');
  assert.equal(
    isDocumentModelConflict({
      response: { status: 409, data: { code: DOCUMENT_MODEL_CONFLICT } },
    }),
    true,
  );
  assert.equal(
    isDocumentModelConflict({ response: { status: 200, data: {} } }),
    false,
  );
  const lockSource = fs.readFileSync(
    path.join(
      __dirname,
      '../../../modals/ModalEditDocumentModel/helpers/document-model-optimistic-lock.ts',
    ),
    'utf8',
  );
  assert.ok(!lockSource.includes('apply-text-case'));
  assert.ok(!lockSource.includes('Change Case'));
});

run('42. 6A regressão estrutural', () => {
  const pageLayout = fs.readFileSync(
    path.join(__dirname, '../integration/document-editor-v2-page-layout.ts'),
    'utf8',
  );
  assert.ok(!pageLayout.includes('apply-text-case'));
  assert.ok(!pageLayout.includes('Shift-F3'));
});

run('43. MASTER access', () => {
  const access = resolveDocumentEditorV2Access({
    surfaceFlag: false,
    saveFlag: false,
    isMaster: true,
  });
  assert.deepStrictEqual(access, { canUseV2: true, canPersistV2: true });
  const blocked = resolveDocumentEditorV2Access({
    surfaceFlag: false,
    saveFlag: false,
    isMaster: false,
  });
  assert.deepStrictEqual(blocked, { canUseV2: false, canPersistV2: false });
});

run('44. Classic intacto estruturalmente', () => {
  const classic = fs.readFileSync(
    path.join(
      __dirname,
      '../../DocumentModelContent/TypeSectionItem/ItemWrapper.tsx',
    ),
    'utf8',
  );
  assert.ok(!classic.includes('apply-text-case'));
  assert.ok(!classic.includes('Shift-F3'));
  assert.ok(!classic.includes('DocumentEditorV2ChangeCaseMenu'));
  const header = fs.readFileSync(
    path.join(__dirname, '../integration/DocumentEditorV2HeaderControls.tsx'),
    'utf8',
  );
  assert.ok(header.includes('Clássico'));
  assert.ok(header.includes('V2 experimental'));
});

run('45. sentence não capitaliza após : ;', () => {
  const result = applyOnBlock(
    [paragraph('el-a', 'RISCO: QUÍMICO; EXPOSIÇÃO')],
    'el-a',
    'sentence',
  );
  assert.equal(
    canonicalChild(result.state, 'el-a').text,
    'Risco: químico; exposição',
  );
});

run('46. Shift+F3 registrado', () => {
  const names = createDocumentEditorExtensions().map((item) => item.name);
  assert.ok(names.includes('documentEditorTextCase'));
  assert.equal(classifySelectedTextCase('RISCO'), 'upper');
  assert.equal(classifySelectedTextCase('risco'), 'lower');
  assert.equal(classifySelectedTextCase('Risco'), 'mixed');
  assert.equal(resolveShiftF3Mode('RISCO'), 'lower');
  assert.equal(resolveShiftF3Mode('risco'), 'sentence');
  assert.equal(resolveShiftF3Mode('Risco'), 'upper');
});

run('47. no-op candidate diff vazio', () => {
  const original = modelWithChildren([paragraph('el-a', 'Texto')]);
  const selected = createSectionSelection('section-body');
  const baseline = projectEditorSlice(original, selected);
  const untouched = selectBlockContent(
    stateFromChildren(original.sections[0].children!['section-body']),
    'el-a',
  );
  assert.equal(createChangeCaseTransaction(untouched, 'title'), null);
  const candidate = buildDocumentEditorCandidate({
    originalModel: original,
    selectedItem: selected,
    baselineProjection: baseline,
    tipTapDoc: untouched.doc.toJSON(),
    createId: createSequentialIdFactory(),
  });
  assert.deepStrictEqual(canonicalDiff(original, candidate.candidate), []);
});

run('48. collectSelectedHumanText ignora variável', () => {
  const state = selectBlockContent(
    stateFromChildren([paragraph('el-a', 'ABC ??NOME_DA_EMPRESA?? DEF')]),
    'el-a',
  );
  assert.equal(collectSelectedHumanText(state), 'ABC  DEF');
});

run('49. stream sentence atravessa chunks', () => {
  const first = transformTextCaseChunk(
    'RISCO ',
    'sentence',
    createTextCaseStreamState(),
  );
  const second = transformTextCaseChunk('QUÍMICO', 'sentence', first.state);
  assert.equal(first.text + second.text, 'Risco químico');
});

run('50. botão de ciclo existe', () => {
  assert.equal(CHANGE_CASE_CYCLE_TOOLTIP, 'Alternar capitalização — Shift+F3');
  const toolbar = fs.readFileSync(
    path.join(__dirname, '../integration/DocumentEditorV2Toolbar.tsx'),
    'utf8',
  );
  assert.ok(toolbar.includes('DocumentEditorV2ChangeCaseCycleButton'));
  assert.ok(toolbar.includes('SwapHorizIcon'));
  assert.ok(toolbar.includes('createCycledChangeCaseTransaction'));
  assert.ok(toolbar.includes('CHANGE_CASE_CYCLE_TOOLTIP'));
  const extension = fs.readFileSync(
    path.join(__dirname, './extensions/document-text-case.extension.ts'),
    'utf8',
  );
  assert.ok(extension.includes('createCycledChangeCaseTransaction'));
});

run('51. ciclo disabled sem seleção', () => {
  const state = setCursor(
    stateFromChildren([paragraph('el-a', 'Texto')]),
    'el-a',
    1,
  );
  assert.equal(isChangeCaseEnabled(state), false);
  assert.equal(createCycledChangeCaseTransaction(state), null);
});

run('52. ciclo disabled com atom', () => {
  const state = selectAcross(
    stateFromChildren([
      paragraph('el-a', 'ANTES'),
      {
        id: 'el-img',
        type: DocumentSectionChildrenTypeEnum.IMAGE,
        text: '',
        url: '/x.png',
      },
      paragraph('el-b', 'DEPOIS'),
    ]),
    'el-a',
    'el-b',
  );
  assert.equal(isChangeCaseEnabled(state), false);
  assert.equal(createCycledChangeCaseTransaction(state), null);
});

run('53. clique misto → MAIÚSCULAS', () => {
  const state = selectBlockContent(
    stateFromChildren([paragraph('el-a', 'Risco químico')]),
    'el-a',
  );
  const result = applyCycledChangeCase(state);
  assert.equal(result.mode, 'upper');
  assert.equal(canonicalChild(result.state, 'el-a').text, 'RISCO QUÍMICO');
});

run('54. clique MAIÚSCULAS → minúsculas', () => {
  const state = selectBlockContent(
    stateFromChildren([paragraph('el-a', 'RISCO QUÍMICO')]),
    'el-a',
  );
  const result = applyCycledChangeCase(state);
  assert.equal(result.mode, 'lower');
  assert.equal(canonicalChild(result.state, 'el-a').text, 'risco químico');
});

run('55. clique minúsculas → Tipo de frase', () => {
  const state = selectBlockContent(
    stateFromChildren([paragraph('el-a', 'risco químico')]),
    'el-a',
  );
  const result = applyCycledChangeCase(state);
  assert.equal(result.mode, 'sentence');
  assert.equal(canonicalChild(result.state, 'el-a').text, 'Risco químico');
});

run('56. mesmo resultado do Shift+F3', () => {
  const state = selectBlockContent(
    stateFromChildren([paragraph('el-a', 'Risco químico')]),
    'el-a',
  );
  const viaShortcut = applyCycledChangeCase(state);
  const transaction = createCycledChangeCaseTransaction(state);
  assert.ok(transaction);
  const viaButton = state.apply(transaction);
  assert.equal(
    canonicalChild(viaButton, 'el-a').text,
    canonicalChild(viaShortcut.state, 'el-a').text,
  );
  assert.equal(viaShortcut.mode, resolveCycledChangeCaseMode(state));
});

run('57. ciclo preserva variável', () => {
  const result = applyCycledChangeCase(
    selectBlockContent(
      stateFromChildren([
        paragraph('el-a', 'ANTES ??NOME_DA_EMPRESA?? DEPOIS'),
      ]),
      'el-a',
    ),
  );
  assert.equal(result.mode, 'lower');
  assert.equal(
    canonicalChild(result.state, 'el-a').text,
    'antes ??NOME_DA_EMPRESA?? depois',
  );
  assert.equal(
    findVariablePos(result.state.doc, 'NOME_DA_EMPRESA').node.attrs.type,
    'NOME_DA_EMPRESA',
  );
});

run('58. ciclo preserva marks', () => {
  const result = applyCycledChangeCase(
    selectBlockContent(
      stateFromChildren([
        paragraph('el-a', 'Risco químico', {
          inlineStyleRangeBlock: [
            [{ offset: 6, length: 7, style: InlineStyleTypeEnum.BOLD }],
          ],
        }),
      ]),
      'el-a',
    ),
  );
  assert.equal(canonicalChild(result.state, 'el-a').text, 'RISCO QUÍMICO');
  assert.deepStrictEqual(
    canonicalChild(result.state, 'el-a').inlineStyleRangeBlock,
    [[{ offset: 6, length: 7, style: InlineStyleTypeEnum.BOLD }]],
  );
});

run('59. ciclo no-op sem dirty', () => {
  let state = stateFromChildren([
    paragraph('el-a', 'ANTES ??NOME_DA_EMPRESA?? DEPOIS'),
  ]);
  const variable = findVariablePos(state.doc, 'NOME_DA_EMPRESA');
  state = state.apply(
    state.tr.setSelection(NodeSelection.create(state.doc, variable.pos)),
  );
  assert.equal(createCycledChangeCaseTransaction(state), null);
  assert.equal(applyCycledChangeCase(state).ok, false);
});

run('60. ciclo undo em uma transaction', () => {
  const selected = selectBlockContent(
    stateFromChildren([paragraph('el-a', 'Risco químico')], undefined, true),
    'el-a',
  );
  const changed = applyCycledChangeCase(selected);
  assert.equal(canonicalChild(changed.state, 'el-a').text, 'RISCO QUÍMICO');
  let undone = changed.state;
  assert.equal(
    undo(changed.state, (tr) => {
      undone = changed.state.apply(tr);
    }),
    true,
  );
  assert.equal(canonicalChild(undone, 'el-a').text, 'Risco químico');
});

run('61. menu Aa continua no toolbar', () => {
  const toolbar = fs.readFileSync(
    path.join(__dirname, '../integration/DocumentEditorV2Toolbar.tsx'),
    'utf8',
  );
  assert.ok(toolbar.includes('DocumentEditorV2ChangeCaseMenu'));
  assert.ok(toolbar.includes('Tipo de frase') === false);
  assert.ok(toolbar.includes('CHANGE_CASE_MENU_ITEMS'));
  assert.equal(CHANGE_CASE_MENU_ITEMS.length, 4);
});

console.log('\nFase 7A change case: ok');
