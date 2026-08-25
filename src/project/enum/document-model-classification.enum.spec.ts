/**
 * Runnable with:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/project/enum/document-model-classification.enum.spec.ts
 */
import assert from 'assert';

import { DocumentTypeEnum } from 'project/enum/document.enums';

import {
  DOCUMENT_MODEL_CLASSIFICATION_DISPLAY_ORDER,
  DocumentModelClassificationEnum,
  documentModelClassificationMap,
  documentModelMatchesClassificationFilters,
  getDocumentModelClassificationConflict,
  getDocumentModelClassificationsForType,
  normalizeDocumentModelClassifications,
  sortClassificationsForDisplay,
  toggleDocumentModelClassification,
  toggleDocumentModelClassificationFilter,
} from './document-model-classification.enum';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

const EXCLUSIVE_PAIRS: [
  DocumentModelClassificationEnum,
  DocumentModelClassificationEnum,
][] = [
  [DocumentModelClassificationEnum.GRO_PGR, DocumentModelClassificationEnum.SOMENTE_PGR],
  [DocumentModelClassificationEnum.COM_FRPS, DocumentModelClassificationEnum.SEM_FRPS],
  [DocumentModelClassificationEnum.COPSOQ_III, DocumentModelClassificationEnum.NAO_COPSOQ_III],
  [DocumentModelClassificationEnum.ESTABELECIMENTO_PROPRIO, DocumentModelClassificationEnum.TERCEIROS],
  [DocumentModelClassificationEnum.SIMPLIFICADO, DocumentModelClassificationEnum.COMPLETO],
  [
    DocumentModelClassificationEnum.COM_VISITA_DE_CAMPO,
    DocumentModelClassificationEnum.DADOS_FORNECIDOS,
  ],
];

run('Com Visita de Campo is selectable and listed as a tag', () => {
  const options = getDocumentModelClassificationsForType(DocumentTypeEnum.PGR);
  const visita = options.find(
    (item) => item.value === DocumentModelClassificationEnum.COM_VISITA_DE_CAMPO,
  );

  assert.ok(visita);
  assert.strictEqual(visita?.label, 'Com Visita de Campo');
  assert.strictEqual(visita?.shortLabel, 'Com Visita de Campo');
  assert.strictEqual(
    documentModelClassificationMap[DocumentModelClassificationEnum.COM_VISITA_DE_CAMPO]
      .shortLabel,
    'Com Visita de Campo',
  );
});

run('Dados Fornecidos is selectable and listed as a tag', () => {
  const options = getDocumentModelClassificationsForType(DocumentTypeEnum.PGR);
  const dados = options.find(
    (item) => item.value === DocumentModelClassificationEnum.DADOS_FORNECIDOS,
  );

  assert.ok(dados);
  assert.strictEqual(dados?.label, 'Dados Fornecidos');
  assert.strictEqual(dados?.shortLabel, 'Dados Fornecidos');
});

run('GRO/PGR click Somente PGR desmarca GRO/PGR and marca Somente PGR', () => {
  const next = toggleDocumentModelClassification(
    [DocumentModelClassificationEnum.GRO_PGR],
    DocumentModelClassificationEnum.SOMENTE_PGR,
  );
  assert.deepStrictEqual(next, [DocumentModelClassificationEnum.SOMENTE_PGR]);
});

run('Com FRPS ↔ Sem FRPS exclusive toggle', () => {
  const toSem = toggleDocumentModelClassification(
    [DocumentModelClassificationEnum.COM_FRPS],
    DocumentModelClassificationEnum.SEM_FRPS,
  );
  assert.deepStrictEqual(toSem, [DocumentModelClassificationEnum.SEM_FRPS]);

  const toCom = toggleDocumentModelClassification(
    toSem,
    DocumentModelClassificationEnum.COM_FRPS,
  );
  assert.deepStrictEqual(toCom, [DocumentModelClassificationEnum.COM_FRPS]);
});

