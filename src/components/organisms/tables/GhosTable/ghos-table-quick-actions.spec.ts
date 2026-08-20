/**
 * Contrato da listagem GSE: counts reais + atalhos de aba.
 * Executar:
 * npx tsx src/components/organisms/tables/GhosTable/ghos-table-quick-actions.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  GSE_WIZARD_STEP,
  resolveGseTableOpenStep,
} from '../../modals/ModalAddGHO/gse-wizard-steps';

assert.equal(resolveGseTableOpenStep('row'), 0);
assert.equal(resolveGseTableOpenStep('edit'), 0);
assert.equal(resolveGseTableOpenStep('cargos'), 1);
assert.equal(resolveGseTableOpenStep('risks'), 2);
assert.equal(resolveGseTableOpenStep('ai'), 3);
assert.notEqual(GSE_WIZARD_STEP.RISKS, 4);
assert.notEqual(GSE_WIZARD_STEP.AI_ANALYSIS, 5);

const tableSource = readFileSync(
  resolve('src/components/organisms/tables/GhosTable/GhosTable.tsx'),
  'utf8',
);
assert.equal(tableSource.includes('pageGhoLayout'), true);
assert.equal(tableSource.includes('CharacterizationQuickCountCell'), true);
assert.equal(tableSource.includes('CharacterizationRisksQuickCell'), true);
assert.equal(tableSource.includes('showZeroCount'), true);
assert.equal(tableSource.includes('hierarchyCount ?? 0'), true);
assert.equal(tableSource.includes('riskCount ?? 0'), true);
assert.equal(tableSource.includes("onEditGHO(row, 'cargos')"), true);
assert.equal(tableSource.includes("onEditGHO(row, 'risks')"), true);
assert.equal(tableSource.includes("onEditGHO(row, 'ai')"), true);
assert.equal(tableSource.includes("onEditGHO(row, 'edit')"), true);
assert.equal(tableSource.includes("onEditGHO(risk, 'row')"), true);
assert.equal(tableSource.includes('onAddGHO'), true);
assert.equal(tableSource.includes('STableAddButton'), true);
assert.equal(tableSource.includes('Importar GSE'), true);
assert.equal(tableSource.includes('handleImportGse'), true);
assert.equal(tableSource.includes('useGseImportFlow'), true);
assert.equal(tableSource.includes('onAddClick={onAddGHO}'), false);
assert.equal(tableSource.includes('useQueryRiskDataByGho'), false);
assert.equal(tableSource.includes('useQueryGho('), false);
assert.equal(tableSource.includes('Fotos'), false);
assert.equal(tableSource.includes('Posição'), false);

const formSource = readFileSync(
  resolve(
    'src/components/organisms/modals/ModalAddGHO/components/GhoFormContent.tsx',
  ),
  'utf8',
);
assert.equal(formSource.includes('ApplyGseWizardStep'), true);
assert.equal(formSource.includes('startIndex='), true);
assert.equal(formSource.includes('ghoData.initialWizardStep'), true);
assert.equal(formSource.includes('resolveGseWizardStepFromQuery'), true);
assert.equal(formSource.includes('CHARACTERIZATION_WIZARD_STEP'), false);

const hookSource = readFileSync(
  resolve('src/components/organisms/modals/ModalAddGHO/hooks/useAddGho.ts'),
  'utf8',
);
assert.equal(hookSource.includes('initialWizardStep'), true);

const countCell = readFileSync(
  resolve(
    'src/@v2/pages/companies/characterizations/components/CharacterizationTable/quick-actions/CharacterizationQuickCountCell.tsx',
  ),
  'utf8',
);
assert.equal(countCell.includes('showZeroCount'), true);
assert.equal(countCell.includes('count <= 0 && !showZeroCount'), true);

console.log('ghos-table-quick-actions.spec.ts ok');
