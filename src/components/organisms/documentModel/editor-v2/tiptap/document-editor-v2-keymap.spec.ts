/**
 * Runtime keymap tests for Phase 3B (EditorState + ProseMirror commands).
 *
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/documentModel/editor-v2/tiptap/document-editor-v2-keymap.spec.ts
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';

import { getSchema } from '@tiptap/core';
import { joinForward } from '@tiptap/pm/commands';
import { Node } from '@tiptap/pm/model';
import { EditorState, TextSelection } from '@tiptap/pm/state';
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
import { createSequentialIdFactory } from '../domain/document-editor-id';
import { allowDocumentEditorV2Transaction } from '../integration/document-editor-v2-guards';
import {
  consumeEditorEscapeEvent,
  requestSurfaceChange,
  shouldBlockOfficialSave,
  shouldIgnoreModalEscapeClose,
} from '../integration/document-editor-v2-session';
import { createDocumentEditorExtensions } from './extensions/create-document-editor-extensions';
import { applyStableEditableIds } from './extensions/structural-editing.extension';
import { fromTipTapState } from './from-tiptap-state';
import { serializeTipTapDoc } from './schema';
import {
  applyStructuralJoinBackward,
  applyStructuralJoinForward,
  applyStructuralSplit,
  resolveStructuralJoinBackward,
  resolveStructuralJoinForward,
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
        node.type.name === 'docCaption') &&
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
  const blocks: Array<{ type: string; id: string; text: string }> = [];
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

function setCursorOnNthEditable(
  state: EditorState,
  index: number,
  offset: number,
) {
  const positions: number[] = [];
  state.doc.descendants((node, pos) => {
    if (node.type.name === 'docParagraph' || node.type.name === 'docBullet') {
      positions.push(pos);
    }
  });
  const pos = positions[index];
  if (pos == null) throw new Error(`editable ${index} not found`);
  return state.apply(
    state.tr.setSelection(TextSelection.create(state.doc, pos + 1 + offset)),
  );
}

function setCursorAtEnd(state: EditorState, id: string) {
  const found = findBlockPos(state.doc, id);
  return setCursor(state, id, found.node.content.size);
}

function restore(state: EditorState) {
  return fromDocumentEditorState(fromTipTapState(state.doc.toJSON()));
}

function childrenOf(model: IDocumentModelData) {
  return model.sections[0].children?.['section-body'] || [];
}

function splitAt(state: EditorState, id: string, offset: number) {
  const next = setCursor(state, id, offset);
  const split = applyStructuralSplit(next);
  assert.equal(split.ok, true);
  return applyStableEditableIds(split.state, createSequentialIdFactory());
}

run('1. Enter P → P + Backspace → P original recomposto', () => {
  let state = stateFromChildren([paragraph('p-a', 'ABCDEF')]);
  state = splitAt(state, 'p-a', 3);
  assert.deepStrictEqual(
    dumpBlocks(state.doc).map((block) => block.text),
    ['ABC', 'DEF'],
  );
  const secondId = dumpBlocks(state.doc)[1].id;
  assert.notEqual(secondId, 'p-a');
  state = setCursor(state, secondId, 0);
  const joined = applyStructuralJoinBackward(state);
  assert.equal(joined.decision.type, 'join');
  assert.deepStrictEqual(dumpBlocks(joined.state.doc), [
    { type: 'docParagraph', id: 'p-a', text: 'ABCDEF' },
  ]);
});

run('2. Enter P → P + Delete equivalente', () => {
  let state = stateFromChildren([paragraph('p-a', 'ABCDEF')]);
  state = splitAt(state, 'p-a', 3);
  state = setCursorAtEnd(state, 'p-a');
  const joined = applyStructuralJoinForward(state);
  assert.equal(joined.decision.type, 'join');
  assert.equal(dumpBlocks(joined.state.doc)[0].text, 'ABCDEF');
  assert.equal(dumpBlocks(joined.state.doc)[0].id, 'p-a');
  assert.equal(dumpBlocks(joined.state.doc).length, 1);
});

run('3. P + P → Backspace merge', () => {
  let state = stateFromChildren([
    paragraph('p-a', 'ABC'),
    paragraph('p-b', 'DEF'),
  ]);
  state = setCursor(state, 'p-b', 0);
  const joined = applyStructuralJoinBackward(state);
  assert.equal(joined.decision.type, 'join');
  const restored = childrenOf(restore(joined.state));
  assert.equal(restored.length, 1);
  assert.equal(restored[0].id, 'p-a');
  assert.equal(restored[0].text, 'ABCDEF');
});

run('4. P + P → Delete merge', () => {
  let state = stateFromChildren([
    paragraph('p-a', 'ABC'),
    paragraph('p-b', 'DEF'),
  ]);
  state = setCursorAtEnd(state, 'p-a');
  const joined = applyStructuralJoinForward(state);
  assert.equal(joined.decision.type, 'join');
  const restored = childrenOf(restore(joined.state));
  assert.equal(restored[0].id, 'p-a');
  assert.equal(restored[0].text, 'ABCDEF');
});

run('5. BULLET + BULLET → Backspace merge', () => {
  let state = stateFromChildren([
    bullet('b-a', 'Ambientes Gerais', { level: 0 }),
    bullet('b-b', 'Ambientes Operacionais', { level: 0 }),
  ]);
  state = setCursor(state, 'b-b', 0);
  const joined = applyStructuralJoinBackward(state);
  assert.equal(joined.decision.type, 'join');
  const restored = childrenOf(restore(joined.state));
  assert.equal(restored.length, 1);
  assert.equal(restored[0].id, 'b-a');
  assert.equal(restored[0].type, 'BULLET');
  assert.equal(restored[0].text, 'Ambientes GeraisAmbientes Operacionais');
  assert.equal(restored[0].level, 0);
});

run('6. BULLET + BULLET → Delete merge', () => {
  let state = stateFromChildren([bullet('b-a', 'Um'), bullet('b-b', 'Dois')]);
  state = setCursorAtEnd(state, 'b-a');
  const joined = applyStructuralJoinForward(state);
  assert.equal(joined.decision.type, 'join');
  assert.equal(childrenOf(restore(joined.state))[0].id, 'b-a');
  assert.equal(childrenOf(restore(joined.state))[0].text, 'UmDois');
});

run('7. P ↔ BULLET permanece bloqueado', () => {
  let state = stateFromChildren([
    paragraph('p-a', 'Paragrafo'),
    bullet('b-a', 'Marcador'),
  ]);
  state = setCursor(state, 'b-a', 0);
  assert.equal(resolveStructuralJoinBackward(state).type, 'block');
  assert.equal(
    applyStructuralJoinBackward(state).state.doc.eq(state.doc),
    true,
  );

  state = setCursorAtEnd(state, 'p-a');
  assert.equal(resolveStructuralJoinForward(state).type, 'block');
  assert.equal(applyStructuralJoinForward(state).state.doc.eq(state.doc), true);
});

run('8. heading boundary permanece bloqueado', () => {
  let state = stateFromChildren([
    {
      id: 'el-h2',
      type: DocumentSectionChildrenTypeEnum.H2,
      text: 'Titulo',
    },
    paragraph('p-a', 'Depois'),
  ]);
  state = setCursor(state, 'p-a', 0);
  assert.equal(resolveStructuralJoinBackward(state).type, 'block');
  assert.equal(
    dumpBlocks(state.doc).some((block) => block.id === 'el-h2'),
    true,
  );
});

run('9. atom boundary permanece bloqueado', () => {
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
  state = setCursor(state, 'p-b', 0);
  assert.equal(resolveStructuralJoinBackward(state).type, 'block');
  state = setCursorAtEnd(state, 'p-a');
  assert.equal(resolveStructuralJoinForward(state).type, 'block');
  assert.equal(
    dumpBlocks(applyStructuralJoinForward(state).state.doc).some(
      (block) => block.id === 'el-image',
    ),
    true,
  );
});

run('10. parágrafo vazio recém-criado pode ser removido', () => {
  let state = stateFromChildren([paragraph('p-a', 'ABC')]);
  state = splitAt(state, 'p-a', 3);
  assert.equal(dumpBlocks(state.doc).length, 2);
  assert.equal(dumpBlocks(state.doc)[1].type, 'docParagraph');
  assert.equal(dumpBlocks(state.doc)[1].text, '');
  state = setCursorOnNthEditable(state, 1, 0);
  const joined = applyStructuralJoinBackward(state);
  assert.equal(joined.decision.type, 'join');
  assert.deepStrictEqual(dumpBlocks(joined.state.doc), [
    { type: 'docParagraph', id: 'p-a', text: 'ABC' },
  ]);
});

run('11. IDs: superior sobrevive, inferior desaparece', () => {
  let state = stateFromChildren([
    paragraph('p-a', 'ABC'),
    paragraph('p-b', 'DEF'),
    paragraph('p-c', 'GHI'),
  ]);
  state = setCursor(state, 'p-b', 0);
  const joined = applyStructuralJoinBackward(state);
  const ids = dumpBlocks(joined.state.doc).map((block) => block.id);
  assert.deepStrictEqual(ids, ['p-a', 'p-c']);
});

run('12. ranges preservados no split → merge', () => {
  let state = stateFromChildren([
    paragraph('p-a', 'ABCDEF', {
      inlineStyleRangeBlock: [
        [{ offset: 0, length: 6, style: InlineStyleTypeEnum.BOLD }],
      ],
    }),
  ]);
  state = splitAt(state, 'p-a', 3);
  const secondId = dumpBlocks(state.doc)[1].id;
  state = setCursor(state, secondId, 0);
  const restored = childrenOf(
    restore(applyStructuralJoinBackward(state).state),
  )[0];
  assert.equal(restored.text, 'ABCDEF');
  assert.equal(restored.inlineStyleRangeBlock?.[0]?.[0]?.style, 'BOLD');
  assert.equal(restored.inlineStyleRangeBlock?.[0]?.[0]?.length, 6);
});

run('13. hyperlink preservado', () => {
  let state = stateFromChildren([
    paragraph('p-a', 'Ver www.mte.gov.br fim', {
      entityRangeBlock: [
        [
          {
            offset: 4,
            length: 14,
            data: {
              type: 'LINK',
              mutability: 'MUTABLE',
              data: { url: 'http://www.mte.gov.br', targetOption: '_blank' },
            },
          },
        ],
      ],
    }),
    paragraph('p-b', ' depois'),
  ]);
  state = setCursor(state, 'p-b', 0);
  const restored = childrenOf(
    restore(applyStructuralJoinBackward(state).state),
  )[0];
  assert.equal(
    restored.entityRangeBlock?.[0]?.[0]?.data?.data.url,
    'http://www.mte.gov.br',
  );
  assert.ok(restored.text.includes('www.mte.gov.br'));
  assert.ok(restored.text.includes('depois'));
});

run('14. variável ??VAR?? preservada', () => {
  let state = stateFromChildren([
    paragraph('p-a', 'Empresa ??NOME_DA_EMPRESA??'),
    paragraph('p-b', ' segue'),
  ]);
  state = setCursor(state, 'p-b', 0);
  const restored = childrenOf(
    restore(applyStructuralJoinBackward(state).state),
  )[0];
  assert.equal(restored.text, 'Empresa ??NOME_DA_EMPRESA?? segue');
  const before = persistJson(
    restore(stateFromChildren([paragraph('p-a', '??NOME_DA_EMPRESA??')])),
  );
  const after = persistJson(
    restore(stateFromChildren([paragraph('p-a', '??NOME_DA_EMPRESA??')])),
  );
  assert.deepStrictEqual(after, before);
});

run('15. ESC dentro do editor não descarta v2LocalDirty', () => {
  let discarded = false;
  const event = {
    key: 'Escape',
    stopPropagation() {
      this.stopped = true;
    },
    preventDefault() {
      this.prevented = true;
    },
    stopped: false,
    prevented: false,
  };
  assert.equal(consumeEditorEscapeEvent(event), true);
  assert.equal(event.stopped, true);
  assert.equal(
    shouldIgnoreModalEscapeClose({
      v2LocalDirty: true,
      reason: 'escapeKeyDown',
    }),
    true,
  );
  assert.equal(
    shouldIgnoreModalEscapeClose({
      v2LocalDirty: true,
      reason: 'backdropClick',
    }),
    false,
  );
  assert.equal(discarded, false);

  const sectionView = fs.readFileSync(
    path.join(__dirname, '../integration/DocumentEditorV2SectionView.tsx'),
    'utf8',
  );
  const modal = fs.readFileSync(
    path.join(
      __dirname,
      '../../../modals/ModalEditDocumentModel/ModalEditDocumentModel.tsx',
    ),
    'utf8',
  );
  assert.equal(sectionView.includes('consumeEditorEscapeEvent'), true);
  assert.equal(modal.includes('disableEscapeKeyDown'), true);
  assert.equal(modal.includes('shouldIgnoreModalEscapeClose'), true);
  assert.equal(modal.includes('discardLocalEdits'), false);
});

run('16. fechamento/troca para Clássico com dirty continua protegido', () => {
  assert.equal(
    requestSurfaceChange({
      current: 'v2',
      next: 'v1',
      v2LocalDirty: true,
    }).allowed,
    false,
  );
  assert.equal(
    shouldBlockOfficialSave({ surface: 'v2', v2LocalDirty: true }),
    true,
  );
  assert.equal(
    shouldIgnoreModalEscapeClose({
      v2LocalDirty: false,
      reason: 'escapeKeyDown',
    }),
    false,
  );
});

run('join P+P continua permitido pelo ProtectV2Boundaries', () => {
  let state = stateFromChildren([
    paragraph('p-a', 'ABC'),
    paragraph('p-b', 'DEF'),
    {
      id: 'el-h2',
      type: DocumentSectionChildrenTypeEnum.H2,
      text: 'Titulo',
    },
  ]);
  const before = state.doc;
  state = setCursor(state, 'p-b', 0);
  const joined = applyStructuralJoinBackward(state);
  assert.equal(
    allowDocumentEditorV2Transaction(
      { docChanged: true, doc: joined.state.doc },
      { doc: before },
    ),
    true,
  );
  assert.equal(
    dumpBlocks(joined.state.doc).some((block) => block.id === 'el-h2'),
    true,
  );
});

function assertBlockedForward(state: EditorState) {
  const before = persistJson(restore(state));
  const ids = dumpBlocks(state.doc).map((block) => `${block.type}:${block.id}`);
  const result = applyStructuralJoinForward(state);
  assert.equal(result.decision.type, 'block');
  assert.equal(result.state.doc.eq(state.doc), true);
  assert.deepStrictEqual(persistJson(restore(result.state)), before);
  assert.deepStrictEqual(
    dumpBlocks(result.state.doc).map((block) => `${block.type}:${block.id}`),
    ids,
  );
}

function assertBlockedBackward(state: EditorState) {
  const before = persistJson(restore(state));
  const ids = dumpBlocks(state.doc).map((block) => `${block.type}:${block.id}`);
  const result = applyStructuralJoinBackward(state);
  assert.equal(result.decision.type, 'block');
  assert.equal(result.state.doc.eq(state.doc), true);
  assert.deepStrictEqual(persistJson(restore(result.state)), before);
  assert.deepStrictEqual(
    dumpBlocks(result.state.doc).map((block) => `${block.type}:${block.id}`),
    ids,
  );
}

run('1. H2/P + PARAGRAPH_TABLE → Delete no fim: bloqueado', () => {
  let headingState = stateFromChildren([
    {
      id: 'el-h2',
      type: DocumentSectionChildrenTypeEnum.H2,
      text: '11. Inventario',
    },
    {
      id: 'el-ptable',
      type: DocumentSectionChildrenTypeEnum.PARAGRAPH_TABLE,
      text: 'Tabela 1 — Riscos',
    },
  ]);
  headingState = setCursorAtEnd(headingState, 'el-h2');
  assert.equal(resolveStructuralJoinForward(headingState).type, 'block');

  let absorbed = false;
  joinForward(headingState, () => {
    absorbed = true;
  });
  assert.equal(
    absorbed,
    true,
    'joinForward default still wants to absorb; we must consume Delete',
  );
  assertBlockedForward(headingState);

  let paragraphState = stateFromChildren([
    paragraph('p-11', 'Item 11 texto'),
    {
      id: 'el-ptable',
      type: DocumentSectionChildrenTypeEnum.PARAGRAPH_TABLE,
      text: 'Tabela 1 — Riscos',
    },
  ]);
  paragraphState = setCursorAtEnd(paragraphState, 'p-11');
  assertBlockedForward(paragraphState);
  const restored = childrenOf(restore(paragraphState));
  assert.equal(restored[1].type, 'PARAGRAPH_TABLE');
  assert.equal(restored[1].id, 'el-ptable');
  assert.equal(restored[1].text, 'Tabela 1 — Riscos');
});

run('2. PARAGRAPH_TABLE + P → Backspace no início: bloqueado', () => {
  let state = stateFromChildren([
    {
      id: 'el-ptable',
      type: DocumentSectionChildrenTypeEnum.PARAGRAPH_TABLE,
      text: 'Tabela 1 — Riscos',
    },
    paragraph('p-a', 'Depois'),
  ]);
  state = setCursor(state, 'p-a', 0);
  assertBlockedBackward(state);
  assert.equal(childrenOf(restore(state))[0].type, 'PARAGRAPH_TABLE');
});

run('3. P + IMAGE → bloqueado', () => {
  let state = stateFromChildren([
    paragraph('p-a', 'Antes'),
    {
      id: 'el-image',
      type: DocumentSectionChildrenTypeEnum.IMAGE,
      text: '',
      url: '/x.png',
    },
  ]);
  state = setCursorAtEnd(state, 'p-a');
  assertBlockedForward(state);
});

run('4. P + BREAK → bloqueado', () => {
  let state = stateFromChildren([
    paragraph('p-a', 'Antes'),
    { id: 'el-break', type: DocumentSectionChildrenTypeEnum.BREAK, text: '' },
  ]);
  state = setCursorAtEnd(state, 'p-a');
  assertBlockedForward(state);
});

run('5. P + SECTION_BREAK → bloqueado', () => {
  let state = stateFromChildren([
    paragraph('p-a', 'Antes'),
    {
      id: 'el-sbreak',
      type: DocumentSectionChildrenTypeEnum.SECTION_BREAK,
      text: '',
    },
  ]);
  state = setCursorAtEnd(state, 'p-a');
  assertBlockedForward(state);
});

run('6. P + TABLE_GSE/SST atom → bloqueado', () => {
  let state = stateFromChildren([
    paragraph('p-a', 'Antes'),
    {
      id: 'el-gse',
      type: DocumentSectionChildrenTypeEnum.TABLE_GSE,
      text: '',
    },
  ]);
  state = setCursorAtEnd(state, 'p-a');
  assertBlockedForward(state);
});

run('7. P + P continua mergeando', () => {
  let state = stateFromChildren([
    paragraph('p-a', 'ABC'),
    paragraph('p-b', 'DEF'),
  ]);
  state = setCursor(state, 'p-b', 0);
  const joined = applyStructuralJoinBackward(state);
  assert.equal(joined.decision.type, 'join');
  assert.equal(childrenOf(restore(joined.state))[0].text, 'ABCDEF');
});

run('8. BULLET + BULLET continua mergeando', () => {
  let state = stateFromChildren([bullet('b-a', 'Um'), bullet('b-b', 'Dois')]);
  state = setCursorAtEnd(state, 'b-a');
  const joined = applyStructuralJoinForward(state);
  assert.equal(joined.decision.type, 'join');
  assert.equal(childrenOf(restore(joined.state))[0].text, 'UmDois');
});

run('9. P ↔ BULLET continua bloqueado', () => {
  let state = stateFromChildren([
    paragraph('p-a', 'Paragrafo'),
    bullet('b-a', 'Marcador'),
  ]);
  state = setCursorAtEnd(state, 'p-a');
  assertBlockedForward(state);
  state = setCursor(state, 'b-a', 0);
  assertBlockedBackward(state);
});

run('10. heading + paragraph: regra homologada (Backspace bloqueado)', () => {
  let state = stateFromChildren([
    {
      id: 'el-h2',
      type: DocumentSectionChildrenTypeEnum.H2,
      text: 'Titulo',
    },
    paragraph('p-a', 'Depois'),
  ]);
  state = setCursor(state, 'p-a', 0);
  assertBlockedBackward(state);
  state = setCursorAtEnd(state, 'el-h2');
  assertBlockedForward(state);
  assert.equal(dumpBlocks(state.doc)[0].type, 'docHeading');
  assert.equal(dumpBlocks(state.doc)[1].type, 'docParagraph');
});

console.log('\nFase 3 keymap specs: ok');