run('COPSOQ III ↔ Não COPSOQ exclusive toggle', () => {
  const next = toggleDocumentModelClassification(
    [DocumentModelClassificationEnum.COPSOQ_III],
    DocumentModelClassificationEnum.NAO_COPSOQ_III,
  );
  assert.deepStrictEqual(next, [DocumentModelClassificationEnum.NAO_COPSOQ_III]);
});

run('Estab. Próprio ↔ Terceiros exclusive toggle', () => {
  const next = toggleDocumentModelClassification(
    [DocumentModelClassificationEnum.ESTABELECIMENTO_PROPRIO],
    DocumentModelClassificationEnum.TERCEIROS,
  );
  assert.deepStrictEqual(next, [DocumentModelClassificationEnum.TERCEIROS]);
});

run('Simplificado ↔ Completo exclusive toggle', () => {
  const next = toggleDocumentModelClassification(
    [DocumentModelClassificationEnum.SIMPLIFICADO],
    DocumentModelClassificationEnum.COMPLETO,
  );
  assert.deepStrictEqual(next, [DocumentModelClassificationEnum.COMPLETO]);
});

run('Com Visita de Campo ↔ Dados Fornecidos exclusive toggle', () => {
  const next = toggleDocumentModelClassification(
    [DocumentModelClassificationEnum.COM_VISITA_DE_CAMPO],
    DocumentModelClassificationEnum.DADOS_FORNECIDOS,
  );
  assert.deepStrictEqual(next, [DocumentModelClassificationEnum.DADOS_FORNECIDOS]);
});

run('filters use the same exclusive toggle as the editor', () => {
  for (const [a, b] of EXCLUSIVE_PAIRS) {
    const next = toggleDocumentModelClassificationFilter([a], b);
    assert.deepStrictEqual(next, [b], `${a} → ${b}`);
    assert.strictEqual(next.includes(a), false);
    assert.strictEqual(
      documentModelMatchesClassificationFilters([b], next),
      true,
    );
    assert.strictEqual(
      documentModelMatchesClassificationFilters([a], next),
      false,
    );
  }
});

run('NR18 can coexist with any exclusive pair member', () => {
  const next = toggleDocumentModelClassification(
    [DocumentModelClassificationEnum.GRO_PGR, DocumentModelClassificationEnum.COM_FRPS],
    DocumentModelClassificationEnum.NR18,
  );
  assert.ok(next.includes(DocumentModelClassificationEnum.GRO_PGR));
  assert.ok(next.includes(DocumentModelClassificationEnum.COM_FRPS));
  assert.ok(next.includes(DocumentModelClassificationEnum.NR18));
  assert.strictEqual(getDocumentModelClassificationConflict(next, DocumentTypeEnum.PGR), null);
});

run('Backup can coexist with any exclusive pair member', () => {
  const next = toggleDocumentModelClassification(
    [
      DocumentModelClassificationEnum.COPSOQ_III,
      DocumentModelClassificationEnum.COMPLETO,
    ],
    DocumentModelClassificationEnum.BACKUP,
  );
  assert.ok(next.includes(DocumentModelClassificationEnum.COPSOQ_III));
  assert.ok(next.includes(DocumentModelClassificationEnum.COMPLETO));
  assert.ok(next.includes(DocumentModelClassificationEnum.BACKUP));
  assert.strictEqual(getDocumentModelClassificationConflict(next, DocumentTypeEnum.PGR), null);
});

run('exclusive pairs appear side by side in the PGR chip order', () => {
  const options = getDocumentModelClassificationsForType(DocumentTypeEnum.PGR).map(
    (item) => item.value,
  );

  assert.deepStrictEqual(options, DOCUMENT_MODEL_CLASSIFICATION_DISPLAY_ORDER);

  for (const [a, b] of EXCLUSIVE_PAIRS) {
    assert.strictEqual(options.indexOf(b), options.indexOf(a) + 1, `${a} beside ${b}`);
  }

  assert.strictEqual(
    options.indexOf(DocumentModelClassificationEnum.NR18),
    options.indexOf(DocumentModelClassificationEnum.DADOS_FORNECIDOS) + 1,
  );
  assert.strictEqual(
    options.indexOf(DocumentModelClassificationEnum.BACKUP),
    options.indexOf(DocumentModelClassificationEnum.NR18) + 1,
  );
});

