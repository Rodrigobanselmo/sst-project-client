/**
 * Executar: npx tsx src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-catalog-dnd/find-risk-catalog-item-match.util.spec.ts
 */
import assert from 'node:assert/strict';

import {
  buildRiskCatalogBatchConfirmMessage,
  buildRiskCatalogBatchSummaryMessage,
  buildRiskCatalogMissingConfirmMessage,
  dedupeRiskCatalogDragItems,
  findCatalogItemByNormalizedName,
  isSameRiskCatalogDropForbidden,
  normalizeInventoryItemName,
} from './find-risk-catalog-item-match.util';

assert.equal(
  normalizeInventoryItemName('  Resíduos  Mistos  '),
  normalizeInventoryItemName('residuos mistos'),
);

assert.equal(
  findCatalogItemByNormalizedName(
    [
      { id: '1', name: 'Outro' },
      { id: '2', name: 'Resíduos mistos (lixo urbano)' },
    ],
    'residuos mistos (lixo urbano)',
    (i) => i.name,
  )?.id,
  '2',
);

assert.equal(
  findCatalogItemByNormalizedName(
    [{ id: '1', name: 'A' }],
    'B',
    (i) => i.name,
  ),
  undefined,
);

assert.equal(
  isSameRiskCatalogDropForbidden(
    {
      kind: 'generateSource',
      sourceRiskId: 'risk-a',
      name: 'X',
    },
    'risk-a',
  ),
  true,
);

assert.equal(
  isSameRiskCatalogDropForbidden(
    {
      kind: 'generateSource',
      sourceRiskId: 'risk-a',
      name: 'X',
    },
    'risk-b',
  ),
  false,
);

const msg = buildRiskCatalogMissingConfirmMessage({
  kind: 'generateSource',
  itemName: 'Resíduos',
  destinationRiskName: 'Lixo (Resíduos)',
});
assert.match(msg, /ainda não existe/);
assert.match(msg, /Lixo \(Resíduos\)/);
assert.match(msg, /Resíduos/);
assert.match(msg, /cadastrá-la/);

const batchConfirm = buildRiskCatalogBatchConfirmMessage({
  kind: 'rec',
  count: 7,
  destinationRiskName: 'Lixo (Resíduos em atividades)',
});
assert.match(batchConfirm, /Copiar 7 recomendações/);
assert.match(batchConfirm, /Lixo \(Resíduos em atividades\)/);
assert.match(batchConfirm, /Continuar/);

const summaryAllExisting = buildRiskCatalogBatchSummaryMessage({
  kind: 'generateSource',
  totalItems: 4,
  added: 4,
  existedInCatalog: 4,
  created: 0,
  alreadyAttached: 0,
  epiMissing: 0,
  failed: 0,
});
assert.match(summaryAllExisting, /4 fontes geradoras adicionadas/);
assert.match(summaryAllExisting, /Todas já existiam no catálogo/);

const summaryMixed = buildRiskCatalogBatchSummaryMessage(
  {
    kind: 'rec',
    totalItems: 7,
    added: 7,
    existedInCatalog: 5,
    created: 2,
    alreadyAttached: 0,
    epiMissing: 0,
    failed: 0,
  },
  'Lixo (Resíduos em atividades)',
);
assert.match(summaryMixed, /Destino:/);
assert.match(summaryMixed, /Lixo \(Resíduos em atividades\)/);
assert.match(summaryMixed, /7 recomendações adicionadas/);
assert.match(summaryMixed, /5 já existiam/);
assert.match(summaryMixed, /2 foram cadastradas/);

const summaryEpiMissing = buildRiskCatalogBatchSummaryMessage({
  kind: 'epi',
  totalItems: 3,
  added: 2,
  existedInCatalog: 2,
  created: 0,
  alreadyAttached: 0,
  epiMissing: 1,
  failed: 0,
});
assert.match(summaryEpiMissing, /não pôde ser incluído/);
assert.match(summaryEpiMissing, /cadastro global/);

const deduped = dedupeRiskCatalogDragItems([
  {
    kind: 'rec',
    sourceRiskId: 'a',
    name: 'Treinamento',
    catalogId: '1',
  },
  {
    kind: 'rec',
    sourceRiskId: 'a',
    name: ' treinamento ',
    catalogId: '2',
  },
  {
    kind: 'rec',
    sourceRiskId: 'a',
    name: 'Outro',
    catalogId: '3',
  },
]);
assert.equal(deduped.length, 2);

console.log('find-risk-catalog-item-match.util.spec.ts: OK');
