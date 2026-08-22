/**
 * Runnable with:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/documentModel/editor-v2/adapter/document-editor-adapter.roundtrip.spec.ts
 */
import assert from 'assert';

import { IDocumentModelData } from 'core/interfaces/api/IDocumentModel';

import {
  collectCanonicalIds,
  collectEditorIds,
  fromDocumentEditorState,
  isAtomBlock,
  isHeadingBlock,
  isTextRunBlock,
  persistJson,
  toDocumentEditorState,
} from './index';
import {
  buildDefinitionsExcerptModel,
  buildEmptyCreateModel,
  buildInlineChildrenModel,
  buildPocCanonicalModel,
} from './fixtures/poc-canonical.fixture';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

function assertRoundtrip(model: IDocumentModelData) {
  const state = toDocumentEditorState(model);
  const restored = fromDocumentEditorState(state);

  assert.deepStrictEqual(persistJson(restored), persistJson(model));
  assert.deepStrictEqual(
    collectCanonicalIds(restored),
    collectCanonicalIds(model),
  );
  assert.deepStrictEqual(collectEditorIds(state), collectCanonicalIds(model));
}

run('POC canonical: roundtrip persistido é idêntico', () => {
  assertRoundtrip(buildPocCanonicalModel());
});

run('POC canonical: IDs estáveis na ida e na volta', () => {
  const model = buildPocCanonicalModel();
  const ids = collectCanonicalIds(model);
  assert.deepStrictEqual(ids, [
    'section-cover',
    'section-toc',
    'section-chapter',
    'section-body',
    'el-h2',
    'el-p-a',
    'el-p-b',
    'el-p-c',
    'el-bullet',
    'el-p-d',
    'el-image',
    'el-p-e',
    'el-break',
    'el-p-f',
  ]);

  const restored = fromDocumentEditorState(toDocumentEditorState(model));
  assert.deepStrictEqual(collectCanonicalIds(restored), ids);
});

run(
  'POC canonical: PARAGRAPHs consecutivos viram uma superfície textual',
  () => {
    const state = toDocumentEditorState(buildPocCanonicalModel());
    const body = state.groups[0].sections.find(
      (section) => section.id === 'section-body',
    );

    assert.ok(body);
    assert.strictEqual(body.blocks.length, 8);
    assert.ok(isHeadingBlock(body.blocks[0]));
    assert.strictEqual(body.blocks[0].type, 'H2');
    assert.ok(isTextRunBlock(body.blocks[1]));
    assert.deepStrictEqual(
      body.blocks[1].paragraphs.map((paragraph) => paragraph.id),
      ['el-p-a', 'el-p-b', 'el-p-c'],
    );
    assert.ok(isAtomBlock(body.blocks[2]));
    assert.strictEqual(body.blocks[2].type, 'BULLET');
    assert.ok(isTextRunBlock(body.blocks[3]));
    assert.deepStrictEqual(
      body.blocks[3].paragraphs.map((paragraph) => paragraph.id),
      ['el-p-d'],
    );
    assert.ok(isAtomBlock(body.blocks[4]));
    assert.strictEqual(body.blocks[4].type, 'IMAGE');
    assert.ok(isTextRunBlock(body.blocks[5]));
    assert.ok(isAtomBlock(body.blocks[6]));
    assert.strictEqual(body.blocks[6].type, 'SECTION_BREAK');
    assert.ok(isTextRunBlock(body.blocks[7]));
    assert.deepStrictEqual(
      body.blocks[7].paragraphs.map((paragraph) => paragraph.id),
      ['el-p-f'],
    );
  },
);

run('POC canonical: COVER/TOC/CHAPTER não fabricam children', () => {
  const state = toDocumentEditorState(buildPocCanonicalModel());
  const [cover, toc, chapter, body] = state.groups[0].sections;

  assert.strictEqual(cover.childrenOrigin, 'none');
  assert.strictEqual(toc.childrenOrigin, 'none');
  assert.strictEqual(chapter.childrenOrigin, 'none');
  assert.strictEqual(body.childrenOrigin, 'map');
  assert.deepStrictEqual(cover.blocks, []);
});

