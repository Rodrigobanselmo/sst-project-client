/**
 * Runnable with:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/documentModel/editor-v2/tiptap/document-editor-v2-structural.spec.ts
 */
import assert from 'assert';

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
  collectCanonicalIds,
  fromDocumentEditorState,
  isAtomBlock,
  isBulletRunBlock,
  isHeadingBlock,
  isTextRunBlock,
  persistJson,
  toDocumentEditorState,
} from '../adapter';
import { buildPocCanonicalModel } from '../adapter/fixtures/poc-canonical.fixture';
import { createSequentialIdFactory } from '../domain/document-editor-id';
import { snapSplitOffset } from '../domain/structural-edit';
import { LARGE_RUN_PARAGRAPH_COUNT } from './fixtures/large-run.fixture';
import { buildLargeDefinitionsRunModel } from './fixtures/large-run.fixture';
import { fromTipTapState } from './from-tiptap-state';
import { serializeTipTapDoc } from './schema';
import {
  deleteTipTapEditableNode,
  mergeTipTapEditableNodeWithPrevious,
  splitTipTapEditableNode,
} from './tiptap-structural-ops';
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
    level: 0,
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

function viaTipTap(
  model: IDocumentModelData,
  createId = createSequentialIdFactory(),
): IDocumentModelData {
  return fromDocumentEditorState(
    fromTipTapState(
      serializeTipTapDoc(toTipTapState(toDocumentEditorState(model))),
      { createId },
    ),
  );
}

function childrenOf(model: IDocumentModelData) {
  return model.sections[0].children?.['section-body'] || [];
}

function roundtripSplit(model: IDocumentModelData, id: string, offset: number) {
  const createId = createSequentialIdFactory();
  const tipTap = splitTipTapEditableNode(
    serializeTipTapDoc(toTipTapState(toDocumentEditorState(model))),
    id,
    offset,
    createId,
  );
  return fromDocumentEditorState(fromTipTapState(tipTap, { createId }));
}

run('1. roundtrip P/P/P continua lossless', () => {
  const model = modelWithChildren([
    paragraph('p-a', 'Um'),
    paragraph('p-b', 'Dois'),
    paragraph('p-c', 'Três'),
  ]);
  assert.deepStrictEqual(persistJson(viaTipTap(model)), persistJson(model));
});

run('2. BULLET isolado', () => {
  const model = modelWithChildren([bullet('b-1', 'Contemplar os riscos.')]);
  const restored = viaTipTap(model);
  assert.deepStrictEqual(persistJson(restored), persistJson(model));
  const state = toDocumentEditorState(restored);
  assert.ok(isBulletRunBlock(state.groups[0].sections[0].blocks[0]));
});

run('3. vários BULLET consecutivos', () => {
  const model = modelWithChildren([
    bullet('b-1', 'Um'),
    bullet('b-2', 'Dois'),
    bullet('b-3', 'Três'),
  ]);
  const restored = viaTipTap(model);
  assert.deepStrictEqual(persistJson(restored), persistJson(model));
  const runBlock =
    toDocumentEditorState(restored).groups[0].sections[0].blocks[0];
  assert.ok(isBulletRunBlock(runBlock));
  assert.deepStrictEqual(
    runBlock.bullets.map((item) => item.id),
    ['b-1', 'b-2', 'b-3'],
  );
});

run('4. P + BULLET + BULLET + P', () => {
  const model = modelWithChildren([
    paragraph('p-1', 'O PGR deve:'),
    bullet('b-1', 'Contemplar os riscos'),
    bullet('b-2', 'Prever providências'),
    paragraph('p-2', 'Esse programa...'),
  ]);
  const restored = viaTipTap(model);
  assert.deepStrictEqual(persistJson(restored), persistJson(model));
  const blocks = toDocumentEditorState(restored).groups[0].sections[0].blocks;
  assert.ok(isTextRunBlock(blocks[0]));
  assert.ok(isBulletRunBlock(blocks[1]));
  assert.ok(isTextRunBlock(blocks[2]));
  assert.deepStrictEqual(
    childrenOf(restored).map((item) => item.type),
    ['PARAGRAPH', 'BULLET', 'BULLET', 'PARAGRAPH'],
  );
});

