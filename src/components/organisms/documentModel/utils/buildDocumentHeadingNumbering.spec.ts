/**
 * Runnable with:
 *   yarn ts-node -r tsconfig-paths/register \
 *     src/components/organisms/documentModel/utils/buildDocumentHeadingNumbering.spec.ts
 *
 * Also validates modal tab mapping for Demand A.
 */
import assert from 'assert';

import { DocumentTypeEnum } from 'project/enum/document.enums';

import {
  getDocumentModelModalStep,
  getProgramsLaudosDocumentType,
} from '../../modals/ModalViewDocumentModels/document-model-modal-type.util';
import {
  buildDocumentHeadingNumbering,
  isDocumentHeadingType,
} from './buildDocumentHeadingNumbering';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

run('single H1', () => {
  const map = buildDocumentHeadingNumbering([
    {
      data: [{ id: 's1' }],
      children: {
        s1: [{ id: 'h1', type: 'H1', text: 'Apresentação' }],
      },
    },
  ]);
  assert.strictEqual(map.h1.number, '1.');
  assert.strictEqual(map.h1.displayText, '1. Apresentação');
});

run('several H1', () => {
  const map = buildDocumentHeadingNumbering([
    {
      data: [{ id: 's1' }],
      children: {
        s1: [
          { id: 'a', type: 'H1', text: 'A' },
          { id: 'b', type: 'H1', text: 'B' },
        ],
      },
    },
  ]);
  assert.strictEqual(map.a.number, '1.');
  assert.strictEqual(map.b.number, '2.');
});

run('H1 with several H2', () => {
  const map = buildDocumentHeadingNumbering([
    {
      data: [{ id: 's1' }],
      children: {
        s1: [
          { id: 'h1', type: 'H1', text: 'Registros' },
          { id: 'h21', type: 'H2', text: 'ASO' },
          { id: 'h22', type: 'H2', text: 'Prontuários' },
          { id: 'h23', type: 'H2', text: 'Sigilo' },
          { id: 'h24', type: 'H2', text: 'Guarda' },
        ],
      },
    },
  ]);
  assert.strictEqual(map.h1.number, '1.');
  assert.strictEqual(map.h21.number, '1.1.');
  assert.strictEqual(map.h22.number, '1.2.');
  assert.strictEqual(map.h23.number, '1.3.');
  assert.strictEqual(map.h24.number, '1.4.');
});

run('H3 inside H2', () => {
  const map = buildDocumentHeadingNumbering([
    {
      data: [{ id: 's1' }],
      children: {
        s1: [
          { id: 'h1', type: 'H1', text: 'Cap' },
          { id: 'h2', type: 'H2', text: 'Sub' },
          { id: 'h3', type: 'H3', text: 'Detalhe' },
        ],
      },
    },
  ]);
  assert.strictEqual(map.h3.number, '1.1.1.');
});

run('reset H2/H3 after new H1', () => {
  const map = buildDocumentHeadingNumbering([
    {
      data: [{ id: 's1' }],
      children: {
        s1: [
          { id: 'h1a', type: 'H1', text: '17' },
          { id: 'h2a', type: 'H2', text: '17.1' },
          { id: 'h3a', type: 'H3', text: '17.1.1' },
          { id: 'h1b', type: 'H1', text: '18' },
          { id: 'h2b', type: 'H2', text: '18.1' },
        ],
      },
    },
  ]);
  assert.strictEqual(map.h1b.number, '2.');
  assert.strictEqual(map.h2b.number, '2.1.');
  assert.strictEqual(map.h3a.number, '1.1.1.');
});

run('reset H3 after new H2', () => {
  const map = buildDocumentHeadingNumbering([
    {
      data: [{ id: 's1' }],
      children: {
        s1: [
          { id: 'h1', type: 'H1', text: 'A' },
          { id: 'h2a', type: 'H2', text: 'A1' },
          { id: 'h3a', type: 'H3', text: 'A1a' },
          { id: 'h2b', type: 'H2', text: 'A2' },
          { id: 'h3b', type: 'H3', text: 'A2a' },
        ],
      },
    },
  ]);
  assert.strictEqual(map.h3a.number, '1.1.1.');
  assert.strictEqual(map.h2b.number, '1.2.');
  assert.strictEqual(map.h3b.number, '1.2.1.');
});

run('ignores TITLE, CHAPTER, BREAK, PARAGRAPH, BULLET', () => {
  const map = buildDocumentHeadingNumbering([
    {
      data: [{ id: 's1', type: 'SECTION' }],
      children: {
        s1: [
          { id: 't', type: 'TITLE', text: 'PARTE 06' },
          { id: 'p', type: 'PARAGRAPH', text: 'texto' },
          { id: 'b', type: 'BULLET', text: 'item' },
          { id: 'br', type: 'BREAK', text: '' },
          { id: 'h1', type: 'H1', text: 'Registros' },
        ],
      },
    },
  ]);
  assert.strictEqual(Object.keys(map).length, 1);
  assert.strictEqual(map.h1.number, '1.');
  assert.ok(!map.t);
});

run('continuity across Parts (sections)', () => {
  const map = buildDocumentHeadingNumbering([
    {
      data: [{ id: 'p5' }],
      children: {
        p5: [{ id: 'h16', type: 'H1', text: 'Item 16' }],
      },
    },
    {
      data: [{ id: 'p6' }],
      children: {
        p6: [
          { id: 'title', type: 'TITLE', text: 'PARTE 06' },
          { id: 'h17', type: 'H1', text: 'Registros' },
          { id: 'h171', type: 'H2', text: 'ASO' },
        ],
      },
    },
  ]);
  assert.strictEqual(map.h16.number, '1.');
  assert.strictEqual(map.h17.number, '2.');
  assert.strictEqual(map.h171.number, '2.1.');
});