run('POC canonical: attrs opacos e inline styles sobrevivem', () => {
  const restored = fromDocumentEditorState(
    toDocumentEditorState(buildPocCanonicalModel()),
  );
  const children = restored.sections[0].children?.['section-body'] || [];
  const paragraphB = children.find((element) => element.id === 'el-p-b');
  const paragraphC = children.find((element) => element.id === 'el-p-c');
  const image = children.find((element) => element.id === 'el-image');
  const sectionBreak = children.find((element) => element.id === 'el-break');
  const bullet = children.find((element) => element.id === 'el-bullet');

  assert.deepStrictEqual(paragraphB?.inlineStyleRangeBlock, [
    [{ offset: 0, length: 16, style: 'BOLD' }],
  ]);
  assert.strictEqual(paragraphB?.align, 'both');
  assert.strictEqual(paragraphB?.lineHeight, 1.46);
  assert.deepStrictEqual(paragraphC?.removeWithSomeEmptyVars, ['RAZAO_SOCIAL']);
  assert.ok(paragraphC?.text.includes('??RAZAO_SOCIAL??'));
  assert.strictEqual(image?.url, '/images/placeholder-image.png');
  assert.strictEqual(image?.width, 100);
  assert.strictEqual(sectionBreak?.orientation, 'landscape');
  assert.strictEqual(bullet?.level, 0);
});

run(
  'editar um parágrafo na superfície não regenera IDs nem perde vizinhos',
  () => {
    const model = buildPocCanonicalModel();
    const state = toDocumentEditorState(model);
    const body = state.groups[0].sections.find(
      (section) => section.id === 'section-body',
    );
    assert.ok(body && isTextRunBlock(body.blocks[1]));

    body.blocks[1].paragraphs[1].text = 'Ação Corretiva (texto editado no V2).';

    const restored = fromDocumentEditorState(state);
    const children = restored.sections[0].children?.['section-body'] || [];

    assert.deepStrictEqual(
      children.map((element) => element.id),
      collectCanonicalIds(model).filter((id) => id.startsWith('el-')),
    );
    assert.strictEqual(
      children.find((element) => element.id === 'el-p-b')?.text,
      'Ação Corretiva (texto editado no V2).',
    );
    assert.strictEqual(
      children.find((element) => element.id === 'el-p-a')?.text,
      model.sections[0].children?.['section-body'][1].text,
    );
    assert.deepStrictEqual(
      children.find((element) => element.id === 'el-p-b')
        ?.inlineStyleRangeBlock,
      model.sections[0].children?.['section-body'][2].inlineStyleRangeBlock,
    );
    assert.deepStrictEqual(
      children.find((element) => element.id === 'el-p-c')
        ?.removeWithSomeEmptyVars,
      ['RAZAO_SOCIAL'],
    );
  },
);

run(
  'excerpt de definições: H1 + 8 PARAGRAPHs → 2 blocos; roundtrip lossless',
  () => {
    const model = buildDefinitionsExcerptModel();
    const state = toDocumentEditorState(model);
    const blocks = state.groups[0].sections[0].blocks;

    assert.strictEqual(blocks.length, 2);
    assert.ok(isHeadingBlock(blocks[0]));
    assert.strictEqual(blocks[0].type, 'H1');
    assert.ok(isTextRunBlock(blocks[1]));
    assert.strictEqual(blocks[1].paragraphs.length, 8);

    assertRoundtrip(model);

    const restored = fromDocumentEditorState(state);
    const linkParagraph = restored.sections[0].children?.[
      'section-definitions'
    ].find((element) => element.id === 'el-def-8');
    assert.strictEqual(
      linkParagraph?.entityRangeBlock?.[0]?.[0]?.data?.type,
      'LINK',
    );
  },
);

run('modelo vazio COVER+TOC não inventa children map', () => {
  const model = buildEmptyCreateModel();
  assert.strictEqual(model.sections[0].children, undefined);
  assertRoundtrip(model);

  const restored = fromDocumentEditorState(toDocumentEditorState(model));
  assert.strictEqual(restored.sections[0].children, undefined);
});

run(
  'children inline (mock legado) voltam inline, sem migrar para o mapa',
  () => {
    const model = buildInlineChildrenModel();
    const state = toDocumentEditorState(model);
    const section = state.groups[0].sections[0];

    assert.strictEqual(section.childrenOrigin, 'inline');
    assert.strictEqual(state.groups[0].hadChildrenMap, false);
    assert.ok(isHeadingBlock(section.blocks[0]));
    assert.ok(isTextRunBlock(section.blocks[1]));
    assert.strictEqual(section.blocks[1].paragraphs.length, 2);

    const restored = fromDocumentEditorState(state);
    assert.strictEqual(restored.sections[0].children, undefined);
    assert.strictEqual(restored.sections[0].data[0].children?.length, 3);
    assertRoundtrip(model);
  },
);

run('variáveis do modelo são clonadas, não compartilhadas', () => {
  const model = buildPocCanonicalModel();
  const state = toDocumentEditorState(model);
  state.variables[0].label = 'alterado só no editor state';
  assert.strictEqual(model.variables[0].label, 'PGR — POC Adapter');

  const restored = fromDocumentEditorState(toDocumentEditorState(model));
  restored.variables[0].label = 'alterado no restored';
  assert.strictEqual(model.variables[0].label, 'PGR — POC Adapter');
});

console.log('\nAll document-editor-adapter roundtrip tests passed.');