run('5. BULLET levels 0–6', () => {
  const model = modelWithChildren(
    [0, 1, 2, 3, 4, 5, 6].map((level) =>
      bullet(`b-${level}`, `nível ${level}`, { level }),
    ),
  );
  const restored = viaTipTap(model);
  assert.deepStrictEqual(
    childrenOf(restored).map((item) => item.level),
    [0, 1, 2, 3, 4, 5, 6],
  );
});

run('6. BULLET com bold', () => {
  const model = modelWithChildren([
    bullet('b-bold', 'Texto forte', {
      inlineStyleRangeBlock: [
        [{ offset: 0, length: 5, style: InlineStyleTypeEnum.BOLD }],
      ],
    }),
  ]);
  const restored = viaTipTap(model);
  assert.deepStrictEqual(
    childrenOf(restored)[0].inlineStyleRangeBlock,
    model.sections[0].children!['section-body'][0].inlineStyleRangeBlock,
  );
});

run('7. BULLET com hyperlink', () => {
  const model = modelWithChildren([
    bullet('b-link', 'Ver www.mte.gov.br aqui', {
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
  ]);
  const restored = viaTipTap(model);
  assert.strictEqual(
    childrenOf(restored)[0].entityRangeBlock?.[0]?.[0]?.data?.data.url,
    'http://www.mte.gov.br',
  );
});

run('8. BULLET com variável', () => {
  const model = modelWithChildren([
    bullet('b-var', 'Empresa ??NOME_DA_EMPRESA?? segue', {
      removeWithSomeEmptyVars: ['NOME_DA_EMPRESA'],
    }),
  ]);
  const restored = viaTipTap(model);
  assert.ok(childrenOf(restored)[0].text.includes('??NOME_DA_EMPRESA??'));
  assert.deepStrictEqual(childrenOf(restored)[0].removeWithSomeEmptyVars, [
    'NOME_DA_EMPRESA',
  ]);
});

run('9. split de PARAGRAPH preservando id do primeiro', () => {
  const restored = roundtripSplit(
    modelWithChildren([paragraph('p-a', 'texto antes texto depois')]),
    'p-a',
    11,
  );
  const children = childrenOf(restored);
  assert.strictEqual(children[0].id, 'p-a');
  assert.strictEqual(children[0].text, 'texto antes');
  assert.strictEqual(children[1].text, ' texto depois');
});

run('10. novo fragmento recebe somente um novo id', () => {
  const restored = roundtripSplit(
    modelWithChildren([
      paragraph('p-a', 'texto antes texto depois'),
      paragraph('p-b', 'vizinho'),
    ]),
    'p-a',
    11,
  );
  const ids = childrenOf(restored).map((item) => item.id);
  assert.deepStrictEqual(ids, ['p-a', 'new-1', 'p-b']);
});

run('11. merge preservando id superior', () => {
  const model = modelWithChildren([
    paragraph('p-a', 'texto antes'),
    paragraph('p-b', ' texto depois'),
  ]);
  const merged = mergeTipTapEditableNodeWithPrevious(
    serializeTipTapDoc(toTipTapState(toDocumentEditorState(model))),
    'p-b',
  );
  const restored = fromDocumentEditorState(fromTipTapState(merged));
  const children = childrenOf(restored);
  assert.deepStrictEqual(
    children.map((item) => item.id),
    ['p-a'],
  );
  assert.strictEqual(children[0].text, 'texto antes texto depois');
});

run('12. delete não altera ids vizinhos', () => {
  const model = modelWithChildren([
    paragraph('p-a', 'A'),
    paragraph('p-b', 'B'),
    paragraph('p-c', 'C'),
  ]);
  const deleted = deleteTipTapEditableNode(
    serializeTipTapDoc(toTipTapState(toDocumentEditorState(model))),
    'p-b',
  );
  const restored = fromDocumentEditorState(fromTipTapState(deleted));
  assert.deepStrictEqual(
    childrenOf(restored).map((item) => item.id),
    ['p-a', 'p-c'],
  );
});

run('13. split com bold atravessando a posição', () => {
  const model = modelWithChildren([
    paragraph('p-a', 'ABCDEF', {
      inlineStyleRangeBlock: [
        [{ offset: 0, length: 6, style: InlineStyleTypeEnum.BOLD }],
      ],
    }),
  ]);
  const restored = roundtripSplit(model, 'p-a', 3);
  const children = childrenOf(restored);
  assert.deepStrictEqual(children[0].inlineStyleRangeBlock, [
    [{ offset: 0, length: 3, style: InlineStyleTypeEnum.BOLD }],
  ]);
  assert.deepStrictEqual(children[1].inlineStyleRangeBlock, [
    [{ offset: 0, length: 3, style: InlineStyleTypeEnum.BOLD }],
  ]);
});

run('14. split com hyperlink', () => {
  const model = modelWithChildren([
    paragraph('p-a', 'ver www.mte.gov.br fim', {
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
  ]);
  const restored = roundtripSplit(model, 'p-a', 10);
  const first = childrenOf(restored)[0].entityRangeBlock?.[0]?.[0];
  const second = childrenOf(restored)[1].entityRangeBlock?.[0]?.[0];
  assert.strictEqual(first?.data?.data.url, 'http://www.mte.gov.br');
  assert.strictEqual(second?.data?.data.url, 'http://www.mte.gov.br');
});

run('15. merge de ranges com offsets corretos', () => {
  const model = modelWithChildren([
    paragraph('p-a', 'ABC', {
      inlineStyleRangeBlock: [
        [{ offset: 0, length: 3, style: InlineStyleTypeEnum.BOLD }],
      ],
    }),
    paragraph('p-b', 'DEF', {
      inlineStyleRangeBlock: [
        [{ offset: 0, length: 3, style: InlineStyleTypeEnum.ITALIC }],
      ],
    }),
  ]);
  const merged = mergeTipTapEditableNodeWithPrevious(
    serializeTipTapDoc(toTipTapState(toDocumentEditorState(model))),
    'p-b',
  );
  const restored = fromDocumentEditorState(fromTipTapState(merged));
  assert.deepStrictEqual(childrenOf(restored)[0].inlineStyleRangeBlock, [
    [
      { offset: 0, length: 3, style: InlineStyleTypeEnum.BOLD },
      { offset: 3, length: 3, style: InlineStyleTypeEnum.ITALIC },
    ],
  ]);
});

run('16. variável antes do split', () => {
  const text = '??NOME_DA_EMPRESA?? continua';
  const restored = roundtripSplit(
    modelWithChildren([paragraph('p-a', text)]),
    'p-a',
    '??NOME_DA_EMPRESA??'.length,
  );
  assert.strictEqual(childrenOf(restored)[0].text, '??NOME_DA_EMPRESA??');
  assert.strictEqual(childrenOf(restored)[1].text, ' continua');
});

run('17. variável depois do split', () => {
  const restored = roundtripSplit(
    modelWithChildren([paragraph('p-a', 'antes ??NOME_DA_EMPRESA??')]),
    'p-a',
    6,
  );
  assert.strictEqual(childrenOf(restored)[0].text, 'antes ');
  assert.strictEqual(childrenOf(restored)[1].text, '??NOME_DA_EMPRESA??');
});

run('18. variável próxima à fronteira de merge', () => {
  const model = modelWithChildren([
    paragraph('p-a', '??NOME_DA_EMPRESA??'),
    paragraph('p-b', ' depois'),
  ]);
  const merged = mergeTipTapEditableNodeWithPrevious(
    serializeTipTapDoc(toTipTapState(toDocumentEditorState(model))),
    'p-b',
  );
  const restored = fromDocumentEditorState(fromTipTapState(merged));
  assert.strictEqual(
    childrenOf(restored)[0].text,
    '??NOME_DA_EMPRESA?? depois',
  );
});

run('19. 100 PARAGRAPHs sem edição continuam lossless', () => {
  const model = buildLargeDefinitionsRunModel();
  const restored = viaTipTap(model);
  assert.deepStrictEqual(persistJson(restored), persistJson(model));
  const blocks = toDocumentEditorState(restored).groups[0].sections[0].blocks;
  assert.ok(isTextRunBlock(blocks[1]));
  assert.strictEqual(blocks[1].paragraphs.length, LARGE_RUN_PARAGRAPH_COUNT);
});

run('20. unknown atom continua intacto', () => {
  const model = modelWithChildren([
    paragraph('p-1', 'Antes'),
    { id: 'el-future', type: 'FUTURE_UNKNOWN_TYPE', text: '' },
    paragraph('p-2', 'Depois'),
  ]);
  const restored = viaTipTap(model);
  assert.strictEqual(childrenOf(restored)[1].type, 'FUTURE_UNKNOWN_TYPE');
  assert.deepStrictEqual(persistJson(restored), persistJson(model));
});

run('21. IMAGE continua atom intacto', () => {
  const model = modelWithChildren([
    paragraph('p-1', 'Antes'),
    {
      id: 'el-image',
      type: DocumentSectionChildrenTypeEnum.IMAGE,
      text: '',
      url: '/x.png',
      width: 80,
    },
    paragraph('p-2', 'Depois'),
  ]);
  const restored = viaTipTap(model);
  assert.strictEqual(childrenOf(restored)[1].url, '/x.png');
  const blocks = toDocumentEditorState(restored).groups[0].sections[0].blocks;
  assert.ok(isAtomBlock(blocks[1]));
});

run('22. BREAK continua atom intacto', () => {
  const model = modelWithChildren([
    paragraph('p-1', 'Antes'),
    { id: 'el-break', type: DocumentSectionChildrenTypeEnum.BREAK, text: '' },
    paragraph('p-2', 'Depois'),
  ]);
  const restored = viaTipTap(model);
  assert.strictEqual(childrenOf(restored)[1].type, 'BREAK');
});

run('23. SECTION_BREAK continua atom com orientation intacta', () => {
  const model = buildPocCanonicalModel();
  const restored = viaTipTap(model);
  const sectionBreak = childrenOf(restored).find(
    (item) => item.id === 'el-break',
  );
  assert.strictEqual(sectionBreak?.type, 'SECTION_BREAK');
  assert.strictEqual(sectionBreak?.orientation, 'landscape');
});

run('24. heading continua boundary protegido', () => {
  const model = modelWithChildren([
    paragraph('p-1', 'Antes'),
    { id: 'h-1', type: DocumentSectionChildrenTypeEnum.H2, text: 'Título' },
    paragraph('p-2', 'Depois'),
  ]);
  const blocks = toDocumentEditorState(viaTipTap(model)).groups[0].sections[0]
    .blocks;
  assert.ok(isHeadingBlock(blocks[1]));
  assert.strictEqual(blocks[1].id, 'h-1');
});

run('25. roundtrip sem edição = JSON persistido idêntico', () => {
  const model = buildPocCanonicalModel();
  assert.deepStrictEqual(persistJson(viaTipTap(model)), persistJson(model));
  assert.deepStrictEqual(
    collectCanonicalIds(viaTipTap(model)),
    collectCanonicalIds(model),
  );
});

run('split dentro de variável não corrompe o token', () => {
  const text = 'x ??NOME_DA_EMPRESA?? y';
  const inside = text.indexOf('NOME') + 2;
  assert.equal(
    snapSplitOffset(text, inside),
    text.indexOf('??NOME_DA_EMPRESA??') + '??NOME_DA_EMPRESA??'.length,
  );
  const restored = roundtripSplit(
    modelWithChildren([paragraph('p-a', text)]),
    'p-a',
    inside,
  );
  assert.ok(childrenOf(restored)[0].text.includes('??NOME_DA_EMPRESA??'));
  assert.equal(
    childrenOf(restored)[0].text.includes('??NOME_DA_EMPRESA?? y'),
    false,
  );
  assert.equal(childrenOf(restored)[1].text.includes('??'), false);
});

run('split de BULLET preserva type e level', () => {
  const restored = roundtripSplit(
    modelWithChildren([bullet('b-1', 'um dois', { level: 2 })]),
    'b-1',
    3,
  );
  const children = childrenOf(restored);
  assert.strictEqual(children[0].id, 'b-1');
  assert.strictEqual(children[0].type, 'BULLET');
  assert.strictEqual(children[1].type, 'BULLET');
  assert.strictEqual(children[0].level, 2);
  assert.strictEqual(children[1].level, 2);
});

console.log('\nFase 3 structural specs: ok');
