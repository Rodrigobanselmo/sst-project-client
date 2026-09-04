/**
 * npx tsx src/components/organisms/modals/ModalViewDocDownloads/helpers/pgr-download-annex-categories.util.spec.ts
 */
import assert from 'node:assert/strict';

import {
  classifyPgrDownloadAnnex,
  getPgrDownloadAnnexCategoryId,
  getPgrDownloadAnnexCategoryTitle,
  getPgrDownloadAnnexLabel,
  PGR_ACTION_PLAN_FUTURE_VARIANT,
  PGR_ACTION_PLAN_ANNEX_VARIANTS,
  PGR_DOWNLOAD_ANNEX_CATEGORY_ACTION_PLAN,
  PGR_DOWNLOAD_ANNEX_CATEGORY_INVENTORY,
} from './pgr-download-annex-categories.util';

assert.equal(
  classifyPgrDownloadAnnex('Inventário por Função (APR)'),
  'inventory_function',
);
assert.equal(
  classifyPgrDownloadAnnex('Inventário de Risco por Função'),
  'inventory_function',
);
assert.equal(classifyPgrDownloadAnnex('Inventário por GSE (APR)'), 'inventory_gse');
assert.equal(classifyPgrDownloadAnnex('Inventário de Risco por GSE'), 'inventory_gse');
assert.equal(classifyPgrDownloadAnnex('Plano de Ação'), 'action_plan_detailed');
assert.equal(classifyPgrDownloadAnnex('Plano de Ação Detalhado'), 'action_plan_detailed');
assert.equal(classifyPgrDownloadAnnex('Plano de Ação Agrupado'), null);
assert.equal(classifyPgrDownloadAnnex('Outro anexo'), null);

assert.equal(getPgrDownloadAnnexCategoryId('inventory_function'), 'inventory');
assert.equal(getPgrDownloadAnnexCategoryId('inventory_gse'), 'inventory');
assert.equal(getPgrDownloadAnnexCategoryId('action_plan_detailed'), 'action_plan');
assert.equal(getPgrDownloadAnnexCategoryId('action_plan_grouped'), 'action_plan');

assert.equal(
  getPgrDownloadAnnexCategoryTitle('inventory'),
  PGR_DOWNLOAD_ANNEX_CATEGORY_INVENTORY,
);
assert.equal(
  getPgrDownloadAnnexCategoryTitle('action_plan'),
  PGR_DOWNLOAD_ANNEX_CATEGORY_ACTION_PLAN,
);

assert.equal(
  getPgrDownloadAnnexLabel('inventory_function'),
  'Baixar Inventário de Risco por Função',
);
assert.equal(
  getPgrDownloadAnnexLabel('inventory_gse'),
  'Baixar Inventário de Risco por GSE',
);
assert.equal(
  getPgrDownloadAnnexLabel('action_plan_detailed'),
  'Baixar Plano de Ação Detalhado',
);
assert.equal(
  getPgrDownloadAnnexLabel('action_plan_grouped'),
  'Baixar Plano de Ação Agrupado',
);

assert.deepEqual(PGR_ACTION_PLAN_ANNEX_VARIANTS, ['detailed', 'grouped']);
assert.equal(PGR_ACTION_PLAN_FUTURE_VARIANT, 'gerencial');

console.log('pgr-download-annex-categories.util.spec.ts ok');
