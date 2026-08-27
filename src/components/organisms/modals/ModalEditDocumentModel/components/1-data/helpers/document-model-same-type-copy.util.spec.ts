/**
 * Runnable with:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/modals/ModalEditDocumentModel/components/1-data/helpers/document-model-same-type-copy.util.spec.ts
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';

import {
  DocumentModelClassificationEnum,
  toggleDocumentModelClassification,
} from 'project/enum/document-model-classification.enum';
import { DocumentTypeEnum } from 'project/enum/document.enums';

import {
  getSameTypeCopyQuery,
  shouldClearSameTypeCopyFrom,
} from './document-model-same-type-copy.util';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

const source = fs.readFileSync(
  path.join(__dirname, '../components/DataContent/DataContent.tsx'),
  'utf8',
);

run('1. PGR without classification lists all PGR', () => {
  assert.deepStrictEqual(
    getSameTypeCopyQuery({ type: DocumentTypeEnum.PGR, classifications: [] }),
    { type: DocumentTypeEnum.PGR },
  );
});

run('2. PGR + Simplificado filters only Simplificado', () => {
  assert.deepStrictEqual(
    getSameTypeCopyQuery({
      type: DocumentTypeEnum.PGR,
      classifications: [DocumentModelClassificationEnum.SIMPLIFICADO],
    }),
    {
      type: DocumentTypeEnum.PGR,
      classifications: [DocumentModelClassificationEnum.SIMPLIFICADO],
    },
  );
});

run('3. PGR + Simplificado + Com Visita de Campo uses AND', () => {
  const query = getSameTypeCopyQuery({
    type: DocumentTypeEnum.PGR,
    classifications: [
      DocumentModelClassificationEnum.SIMPLIFICADO,
      DocumentModelClassificationEnum.COM_VISITA_DE_CAMPO,
    ],
  });
  assert.deepStrictEqual(query?.classifications, [
    DocumentModelClassificationEnum.SIMPLIFICADO,
    DocumentModelClassificationEnum.COM_VISITA_DE_CAMPO,
  ]);
});

run('4. removing Com Visita de Campo widens the list immediately', () => {
  const narrowed = getSameTypeCopyQuery({
    type: DocumentTypeEnum.PGR,
    classifications: [
      DocumentModelClassificationEnum.SIMPLIFICADO,
      DocumentModelClassificationEnum.COM_VISITA_DE_CAMPO,
    ],
  });
  const widened = getSameTypeCopyQuery({
    type: DocumentTypeEnum.PGR,
    classifications: [DocumentModelClassificationEnum.SIMPLIFICADO],
  });
  assert.equal(narrowed?.classifications?.length, 2);
  assert.deepStrictEqual(widened?.classifications, [
    DocumentModelClassificationEnum.SIMPLIFICADO,
  ]);
});

run('5. swapping Simplificado for Completo changes the filter', () => {
  const next = getSameTypeCopyQuery({
    type: DocumentTypeEnum.PGR,
    classifications: [DocumentModelClassificationEnum.COMPLETO],
  });
  assert.deepStrictEqual(next?.classifications, [
    DocumentModelClassificationEnum.COMPLETO,
  ]);
});

run('6. selected same-type source is cleared when it no longer matches', () => {
  const sourceModel = {
    type: DocumentTypeEnum.PGR,
    classifications: [
      DocumentModelClassificationEnum.SIMPLIFICADO,
      DocumentModelClassificationEnum.COM_VISITA_DE_CAMPO,
    ],
  };

  assert.equal(
    shouldClearSameTypeCopyFrom({
      copyFrom: sourceModel,
      documentType: DocumentTypeEnum.PGR,
      selectedClassifications: [
        DocumentModelClassificationEnum.SIMPLIFICADO,
        DocumentModelClassificationEnum.COM_VISITA_DE_CAMPO,
      ],
    }),
    false,
  );

  assert.equal(
    shouldClearSameTypeCopyFrom({
      copyFrom: sourceModel,
      documentType: DocumentTypeEnum.PGR,
      selectedClassifications: [],
    }),
    false,
  );

  assert.equal(
    shouldClearSameTypeCopyFrom({
      copyFrom: sourceModel,
      documentType: DocumentTypeEnum.PGR,
      selectedClassifications: [DocumentModelClassificationEnum.COMPLETO],
    }),
    true,
  );
});

run('7. NR18 combined with another classification uses AND', () => {
  const query = getSameTypeCopyQuery({
    type: DocumentTypeEnum.PGR,
    classifications: [
      DocumentModelClassificationEnum.SIMPLIFICADO,
      DocumentModelClassificationEnum.NR18,
    ],
  });
  assert.deepStrictEqual(query?.classifications, [
    DocumentModelClassificationEnum.SIMPLIFICADO,
    DocumentModelClassificationEnum.NR18,
  ]);
});

run('8. other-type copy is not cleared by same-type classification filters', () => {
  assert.equal(
    shouldClearSameTypeCopyFrom({
      copyFrom: {
        type: DocumentTypeEnum.PCSMO,
        classifications: [DocumentModelClassificationEnum.COMPLETO],
      },
      documentType: DocumentTypeEnum.PGR,
      selectedClassifications: [DocumentModelClassificationEnum.SIMPLIFICADO],
    }),
    false,
  );
  assert.equal(
    source.includes("query={{ type: data.type }}"),
    false,
  );
  assert.equal(source.includes('getSameTypeCopyQuery'), true);
  assert.equal(
    source.includes('query={\n                  data.copyFromOtherType\n                    ? { type: data.copyFromOtherType }'),
    true,
  );
});

run('9. exclusive pair swap is treated as a new AND filter', () => {
  const next = toggleDocumentModelClassification(
    [
      DocumentModelClassificationEnum.SIMPLIFICADO,
      DocumentModelClassificationEnum.COM_VISITA_DE_CAMPO,
    ],
    DocumentModelClassificationEnum.COMPLETO,
  );
  assert.deepStrictEqual(
    [...next].sort(),
    [
      DocumentModelClassificationEnum.COMPLETO,
      DocumentModelClassificationEnum.COM_VISITA_DE_CAMPO,
    ].sort(),
  );
  const afterExclusiveToggle = getSameTypeCopyQuery({
    type: DocumentTypeEnum.PGR,
    classifications: next,
  });
  assert.deepStrictEqual(
    [...(afterExclusiveToggle?.classifications || [])].sort(),
    [
      DocumentModelClassificationEnum.COMPLETO,
      DocumentModelClassificationEnum.COM_VISITA_DE_CAMPO,
    ].sort(),
  );
});

console.log('\nAll same-type copy filter tests passed.');
