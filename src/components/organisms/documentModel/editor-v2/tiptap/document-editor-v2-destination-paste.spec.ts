/**
 * Destino estrutural no paste/replace do Editor V2 (sem React).
 *
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/documentModel/editor-v2/tiptap/document-editor-v2-destination-paste.spec.ts
 */
import assert from 'assert';

import { getSchema } from '@tiptap/core';
import { Fragment, Mark, Node, Slice } from '@tiptap/pm/model';
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
import {
  applyDestinationAwarePaste,
  remapPastedSliceToDestination,
} from './destination-block-paste';
import { applyStableEditableIds } from './extensions/structural-editing.extension';
import { createDocumentEditorExtensions } from './extensions/create-document-editor-extensions';
import { fromTipTapState } from './from-tiptap-state';
import { serializeTipTapDoc } from './schema';
import { applyStructuralSplit } from './structural-join';
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

function selectAllText(state: EditorState, id: string): EditorState {
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

function setCursor(state: EditorState, id: string, offset: number) {
  const found = findBlockPos(state.doc, id);
  return state.apply(
    state.tr.setSelection(
      TextSelection.create(state.doc, found.pos + 1 + offset),
    ),
  );
}

function closedHeadingSlice(
  text: string,
  headingType = 'H1',
  marks?: readonly Mark[],
) {
  return new Slice(
    Fragment.from(
      schema.nodes.docHeading.create(
        { headingType },
        schema.text(text, marks),
      ),
    ),
    0,
    0,
  );
}

function pasteOver(state: EditorState, id: string, slice: Slice): EditorState {
  return applyDestinationAwarePaste(selectAllText(state, id), slice);
}

run('defaultType de docSection é docParagraph — não H1', () => {
  assert.equal(
    schema.nodes.docSection.contentMatch.defaultType?.name,
    'docParagraph',
  );
});

run('1. Parágrafo + paste (slice H1) → continua Parágrafo', () => {
  const state = pasteOver(
    stateFromChildren([paragraph('el-a', 'Original')]),
    'el-a',
    closedHeadingSlice('Colado'),
  );
  assert.equal(dumpBlocks(state.doc)[0].type, 'docParagraph');
  assert.equal(canonicalChild(state, 'el-a').type, 'PARAGRAPH');
  assert.equal(canonicalChild(state, 'el-a').text, 'Colado');
  assert.equal(canonicalChild(state, 'el-a').id, 'el-a');
});

run('2. H2 + paste → continua H2', () => {
  const state = pasteOver(
    stateFromChildren([
      heading('el-a', DocumentSectionChildrenTypeEnum.H2, 'Original'),
    ]),
    'el-a',
    closedHeadingSlice('Colado', 'H1'),
  );
  assert.equal(dumpBlocks(state.doc)[0].type, 'docHeading');
  assert.equal(canonicalChild(state, 'el-a').type, 'H2');
  assert.equal(canonicalChild(state, 'el-a').text, 'Colado');
});

run('3. H3 + paste → continua H3', () => {
  const state = pasteOver(
    stateFromChildren([
      heading('el-a', DocumentSectionChildrenTypeEnum.H3, 'Original'),
    ]),
    'el-a',
    closedHeadingSlice('Colado'),
  );
  assert.equal(canonicalChild(state, 'el-a').type, 'H3');
  assert.equal(canonicalChild(state, 'el-a').text, 'Colado');
});

run('4. Bullet + paste → continua Bullet e level', () => {
  const state = pasteOver(
    stateFromChildren([bullet('el-a', 'Original', { level: 2 })]),
    'el-a',
    closedHeadingSlice('Colado'),
  );
  assert.equal(dumpBlocks(state.doc)[0].type, 'docBullet');
  assert.equal(canonicalChild(state, 'el-a').type, 'BULLET');
  assert.equal(canonicalChild(state, 'el-a').level, 2);
  assert.equal(canonicalChild(state, 'el-a').text, 'Colado');
});

run('Caption + paste → continua Caption', () => {
  const state = pasteOver(
    stateFromChildren([
      {
        id: 'el-a',
        type: DocumentSectionChildrenTypeEnum.LEGEND,
        text: 'Original',
      },
    ]),
    'el-a',
    closedHeadingSlice('Colado'),
  );
  assert.equal(dumpBlocks(state.doc)[0].type, 'docCaption');
  assert.equal(canonicalChild(state, 'el-a').type, 'LEGEND');
  assert.equal(canonicalChild(state, 'el-a').text, 'Colado');
});

run('paste preserva marks e link', () => {
  const marks = [
    schema.marks.bold.create(),
    schema.marks.italic.create(),
    schema.marks.underline.create(),
    schema.marks.link.create({
      href: 'https://simplesst.com',
      target: '_blank',
    }),
  ];
  const state = pasteOver(
    stateFromChildren([paragraph('el-a', 'Original')]),
    'el-a',
    closedHeadingSlice('Link', 'H1', marks),
  );
  const child = canonicalChild(state, 'el-a');
  assert.equal(child.type, 'PARAGRAPH');
  const styles = child.inlineStyleRangeBlock?.[0] || [];
  assert.ok(styles.some((range) => range.style === InlineStyleTypeEnum.BOLD));
  assert.ok(styles.some((range) => range.style === InlineStyleTypeEnum.ITALIC));
  assert.ok(
    styles.some((range) => range.style === InlineStyleTypeEnum.UNDERLINE),
  );
  assert.equal(
    child.entityRangeBlock?.[0]?.[0]?.data?.data?.url,
    'https://simplesst.com',
  );
});

run('paste preserva variável (não flatten)', () => {
  const variable = schema.nodes.docVariable.create({
    type: 'NOME_DA_EMPRESA',
    label: 'Empresa',
    unknown: false,
  });
  const slice = new Slice(
    Fragment.from(
      schema.nodes.docHeading.create(
        { headingType: 'H1' },
        Fragment.from([schema.text('Empresa '), variable]),
      ),
    ),
    0,
    0,
  );
  const mapped = remapPastedSliceToDestination(
    slice,
    findBlockPos(stateFromChildren([paragraph('el-a', 'X')]).doc, 'el-a').node,
  );
  let sawVariable = false;
  mapped.content.descendants((node) => {
    if (node.type.name === 'docVariable') {
      sawVariable = true;
      assert.equal(node.attrs.type, 'NOME_DA_EMPRESA');
    }
  });
  assert.equal(sawVariable, true);
  assert.equal(mapped.content.firstChild?.type.name, 'docParagraph');

  const state = pasteOver(
    stateFromChildren([paragraph('el-a', 'Original')]),
    'el-a',
    slice,
  );
  assert.equal(canonicalChild(state, 'el-a').type, 'PARAGRAPH');
  assert.equal(
    canonicalChild(state, 'el-a').text,
    'Empresa ??NOME_DA_EMPRESA??',
  );
});

run('atom no documento não é corrompido pelo paste no parágrafo vizinho', () => {
  const state = pasteOver(
    stateFromChildren([
      paragraph('p-a', 'Original'),
      {
        id: 'el-image',
        type: DocumentSectionChildrenTypeEnum.IMAGE,
        text: '',
        url: '/x.png',
      },
    ]),
    'p-a',
    closedHeadingSlice('Colado'),
  );
  assert.equal(canonicalChild(state, 'p-a').type, 'PARAGRAPH');
  assert.equal(canonicalChild(state, 'p-a').text, 'Colado');
  assert.equal(canonicalChild(state, 'el-image').type, 'IMAGE');
  assert.equal(canonicalChild(state, 'el-image').url, '/x.png');
});

run('slice com atom de bloco permanece atom (não vira H1/P)', () => {
  const dest = findBlockPos(
    stateFromChildren([paragraph('el-a', 'X')]).doc,
    'el-a',
  ).node;
  const atom = schema.nodes.docAtom.create({
    id: 'el-atom',
    atomType: 'IMAGE',
    source: { id: 'el-atom', type: 'IMAGE', text: '', url: '/x.png' },
  });
  const heading = schema.nodes.docHeading.create(
    { headingType: 'H1' },
    schema.text('Colado'),
  );
  const mapped = remapPastedSliceToDestination(
    new Slice(Fragment.from([heading, atom]), 0, 0),
    dest,
  );
  const types: string[] = [];
  mapped.content.forEach((node) => types.push(node.type.name));
  assert.deepStrictEqual(types, ['docParagraph', 'docAtom']);
  assert.equal(mapped.content.lastChild?.attrs.atomType, 'IMAGE');
});

run('Enter após parágrafo cria parágrafo — não H1', () => {
  let state = setCursor(
    stateFromChildren([paragraph('el-a', 'ABCDEF')]),
    'el-a',
    3,
  );
  const split = applyStructuralSplit(state);
  assert.equal(split.ok, true);
  state = applyStableEditableIds(split.state, createSequentialIdFactory());
  assert.deepStrictEqual(
    dumpBlocks(state.doc).map((block) => block.type),
    ['docParagraph', 'docParagraph'],
  );
  const restored = childrenOf(restore(state));
  assert.equal(restored[0].type, 'PARAGRAPH');
  assert.equal(restored[1].type, 'PARAGRAPH');
});

run('Enter após heading continua bloqueado', () => {
  const state = setCursor(
    stateFromChildren([
      heading('el-a', DocumentSectionChildrenTypeEnum.H2, 'Titulo'),
    ]),
    'el-a',
    3,
  );
  assert.equal(applyStructuralSplit(state).ok, false);
});

run('roundtrip canonical após paste no parágrafo', () => {
  const before = persistJson(
    modelWithChildren([paragraph('el-a', 'Original'), paragraph('p-b', 'Vizinho')]),
  );
  const state = pasteOver(
    stateFromChildren(before.sections[0].children!['section-body']),
    'el-a',
    closedHeadingSlice('Colado'),
  );
  const after = persistJson(restore(state));
  assert.equal(after.sections[0].children!['section-body'][0].type, 'PARAGRAPH');
  assert.equal(after.sections[0].children!['section-body'][0].text, 'Colado');
  assert.deepStrictEqual(
    after.sections[0].children!['section-body'][1],
    before.sections[0].children!['section-body'][1],
  );
});

console.log('\nV2 destination-paste specs: ok');
