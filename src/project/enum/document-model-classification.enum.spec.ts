/**
 * Runnable with:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/project/enum/document-model-classification.enum.spec.ts
 */
import assert from 'assert';

import { DocumentTypeEnum } from 'project/enum/document.enums';

import {
  DocumentModelClassificationEnum,
  documentModelClassificationMap,
  documentModelMatchesClassificationFilters,
  getDocumentModelClassificationConflict,
  getDocumentModelClassificationsForType,
  normalizeDocumentModelClassifications,
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

run('Com Visita de Campo can be selected and saved without the other new tag', () => {
  const next = toggleDocumentModelClassification(
    [DocumentModelClassificationEnum.GRO_PGR],
    DocumentModelClassificationEnum.COM_VISITA_DE_CAMPO,
  );

  assert.deepStrictEqual(
    normalizeDocumentModelClassifications(next).sort(),
    [
      DocumentModelClassificationEnum.COM_VISITA_DE_CAMPO,
      DocumentModelClassificationEnum.GRO_PGR,
    ].sort(),
  );
  assert.strictEqual(getDocumentModelClassificationConflict(next, DocumentTypeEnum.PGR), null);
});

run('Dados Fornecidos can be selected and saved without the other new tag', () => {
  const next = toggleDocumentModelClassification(
    [DocumentModelClassificationEnum.COMPLETO],
    DocumentModelClassificationEnum.DADOS_FORNECIDOS,
  );

  assert.deepStrictEqual(
    normalizeDocumentModelClassifications(next).sort(),
    [
      DocumentModelClassificationEnum.COMPLETO,
      DocumentModelClassificationEnum.DADOS_FORNECIDOS,
    ].sort(),
  );
  assert.strictEqual(getDocumentModelClassificationConflict(next, DocumentTypeEnum.PGR), null);
});

run('new classifications are mutually exclusive', () => {
  const next = toggleDocumentModelClassification(
    [DocumentModelClassificationEnum.COM_VISITA_DE_CAMPO],
    DocumentModelClassificationEnum.DADOS_FORNECIDOS,
  );

  assert.deepStrictEqual(next, [DocumentModelClassificationEnum.DADOS_FORNECIDOS]);
  assert.ok(
    getDocumentModelClassificationConflict(
      [
        DocumentModelClassificationEnum.COM_VISITA_DE_CAMPO,
        DocumentModelClassificationEnum.DADOS_FORNECIDOS,
      ],
      DocumentTypeEnum.PGR,
    ),
  );
});

run('neither new classification is required', () => {
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

run('listing filters work for both new classifications', () => {
  const visitaOnly = [DocumentModelClassificationEnum.COM_VISITA_DE_CAMPO];
  const dadosOnly = [DocumentModelClassificationEnum.DADOS_FORNECIDOS];
  const mixed = [
    DocumentModelClassificationEnum.GRO_PGR,
    DocumentModelClassificationEnum.COM_VISITA_DE_CAMPO,
  ];

  assert.strictEqual(
    documentModelMatchesClassificationFilters(visitaOnly, visitaOnly),
    true,
  );
  assert.strictEqual(
    documentModelMatchesClassificationFilters(dadosOnly, dadosOnly),
    true,
  );
  assert.strictEqual(
    documentModelMatchesClassificationFilters(visitaOnly, dadosOnly),
    false,
  );
  assert.strictEqual(
    documentModelMatchesClassificationFilters(mixed, visitaOnly),
    true,
  );

  const toggled = toggleDocumentModelClassificationFilter([], DocumentModelClassificationEnum.DADOS_FORNECIDOS);
  assert.deepStrictEqual(toggled, [DocumentModelClassificationEnum.DADOS_FORNECIDOS]);
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

console.log('\nAll document-model classification tests passed.');
