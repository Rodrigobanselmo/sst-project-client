/**
 * Runnable with:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/documentModel/editor-v2/tiptap/document-editor-tiptap.roundtrip.spec.ts
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';

import { JSONContent } from '@tiptap/core';
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
  collectCanonicalIds,
  fromDocumentEditorState,
  persistJson,
  toDocumentEditorState,
} from '../adapter';
import {
  buildDefinitionsExcerptModel,
  buildEmptyCreateModel,
  buildPocCanonicalModel,
} from '../adapter/fixtures/poc-canonical.fixture';
import { isAtomBlock, isHeadingBlock, isTextRunBlock } from '../adapter';
import { findTipTapParagraph } from './find-tiptap-nodes';
import {
  buildLargeDefinitionsRunModel,
  LARGE_RUN_PARAGRAPH_COUNT,
} from './fixtures/large-run.fixture';
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

function viaTipTap(model: IDocumentModelData): IDocumentModelData {
  const editorState = toDocumentEditorState(model);
  const tipTap = serializeTipTapDoc(toTipTapState(editorState));
  return fromDocumentEditorState(fromTipTapState(tipTap));
}

function assertLossless(model: IDocumentModelData) {
  const restored = viaTipTap(model);
  assert.deepStrictEqual(persistJson(restored), persistJson(model));
  assert.deepStrictEqual(
    collectCanonicalIds(restored),
    collectCanonicalIds(model),
  );
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

function modelWithChildren(
  children: IDocumentModelElement[],
): IDocumentModelData {
  return {
    variables: [{ type: 'RAZAO_SOCIAL', label: 'Empresa Exemplo LTDA' }],
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

run('1A adapter files do not import TipTap', () => {
  const adapterDir = path.join(__dirname, '..', 'adapter');
  const files = fs
    .readdirSync(adapterDir, { recursive: true })
    .map(String)
    .filter((file) => file.endsWith('.ts'));

  files.forEach((file) => {
    const source = fs.readFileSync(path.join(adapterDir, file), 'utf8');
    assert.doesNotMatch(
      source,
      /@tiptap|tiptap\/|from '\.\.\/tiptap/,
      `${file} não pode importar TipTap`,
    );
  });
});

run('DocumentEditorState → TipTap → DocumentEditorState lossless', () => {
  const model = buildPocCanonicalModel();
  const state = toDocumentEditorState(model);
  const tipTap = serializeTipTapDoc(toTipTapState(state));
  const restoredState = fromTipTapState(tipTap);
  const restored = fromDocumentEditorState(restoredState);

  assert.deepStrictEqual(persistJson(restored), persistJson(model));
  const body = restoredState.groups[0].sections.find(
    (section) => section.id === 'section-body',
  );
  assert.ok(body);
  assert.ok(isHeadingBlock(body.blocks[0]));
  assert.ok(isTextRunBlock(body.blocks[1]));
  assert.strictEqual(body.blocks[1].paragraphs.length, 3);
});

run('JSON → TipTap → JSON lossless no caso canônico', () => {
  assertLossless(buildPocCanonicalModel());
});

run('JSON → TipTap → JSON lossless no excerpt de definições', () => {
  assertLossless(buildDefinitionsExcerptModel());
});

run('JSON → TipTap → JSON lossless no modelo vazio COVER+TOC', () => {
  assertLossless(buildEmptyCreateModel());
});

run('edição de texto de um único paragraph', () => {
  const model = buildPocCanonicalModel();
  const tipTap = serializeTipTapDoc(
    toTipTapState(toDocumentEditorState(model)),
  );
  const paragraphB = findTipTapParagraph(tipTap, 'el-p-b');
  assert.ok(paragraphB);

  const newText =
    'Ação Corretiva (texto editado no V2). continua após o termo.';
  paragraphB.content = [
    {
      type: 'text',
      text: newText.slice(0, 16),
      marks: [{ type: 'bold' }],
    },
    { type: 'text', text: newText.slice(16) },
  ];

  const restored = fromDocumentEditorState(fromTipTapState(tipTap));
  const children = restored.sections[0].children?.['section-body'] || [];
  const original = model.sections[0].children?.['section-body'] || [];

  assert.deepStrictEqual(
    children.map((element) => element.id),
    original.map((element) => element.id),
  );
  assert.strictEqual(children.find((el) => el.id === 'el-p-b')?.text, newText);
  assert.deepStrictEqual(
    children.find((el) => el.id === 'el-p-b')?.inlineStyleRangeBlock,
    original.find((el) => el.id === 'el-p-b')?.inlineStyleRangeBlock,
  );
  assert.strictEqual(
    children.find((el) => el.id === 'el-p-a')?.text,
    original.find((el) => el.id === 'el-p-a')?.text,
  );
  assert.strictEqual(
    children.find((el) => el.id === 'el-p-c')?.text,
    original.find((el) => el.id === 'el-p-c')?.text,
  );
  assert.strictEqual(
    children.find((el) => el.id === 'el-h2')?.text,
    'Definições',
  );
  assert.strictEqual(
    children.find((el) => el.id === 'el-image')?.url,
    original[6].url,
  );
});

run('bold altera só o paragraph correspondente', () => {
  const model = modelWithChildren([
    paragraph('el-h-bound', 'não é heading', {}),
    paragraph('el-plain-a', 'Texto sem forma.'),
    paragraph('el-plain-b', 'Segundo parágrafo.'),
  ]);
  model.sections[0].children!['section-body'][0] = {
    id: 'el-h2',
    type: DocumentSectionChildrenTypeEnum.H2,
    text: 'Título',
  };

  const tipTap = serializeTipTapDoc(
    toTipTapState(toDocumentEditorState(model)),
  );
  const target = findTipTapParagraph(tipTap, 'el-plain-a');
  assert.ok(target);
  target.content = [
    {
      type: 'text',
      text: 'Texto sem forma.',
      marks: [{ type: 'bold' }],
    },
  ];

  const restored = fromDocumentEditorState(fromTipTapState(tipTap));
  const children = restored.sections[0].children?.['section-body'] || [];
  assert.deepStrictEqual(children[1].inlineStyleRangeBlock, [
    [{ offset: 0, length: 16, style: InlineStyleTypeEnum.BOLD }],
  ]);
  assert.strictEqual(children[2].inlineStyleRangeBlock, undefined);
  assert.strictEqual(children[0].text, 'Título');
});

run('hyperlink externo sobrevive', () => {
  const restored = viaTipTap(buildDefinitionsExcerptModel());
  const link = restored.sections[0].children?.['section-definitions'].find(
    (element) => element.id === 'el-def-8',
  );
  assert.strictEqual(link?.entityRangeBlock?.[0]?.[0]?.data?.type, 'LINK');
  assert.strictEqual(
    link?.entityRangeBlock?.[0]?.[0]?.data?.data.url,
    'http://www.mte.gov.br',
  );
});

run('variável ??...?? permanece texto literal', () => {
  const restored = viaTipTap(buildPocCanonicalModel());
  const paragraphC = restored.sections[0].children?.['section-body'].find(
    (element) => element.id === 'el-p-c',
  );
  assert.ok(paragraphC?.text.includes('??RAZAO_SOCIAL??'));
  assert.deepStrictEqual(paragraphC?.removeWithSomeEmptyVars, ['RAZAO_SOCIAL']);
});

run('align diferente entre paragraphs do mesmo run', () => {
  const model = modelWithChildren([
    paragraph('el-left', 'Esquerda', { align: DocModelAlignmentType.START }),
    paragraph('el-just', 'Justificado', { align: DocModelAlignmentType.BOTH }),
  ]);
  assertLossless(model);

  const state = fromTipTapState(
    serializeTipTapDoc(toTipTapState(toDocumentEditorState(model))),
  );
  assert.ok(isTextRunBlock(state.groups[0].sections[0].blocks[0]));
  assert.strictEqual(
    state.groups[0].sections[0].blocks[0].paragraphs[0].align,
    'start',
  );
  assert.strictEqual(
    state.groups[0].sections[0].blocks[0].paragraphs[1].align,
    'both',
  );
});

run('lineHeight diferente entre paragraphs do mesmo run', () => {
  const model = modelWithChildren([
    paragraph('el-lh-1', 'Simples', { lineHeight: 1 }),
    paragraph('el-lh-2', 'Duplo', { lineHeight: 2 }),
  ]);
  assertLossless(model);
});

run('Heading é boundary e não funde TextRuns', () => {
  const model = modelWithChildren([
    paragraph('el-p-1', 'Antes A'),
    paragraph('el-p-2', 'Antes B'),
    {
      id: 'el-h2',
      type: DocumentSectionChildrenTypeEnum.H2,
      text: 'Meio',
    },
    paragraph('el-p-3', 'Depois A'),
    paragraph('el-p-4', 'Depois B'),
  ]);
  const state = fromTipTapState(
    serializeTipTapDoc(toTipTapState(toDocumentEditorState(model))),
  );
  const blocks = state.groups[0].sections[0].blocks;
  assert.strictEqual(blocks.length, 3);
  assert.ok(isTextRunBlock(blocks[0]));
  assert.deepStrictEqual(
    blocks[0].paragraphs.map((item) => item.id),
    ['el-p-1', 'el-p-2'],
  );
  assert.ok(isHeadingBlock(blocks[1]));
  assert.ok(isTextRunBlock(blocks[2]));
  assert.deepStrictEqual(
    blocks[2].paragraphs.map((item) => item.id),
    ['el-p-3', 'el-p-4'],
  );
  assertLossless(model);
});

run('Atom é boundary e não funde TextRuns', () => {
  const model = modelWithChildren([
    paragraph('el-p-1', 'Antes A'),
    paragraph('el-p-2', 'Antes B'),
    {
      id: 'el-image',
      type: DocumentSectionChildrenTypeEnum.IMAGE,
      text: '',
      url: '/x.png',
      width: 80,
    },
    paragraph('el-p-3', 'Depois A'),
    paragraph('el-p-4', 'Depois B'),
  ]);
  const state = fromTipTapState(
    serializeTipTapDoc(toTipTapState(toDocumentEditorState(model))),
  );
  const blocks = state.groups[0].sections[0].blocks;
  assert.strictEqual(blocks.length, 3);
  assert.ok(isTextRunBlock(blocks[0]));
  assert.ok(isAtomBlock(blocks[1]));
  assert.strictEqual(blocks[1].type, 'IMAGE');
  assert.ok(isTextRunBlock(blocks[2]));
  assertLossless(model);
});

run('tipo desconhecido vira Atom genérico e não se perde', () => {
  const model = modelWithChildren([
    paragraph('el-p-1', 'Antes'),
    {
      id: 'el-future',
      type: 'FUTURE_UNKNOWN_TYPE',
      text: '',
    },
    paragraph('el-p-2', 'Depois'),
  ]);
  const state = fromTipTapState(
    serializeTipTapDoc(toTipTapState(toDocumentEditorState(model))),
  );
  const blocks = state.groups[0].sections[0].blocks;
  assert.ok(isAtomBlock(blocks[1]));
  assert.strictEqual(blocks[1].type, 'FUTURE_UNKNOWN_TYPE');
  assert.strictEqual(blocks[1].source.type, 'FUTURE_UNKNOWN_TYPE');
  assertLossless(model);
});

run('IDs preservados em toda a cadeia', () => {
  const model = buildPocCanonicalModel();
  const ids = collectCanonicalIds(model);
  assert.deepStrictEqual(collectCanonicalIds(viaTipTap(model)), ids);
});

run('run grande (~100 PARAGRAPHs) é lossless e continua um TextRun', () => {
  const model = buildLargeDefinitionsRunModel();
  const state = fromTipTapState(
    serializeTipTapDoc(toTipTapState(toDocumentEditorState(model))),
  );
  const blocks = state.groups[0].sections[0].blocks;
  assert.ok(isHeadingBlock(blocks[0]));
  assert.ok(isTextRunBlock(blocks[1]));
  assert.strictEqual(blocks[1].paragraphs.length, LARGE_RUN_PARAGRAPH_COUNT);
  assert.ok(isAtomBlock(blocks[2]));
  assert.strictEqual(blocks[2].type, 'TABLE_GSE');
  assert.ok(isTextRunBlock(blocks[3]));
  assertLossless(model);
});

run(
  'paragraph TipTap sem id recebe UUID novo e não reutiliza ids existentes',
  () => {
    const model = modelWithChildren([paragraph('el-p-1', 'Texto')]);
    const tipTap = serializeTipTapDoc(
      toTipTapState(toDocumentEditorState(model)),
    );
    const target = findTipTapParagraph(tipTap, 'el-p-1');
    assert.ok(target);
    const orphan: JSONContent = {
      type: 'docParagraph',
      attrs: { id: null, source: null },
      content: [{ type: 'text', text: 'novo via Enter' }],
    };
    tipTap.content?.[0].content?.[0].content?.push(orphan);

    const restored = fromDocumentEditorState(
      fromTipTapState(tipTap, { createId: () => 'generated-1' }),
    );
    const children = restored.sections[0].children?.['section-body'] || [];
    assert.deepStrictEqual(
      children.map((element) => element.id),
      ['el-p-1', 'generated-1'],
    );
    assert.strictEqual(children[1].type, 'PARAGRAPH');
    assert.strictEqual(children[1].text, 'novo via Enter');
  },
);

console.log('\nAll document-editor-tiptap roundtrip tests passed.');