run('non-PGR types keep remaining exclusive pairs side by side', () => {
  const options = getDocumentModelClassificationsForType(DocumentTypeEnum.PCSMO).map(
    (item) => item.value,
  );

  const remaining = EXCLUSIVE_PAIRS.filter(([a]) => options.includes(a));
  assert.ok(remaining.length >= 3);
  for (const [a, b] of remaining) {
    assert.strictEqual(options.indexOf(b), options.indexOf(a) + 1, `${a} beside ${b}`);
  }
  assert.ok(!options.includes(DocumentModelClassificationEnum.NR18));
  assert.ok(options.includes(DocumentModelClassificationEnum.BACKUP));
});

run('existing classifications still work', () => {
  const options = getDocumentModelClassificationsForType(DocumentTypeEnum.PGR).map(
    (item) => item.value,
  );

  assert.ok(options.includes(DocumentModelClassificationEnum.GRO_PGR));
  assert.ok(options.includes(DocumentModelClassificationEnum.SOMENTE_PGR));
  assert.ok(options.includes(DocumentModelClassificationEnum.COM_FRPS));
  assert.ok(options.includes(DocumentModelClassificationEnum.SEM_FRPS));
  assert.ok(options.includes(DocumentModelClassificationEnum.COPSOQ_III));
  assert.ok(options.includes(DocumentModelClassificationEnum.NR18));
  assert.ok(options.includes(DocumentModelClassificationEnum.TERCEIROS));
  assert.ok(options.includes(DocumentModelClassificationEnum.SIMPLIFICADO));
  assert.ok(options.includes(DocumentModelClassificationEnum.COMPLETO));
  assert.ok(options.includes(DocumentModelClassificationEnum.ESTABELECIMENTO_PROPRIO));

  const gro = toggleDocumentModelClassification(
    [DocumentModelClassificationEnum.SOMENTE_PGR],
    DocumentModelClassificationEnum.GRO_PGR,
  );
  assert.deepStrictEqual(gro, [DocumentModelClassificationEnum.GRO_PGR]);
  assert.strictEqual(
    getDocumentModelClassificationConflict(
      [DocumentModelClassificationEnum.GRO_PGR, DocumentModelClassificationEnum.COM_FRPS],
      DocumentTypeEnum.PGR,
    ),
    null,
  );
});

run('listing tags keep the same pair order', () => {
  const ordered = sortClassificationsForDisplay([
    DocumentModelClassificationEnum.BACKUP,
    DocumentModelClassificationEnum.TERCEIROS,
    DocumentModelClassificationEnum.GRO_PGR,
    DocumentModelClassificationEnum.NR18,
  ]);

  assert.deepStrictEqual(ordered, [
    DocumentModelClassificationEnum.GRO_PGR,
    DocumentModelClassificationEnum.TERCEIROS,
    DocumentModelClassificationEnum.NR18,
    DocumentModelClassificationEnum.BACKUP,
  ]);
});

run('neither exclusive classification is required', () => {
  assert.deepStrictEqual(normalizeDocumentModelClassifications(undefined), []);
  assert.deepStrictEqual(normalizeDocumentModelClassifications([]), []);
  assert.strictEqual(
    getDocumentModelClassificationConflict(
      [DocumentModelClassificationEnum.GRO_PGR],
      DocumentTypeEnum.PGR,
    ),
    null,
  );
});

run('display order covers every classification exactly once', () => {
  const fromEnum = Object.values(DocumentModelClassificationEnum);
  assert.deepStrictEqual(
    [...DOCUMENT_MODEL_CLASSIFICATION_DISPLAY_ORDER].sort(),
    [...fromEnum].sort(),
  );
});

console.log('\nAll document-model classification tests passed.');
