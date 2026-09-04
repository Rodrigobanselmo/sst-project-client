/**
 * npx tsx src/@v2/pages/companies/action-plan/components/ActionPlanTable/action-plan-export-menu.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const table = readFileSync(
  resolve(
    'src/@v2/pages/companies/action-plan/components/ActionPlanTable/ActionPlanTable.tsx',
  ),
  'utf8',
);
const payload = readFileSync(
  resolve(
    'src/@v2/pages/companies/action-plan/components/ActionPlanTable/utils/build-action-plan-screen-export-filters.ts',
  ),
  'utf8',
);
const wordService = readFileSync(
  resolve(
    'src/@v2/services/export/action-plan/service/download-action-plan-document.service.ts',
  ),
  'utf8',
);
const wordTypes = readFileSync(
  resolve(
    'src/@v2/services/export/action-plan/service/download-action-plan-document.types.ts',
  ),
  'utf8',
);
const exportButton = readFileSync(
  resolve(
    'src/@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableExportButton/STableExportButton.tsx',
  ),
  'utf8',
);

assert.match(table, /label: 'Excel'/);
assert.match(table, /Word · Plano de Ação Detalhado/);
assert.match(table, /Word · Plano de Ação Agrupado/);
assert.match(table, /Word · Plano de Ação Gerencial/);
assert.match(table, /handleWordExport\('detailed'\)/);
assert.match(table, /handleWordExport\('grouped'\)/);
assert.match(table, /handleWordExport\('managerial'\)/);
assert.match(table, /exportMutation\.mutateAsync/);
assert.match(table, /buildActionPlanWordDownloadPayload/);
assert.match(table, /disabled=\{isExporting\}/);

assert.match(payload, /applyScreenFilters: true/);
assert.doesNotMatch(payload, /view:/);
assert.doesNotMatch(payload, /page:/);
assert.doesNotMatch(payload, /groups/);
assert.match(payload, /hierarchyIds/);
assert.match(payload, /status:/);
assert.match(payload, /responsibleIds/);
assert.match(payload, /generateSourceIds/);
assert.match(payload, /occupationalRisks/);
assert.match(payload, /isExpired/);

assert.match(wordTypes, /'detailed' \| 'grouped' \| 'managerial'/);
assert.match(wordService, /DOCUMENTS_PGR_PLAN/);
assert.match(wordService, /responseType: 'blob'/);
assert.match(wordService, /downloadFile\(response\)/);

assert.match(exportButton, /menuItems/);
assert.match(exportButton, /finally/);
assert.match(exportButton, /if \(isLoading\) return/);
assert.match(exportButton, /text=\{\s*text \?\? 'Exportar'\s*\}/);

console.log('action-plan-export-menu.spec.ts ok');