run('annex TITLE without H1 numbers', () => {
  const map = buildDocumentHeadingNumbering([
    {
      data: [{ id: 'body' }],
      children: {
        body: [{ id: 'enc', type: 'H1', text: 'Encerramento' }],
      },
    },
    {
      data: [{ id: 'anx' }],
      children: {
        anx: [
          { id: 'sep', type: 'TITLE', text: 'ANEXOS' },
          { id: 'aa', type: 'TITLE', text: 'Anexo A' },
          { id: 'ab', type: 'TITLE', text: 'Anexo B' },
        ],
      },
    },
  ]);
  assert.strictEqual(map.enc.number, '1.');
  assert.ok(!map.sep && !map.aa && !map.ab);
});

run('same text different ids get distinct numbers', () => {
  const map = buildDocumentHeadingNumbering([
    {
      data: [{ id: 's1' }],
      children: {
        s1: [
          { id: 'a', type: 'H1', text: 'Igual' },
          { id: 'b', type: 'H1', text: 'Igual' },
        ],
      },
    },
  ]);
  assert.strictEqual(map.a.number, '1.');
  assert.strictEqual(map.b.number, '2.');
  assert.strictEqual(map.a.displayText, '1. Igual');
  assert.strictEqual(map.b.displayText, '2. Igual');
});

run('add/remove reflected by rebuilding', () => {
  const base = [
    {
      data: [{ id: 's1' }],
      children: {
        s1: [
          { id: 'a', type: 'H1', text: 'A' },
          { id: 'b', type: 'H1', text: 'B' },
        ],
      },
    },
  ];
  assert.strictEqual(buildDocumentHeadingNumbering(base).b.number, '2.');
  const removed = [
    {
      data: [{ id: 's1' }],
      children: {
        s1: [{ id: 'b', type: 'H1', text: 'B' }],
      },
    },
  ];
  assert.strictEqual(buildDocumentHeadingNumbering(removed).b.number, '1.');
});

run('invalid structure (H2 before H1) does not throw', () => {
  const map = buildDocumentHeadingNumbering([
    {
      data: [{ id: 's1' }],
      children: {
        s1: [{ id: 'orphan', type: 'H2', text: 'Órfão' }],
      },
    },
  ]);
  assert.strictEqual(map.orphan.number, '0.1.');
});

run('empty / null input safe', () => {
  assert.deepStrictEqual(buildDocumentHeadingNumbering(null), {});
  assert.deepStrictEqual(buildDocumentHeadingNumbering(undefined), {});
  assert.deepStrictEqual(buildDocumentHeadingNumbering([]), {});
});

run('isDocumentHeadingType', () => {
  assert.ok(isDocumentHeadingType('H1'));
  assert.ok(isDocumentHeadingType('H3'));
  assert.ok(!isDocumentHeadingType('TITLE'));
  assert.ok(!isDocumentHeadingType('PARAGRAPH'));
});

run('modal: Programs tab index maps to document type', () => {
  assert.strictEqual(getProgramsLaudosDocumentType(0), DocumentTypeEnum.PGR);
  assert.strictEqual(getProgramsLaudosDocumentType(1), DocumentTypeEnum.PCSMO);
  assert.strictEqual(
    getProgramsLaudosDocumentType(2),
    DocumentTypeEnum.PERICULOSIDADE,
  );
  assert.strictEqual(
    getProgramsLaudosDocumentType(3),
    DocumentTypeEnum.INSALUBRIDADE,
  );
  assert.strictEqual(getProgramsLaudosDocumentType(4), DocumentTypeEnum.LTCAT);
  assert.strictEqual(getProgramsLaudosDocumentType(5), DocumentTypeEnum.FRPS);
  assert.strictEqual(getProgramsLaudosDocumentType(undefined), DocumentTypeEnum.PGR);
});

run('modal: document type maps to modal step (order differs from Programs)', () => {
  assert.strictEqual(getDocumentModelModalStep(DocumentTypeEnum.PGR), 0);
  assert.strictEqual(getDocumentModelModalStep(DocumentTypeEnum.PCSMO), 1);
  assert.strictEqual(getDocumentModelModalStep(DocumentTypeEnum.LTCAT), 2);
  assert.strictEqual(
    getDocumentModelModalStep(DocumentTypeEnum.PERICULOSIDADE),
    3,
  );
  assert.strictEqual(
    getDocumentModelModalStep(DocumentTypeEnum.INSALUBRIDADE),
    4,
  );
  assert.strictEqual(getDocumentModelModalStep(DocumentTypeEnum.FRPS), 5);
  assert.strictEqual(getDocumentModelModalStep(undefined), 0);
});

run('PCMSO Programs tab opens modal step for PCSMO (not LTCAT)', () => {
  const type = getProgramsLaudosDocumentType(1);
  assert.strictEqual(type, DocumentTypeEnum.PCSMO);
  assert.strictEqual(getDocumentModelModalStep(type), 1);
});

run('LTCAT Programs tab (index 4) opens modal LTCAT step (index 2)', () => {
  const type = getProgramsLaudosDocumentType(4);
  assert.strictEqual(type, DocumentTypeEnum.LTCAT);
  assert.strictEqual(getDocumentModelModalStep(type), 2);
});

console.log('\nAll numbering / modal-type checks passed.');
