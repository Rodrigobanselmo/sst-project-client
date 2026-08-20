/**
 * npx tsx src/components/organisms/tables/GhosTable/useGseImportFlow.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const flowSource = readFileSync(
  resolve('src/components/organisms/tables/GhosTable/useGseImportFlow.ts'),
  'utf8',
);

assert.equal(flowSource.includes('handleImportGse'), true);
assert.equal(flowSource.includes('COPY_RISK_IMPORT_ENTRY'), true);
assert.equal(flowSource.includes('HOMOGENEOUS_SELECT'), true);
assert.equal(flowSource.includes('IMPORT_GSE_CONFIRM'), true);
assert.equal(flowSource.includes('technicalGseOnly: true'), true);
assert.equal(flowSource.includes('classifyRiskGroupInventory'), true);
assert.equal(flowSource.includes('DOC_PGR_SELECT'), true);
assert.equal(flowSource.includes('SST_GSE_INVENTORY_SELECT_TITLE'), true);
assert.equal(flowSource.includes('emptySstInventoryMessage'), true);
assert.equal(flowSource.includes("emptySstInventoryMessage('origem')"), true);
assert.equal(flowSource.includes("emptySstInventoryMessage('destino')"), true);
assert.equal(flowSource.includes("choice.kind === 'unique'"), true);
assert.equal(flowSource.includes("choice.kind === 'none'"), true);
assert.equal(flowSource.includes("choice.kind !== 'multiple'"), true);
assert.equal(flowSource.includes('queryGroupRiskData'), true);
assert.equal(flowSource.includes('sourceRiskFactorGroupDataId'), true);
assert.equal(flowSource.includes('getCurrentRiskGroupId'), false);
assert.equal(flowSource.includes('groups[0]'), false);
assert.equal(flowSource.includes('groups.at(-1)'), false);
assert.equal(flowSource.includes('findFirst'), false);
assert.equal(flowSource.includes('ModalEnum.GHO_ADD'), false);
assert.equal(flowSource.includes('/effective'), false);
assert.equal(flowSource.includes('homogeneous-groups/copy'), false);

const confirmSource = readFileSync(
  resolve('src/components/organisms/modals/ModalImportGseConfirm/index.tsx'),
  'utf8',
);
assert.equal(confirmSource.includes('Nome do GSE no destino'), true);
assert.equal(confirmSource.includes('Riscos diretos que serão copiados'), true);
assert.equal(confirmSource.includes('directRiskCount'), true);
assert.equal(confirmSource.includes('nameConflict'), true);
assert.equal(confirmSource.includes('sourceRiskFactorGroupDataId'), true);
assert.equal(confirmSource.includes('targetRiskFactorGroupDataId'), true);
assert.equal(confirmSource.includes('classifyRiskGroupInventory'), true);
assert.equal(confirmSource.includes('DOC_PGR_SELECT'), true);
assert.equal(confirmSource.includes("emptySstInventoryMessage('destino')"), true);
assert.equal(confirmSource.includes("choice.kind === 'unique'"), true);
assert.equal(confirmSource.includes("choice.kind === 'none'"), true);
assert.equal(confirmSource.includes("choice.kind !== 'multiple'"), true);
assert.equal(confirmSource.includes('useMutImportGse'), true);
assert.equal(confirmSource.includes('getCurrentRiskGroupId'), false);
assert.equal(confirmSource.includes('GHO_ADD'), false);
assert.equal(confirmSource.includes('/effective'), false);

const mutSource = readFileSync(
  resolve(
    'src/core/services/hooks/mutations/checklist/gho/useMutImportGse/index.ts',
  ),
  'utf8',
);
assert.equal(mutSource.includes('/import/'), true);
assert.equal(mutSource.includes('/copy'), false);
assert.equal(mutSource.includes('QueryEnum.GHO'), true);
assert.equal(mutSource.includes('sourceRiskFactorGroupDataId'), true);
assert.equal(mutSource.includes('targetRiskFactorGroupDataId'), true);
assert.equal(mutSource.includes('if (!data.targetRiskFactorGroupDataId) return null'), true);
assert.equal(mutSource.includes('GSE importado com sucesso'), true);
assert.equal(mutSource.includes('getCurrentRiskGroupId'), false);

const pageSource = readFileSync(
  resolve(
    'src/pages/dashboard/empresas/[companyId]/grupos-homogenios/index.page.tsx',
  ),
  'utf8',
);
assert.equal(pageSource.includes('ModalSelectDocPgr'), true);

console.log('useGseImportFlow.spec.ts ok');
