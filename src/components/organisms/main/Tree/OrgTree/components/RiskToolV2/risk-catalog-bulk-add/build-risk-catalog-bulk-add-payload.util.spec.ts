/**
 * Executar: npx tsx src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-catalog-bulk-add/build-risk-catalog-bulk-add-payload.util.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { MedTypeEnum } from 'project/enum/medType.enum';
import { RecTypeEnum } from 'project/enum/recType.enum';

import {
  buildRiskCatalogBulkAddPayload,
  classifyBulkNamesAgainstCatalog,
} from './build-risk-catalog-bulk-add-payload.util';

const classified = classifyBulkNamesAgainstCatalog(
  ['Fonte A', 'Fonte B', 'Fonte nova'],
  [
    { id: 'gs-1', name: 'Fonte A' },
    { id: 'gs-2', name: 'fonte b' },
  ],
  (item) => item.name,
);
assert.deepEqual(classified.existingIds, ['gs-1', 'gs-2']);
assert.equal(classified.existingItems.length, 2);
assert.deepEqual(classified.namesToCreate, ['Fonte nova']);

const gsPayload = buildRiskCatalogBulkAddPayload({
  kind: 'generateSource',
  existingIds: ['gs-1'],
  namesToCreate: ['Fonte nova'],
  companyId: 'company-1',
});
assert.deepEqual(gsPayload?.generateSources, ['gs-1']);
assert.equal(gsPayload?.generateSourcesAddOnly?.[0]?.name, 'Fonte nova');
assert.equal(gsPayload?.adms, undefined);

const admPayload = buildRiskCatalogBulkAddPayload({
  kind: 'adm',
  existingIds: ['adm-1', 'adm-2'],
  namesToCreate: ['Nova medida'],
  companyId: 'company-1',
});
assert.deepEqual(admPayload?.adms, ['adm-1', 'adm-2']);
assert.equal(admPayload?.admsAddOnly?.[0]?.medType, MedTypeEnum.ADM);
assert.equal(admPayload?.admsAddOnly?.[0]?.medName, 'Nova medida');

const engPayload = buildRiskCatalogBulkAddPayload({
  kind: 'eng',
  existingIds: ['eng-1'],
  namesToCreate: ['Novo EPC'],
  companyId: 'company-1',
});
assert.deepEqual(engPayload?.engs, [{ recMedId: 'eng-1' }]);
assert.equal(engPayload?.engsAddOnly?.[0]?.medType, MedTypeEnum.ENG);

const recPayload = buildRiskCatalogBulkAddPayload({
  kind: 'rec',
  existingIds: ['rec-1'],
  namesToCreate: ['Nova rec'],
  companyId: 'company-1',
  recType: RecTypeEnum.ENG,
});
assert.deepEqual(recPayload?.recs, ['rec-1']);
assert.equal(recPayload?.recAddOnly?.[0]?.recType, RecTypeEnum.ENG);
assert.equal(recPayload?.probabilityAfter, undefined);

assert.equal(
  buildRiskCatalogBulkAddPayload({
    kind: 'adm',
    existingIds: [],
    namesToCreate: [],
    companyId: 'company-1',
  }),
  null,
);

const saveHelper = readFileSync(
  resolve(
    'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/hooks/useColumnAction.ts',
  ),
  'utf8',
);
assert.equal(saveHelper.includes('Object.entries({ recs, adms, generateSources })'), true);
assert.equal(saveHelper.includes("removeById: 'recMedId'"), true);
assert.equal(saveHelper.includes("removeById: 'epiId'"), true);

const columns = [
  'SourceColumn',
  'AdmColumn',
  'EngColumn',
  'RecColumn',
] as const;

for (const column of columns) {
  const source = readFileSync(
    resolve(
      `src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/components/SideRowTable/components/columns/${column}/index.tsx`,
    ),
    'utf8',
  );
  assert.equal(source.includes('multiple={false}'), false, column);
  assert.equal(source.includes('confirmSelectionOnClose={false}'), true, column);
  assert.equal(source.includes('RiskCatalogBulkAddButton'), true, column);
  assert.equal(source.includes('onCreate='), true, column);
  if (column !== 'RecColumn') {
    assert.equal(source.includes('resolveNewCatalogIds'), true, column);
  }
}

const engColumn = readFileSync(
  resolve(
    'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/components/SideRowTable/components/columns/EngColumn/index.tsx',
  ),
  'utf8',
);
assert.equal(engColumn.includes('engs: ids.map((recMedId) => ({ recMedId }))'), true);
assert.equal(engColumn.includes('handleEdit'), true);

const recColumn = readFileSync(
  resolve(
    'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/components/SideRowTable/components/columns/RecColumn/index.tsx',
  ),
  'utf8',
);
assert.equal(recColumn.includes('buildAddPayload'), true);
assert.equal(recColumn.includes('buildRecsAttachPayload'), true);
assert.equal(recColumn.includes('resolveMultipleAsItems'), true);

const menuSearch = readFileSync(
  resolve('src/components/molecules/SMenuSearch/index.tsx'),
  'utf8',
);
assert.equal(menuSearch.includes('confirmSelectionOnClose = true'), true);
assert.equal(menuSearch.includes('commitSelection'), true);

console.log('build-risk-catalog-bulk-add-payload.util.spec.ts ok');
