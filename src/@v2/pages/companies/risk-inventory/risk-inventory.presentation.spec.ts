/**
 * Executar:
 * npx tsx src/@v2/pages/companies/risk-inventory/risk-inventory.presentation.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  formatInventoryEpis,
  formatInventoryLines,
  inventoryExposedEmployeeText,
  inventoryColumnDraftHeaderChoice,
  inventoryColumnDraftHeaderLabel,
  inventoryColumnDraftOrientation,
  inventoryColumnHeaderOrientation,
  inventoryColumnOrientation,
  inventoryScreenColumnHeaderLabel,
  inventoryScreenColumnHeaderOrientation,
  inventoryScreenColumnOrientation,
  inventoryPresentationText,
  inventoryProbabilityHint,
  inventoryProbabilityText,
  inventoryResidualProbabilityText,
  inventoryUnitScopeText,
  inventoryVerticalRiskText,
  INVENTORY_CONFIGURABLE_COLUMNS,
  INVENTORY_EXPOSED_LABEL,
  INVENTORY_SCOPE_LABEL,
  INVENTORY_VERTICAL_HEADER_LINE_PX,
  INVENTORY_VERTICAL_LINE_PX,
  INVENTORY_VERTICAL_READING,
  INVENTORY_VERTICAL_ROTATION,
  INVENTORY_VERTICAL_STACK_PX,
} from './risk-inventory.presentation';

assert.equal(formatInventoryLines([]), '—');
assert.equal(formatInventoryLines(['Bomba', ' ']), 'Bomba');
assert.equal(
  formatInventoryEpis([{ ca: '111', equipment: 'Protetor' }]),
  'Protetor (CA 111)',
);

assert.equal(
  inventoryProbabilityText({
    isQuantity: false,
    qualitativeProbability: 4,
    persistedProbability: 4,
  }),
  '4',
);

assert.equal(
  inventoryProbabilityText({
    isQuantity: true,
    qualitativeProbability: null,
    persistedProbability: 2,
  }),
  '—',
);
assert.equal(
  inventoryProbabilityHint({ isQuantity: true }),
  'Avaliação quantitativa. A probabilidade da matriz não se aplica; o nível da medição está no Risco Real.',
);
assert.equal(inventoryProbabilityHint({ isQuantity: false }), null);

assert.equal(
  inventoryResidualProbabilityText({
    residual: { source: null, probability: null, presentation: null },
  }),
  '—',
);
assert.equal(
  inventoryResidualProbabilityText({
    residual: { source: 'SNAPSHOT', probability: 2, presentation: null },
  }),
  '2',
);

assert.equal(INVENTORY_SCOPE_LABEL, 'Abrangência:');
assert.equal(INVENTORY_EXPOSED_LABEL, 'Quantidade de funcionários expostos:');
assert.equal(
  inventoryUnitScopeText(['MECANICO INDUSTRIAL IV (Cargo)', 'ENCARREGADO DE MECANICA (Cargo)']),
  'MECANICO INDUSTRIAL IV (Cargo), ENCARREGADO DE MECANICA (Cargo)',
);
assert.equal(inventoryUnitScopeText([]), null);
assert.equal(inventoryExposedEmployeeText(6), '6');
assert.equal(inventoryExposedEmployeeText(0), '0');

const tableSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'RiskInventoryTable.tsx'),
  'utf8',
);
assert.equal(tableSource.includes('EPIs do grupo'), false);
assert.equal(tableSource.includes('expostos`'), false);
assert.equal(tableSource.includes("label: 'EPI'"), true);
assert.equal(tableSource.includes('formatInventoryEpis(row.epis)'), true);
assert.equal(tableSource.includes('row.realRisk'), true);
assert.equal(tableSource.includes('row.residual.presentation'), true);
assert.equal(tableSource.includes('inventoryPresentationText(presentation)'), true);
assert.equal(tableSource.includes('inventoryPresentationColor(presentation)'), true);
assert.equal(tableSource.includes('compact ? inventoryVerticalRiskText(presentation)'), true);
assert.equal(INVENTORY_VERTICAL_READING, 'bottom-to-top');
assert.equal(INVENTORY_VERTICAL_ROTATION, 'rotate(-90deg)');
assert.equal(tableSource.includes('INVENTORY_VERTICAL_ROTATION'), true);
assert.equal(tableSource.includes("whiteSpace: 'normal'"), true);
assert.equal(tableSource.includes("whiteSpace: 'nowrap'"), true);
assert.equal(tableSource.includes('linePx = INVENTORY_VERTICAL_LINE_PX'), true);
assert.equal(tableSource.includes('height: linePx'), true);
assert.equal(tableSource.includes('maxHeight: linePx'), true);
assert.equal(tableSource.includes('width: linePx'), true);
assert.equal(tableSource.includes('linePx={INVENTORY_VERTICAL_HEADER_LINE_PX}'), true);
assert.equal(INVENTORY_VERTICAL_LINE_PX, 140);
assert.equal(INVENTORY_VERTICAL_HEADER_LINE_PX, 104);
assert.equal(INVENTORY_VERTICAL_HEADER_LINE_PX < INVENTORY_VERTICAL_LINE_PX, true);
assert.equal(tableSource.includes('maxWidth: INVENTORY_VERTICAL_STACK_PX'), true);
assert.equal(tableSource.includes("overflow: 'hidden'"), true);
assert.equal(INVENTORY_VERTICAL_LINE_PX > 0 && INVENTORY_VERTICAL_LINE_PX < 200, true);
assert.equal(INVENTORY_VERTICAL_STACK_PX > 0 && INVENTORY_VERTICAL_STACK_PX < INVENTORY_VERTICAL_LINE_PX, true);
assert.equal(tableSource.includes('minWidth: column.minWidth'), true);

assert.equal(INVENTORY_CONFIGURABLE_COLUMNS.length, 13);
assert.equal(INVENTORY_CONFIGURABLE_COLUMNS.some((column) => column.key === 'ORIGIN'), false);
assert.equal(INVENTORY_CONFIGURABLE_COLUMNS.some((column) => column.key === 'SEVERITY_RESIDUAL'), false);
assert.equal(inventoryColumnOrientation(null, 'TYPE'), 'HORIZONTAL');
assert.equal(inventoryColumnOrientation(null, 'REAL_RISK'), 'HORIZONTAL');
assert.equal(
  inventoryColumnOrientation(
    { version: 1, columns: [{ key: 'EPI', orientation: 'VERTICAL' }] },
    'TYPE',
  ),
  'HORIZONTAL',
);
assert.equal(
  inventoryColumnOrientation(
    { version: 1, columns: [{ key: 'TYPE', orientation: 'VERTICAL' }] },
    'TYPE',
  ),
  'VERTICAL',
);
assert.equal(inventoryColumnDraftOrientation(null, 'TYPE'), 'VERTICAL');
assert.equal(inventoryColumnDraftOrientation(null, 'EPI'), 'HORIZONTAL');
assert.equal(inventoryColumnDraftHeaderChoice(null, 'HAZARD'), 'SAME');
assert.equal(
  inventoryColumnDraftHeaderChoice(
    { version: 1, columns: [{ key: 'HAZARD', orientation: 'VERTICAL' }] },
    'HAZARD',
  ),
  'SAME',
);
assert.equal(
  inventoryColumnHeaderOrientation(
    { version: 1, columns: [{ key: 'HAZARD', orientation: 'VERTICAL' }] },
    'HAZARD',
  ),
  'VERTICAL',
);
assert.equal(
  inventoryColumnOrientation(
    { version: 1, columns: [{ key: 'HAZARD', orientation: 'VERTICAL', headerOrientation: 'HORIZONTAL' }] },
    'HAZARD',
  ),
  'VERTICAL',
);
assert.equal(
  inventoryScreenColumnOrientation(
    { version: 1, columns: [{ key: 'HAZARD', orientation: 'VERTICAL', headerOrientation: 'HORIZONTAL' }] },
    'hazard',
  ),
  'VERTICAL',
);
assert.equal(
  inventoryColumnHeaderOrientation(
    { version: 1, columns: [{ key: 'HAZARD', orientation: 'VERTICAL', headerOrientation: 'HORIZONTAL' }] },
    'HAZARD',
  ),
  'HORIZONTAL',
);
assert.equal(
  inventoryScreenColumnHeaderOrientation(
    { version: 1, columns: [{ key: 'HAZARD', orientation: 'VERTICAL', headerOrientation: 'HORIZONTAL' }] },
    'hazard',
  ),
  'HORIZONTAL',
);
assert.equal(
  inventoryColumnOrientation(
    { version: 1, columns: [{ key: 'TYPE', orientation: 'HORIZONTAL', headerOrientation: 'VERTICAL' }] },
    'TYPE',
  ),
  'HORIZONTAL',
);
assert.equal(
  inventoryColumnHeaderOrientation(
    { version: 1, columns: [{ key: 'TYPE', orientation: 'HORIZONTAL', headerOrientation: 'VERTICAL' }] },
    'TYPE',
  ),
  'VERTICAL',
);
assert.equal(inventoryColumnHeaderOrientation(null, 'TYPE'), 'HORIZONTAL');
assert.equal(tableSource.includes('inventoryScreenColumnHeaderOrientation'), true);
assert.equal(tableSource.includes('inventoryScreenColumnOrientation'), true);
assert.equal(tableSource.includes('inventoryScreenColumnHeaderLabel'), true);
assert.equal(
  inventoryScreenColumnHeaderLabel(null, 'hazard', 'Fator de risco'),
  'Fator de risco',
);
assert.equal(
  inventoryScreenColumnHeaderLabel(
    { version: 1, columns: [{ key: 'HAZARD', orientation: 'VERTICAL' }] },
    'hazard',
    'Fator de risco',
  ),
  'Fator de risco',
);
assert.equal(
  inventoryScreenColumnHeaderLabel(
    { version: 1, columns: [{ key: 'HAZARD', orientation: 'VERTICAL', headerLabel: 'Perigo' }] },
    'hazard',
    'Fator de risco',
  ),
  'Perigo',
);
assert.equal(
  inventoryScreenColumnHeaderLabel(
    { version: 1, columns: [{ key: 'HAZARD', orientation: 'VERTICAL', headerLabel: 'Perigo' }] },
    'damage',
    'Risco / dano',
  ),
  'Risco / dano',
);
assert.equal(
  inventoryScreenColumnOrientation(
    { version: 1, columns: [{ key: 'HAZARD', orientation: 'VERTICAL', headerLabel: 'Perigo' }] },
    'hazard',
  ),
  'VERTICAL',
);
assert.equal(inventoryColumnDraftHeaderLabel(null, 'HAZARD'), '');
assert.equal(
  inventoryColumnDraftHeaderLabel(
    { version: 1, columns: [{ key: 'HAZARD', orientation: 'VERTICAL', headerLabel: 'Perigo' }] },
    'HAZARD',
  ),
  'Perigo',
);
assert.equal(INVENTORY_CONFIGURABLE_COLUMNS.find((column) => column.key === 'HAZARD')?.label, 'Fator de risco');
assert.equal(
  INVENTORY_CONFIGURABLE_COLUMNS.find((column) => column.key === 'HAZARD')?.wordLabel,
  'Perigo ou Fator de Risco Ocupacional (P/FRO)',
);
assert.equal(tableSource.includes("label: 'Fator de risco'"), true);
assert.equal(INVENTORY_CONFIGURABLE_COLUMNS.find((column) => column.key === 'TYPE')?.wordLabel, 'Tipo');

const dialogSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'RiskInventoryColumnsDialog.tsx'),
  'utf8',
);
assert.equal(dialogSource.includes('Igual'), true);
assert.equal(dialogSource.includes("value=\"SAME\""), true);
assert.equal(dialogSource.includes('headerOrientation: title'), true);
assert.equal(dialogSource.includes("title === 'SAME'"), true);
assert.equal(dialogSource.includes('save(null)'), true);
assert.equal(dialogSource.includes('placeholder="Padrão"'), true);
assert.equal(dialogSource.includes('headerLabel'), true);
assert.equal(dialogSource.includes('Título personalizado'), true);
assert.equal(inventoryVerticalRiskText({ label: 'Tolerável', abbreviation: 'DA', color: null, level: null, matrixSource: 'CUSTOM', matrixVersionId: null }), 'Tolerável');
assert.equal(inventoryVerticalRiskText({ label: 'Moderado_ERG', abbreviation: 'MERG', color: '#abc', level: 3, matrixSource: 'CUSTOM', matrixVersionId: null }), 'Moderado_ERG');
assert.equal(inventoryVerticalRiskText({ label: 'Moderado', abbreviation: 'M', color: null, level: 3, matrixSource: 'SYSTEM', matrixVersionId: null }), 'Moderado');
assert.equal(inventoryVerticalRiskText({ label: 'Alto', abbreviation: 'A', color: '#ff0000', level: 4, matrixSource: 'SYSTEM', matrixVersionId: null }), 'Alto');
assert.equal(inventoryVerticalRiskText({ label: 'Muito Alto', abbreviation: 'MA', color: null, level: 5, matrixSource: 'SYSTEM', matrixVersionId: null }), 'Muito Alto');
assert.equal(inventoryVerticalRiskText({ label: '', abbreviation: 'DA', color: null, level: null, matrixSource: null, matrixVersionId: null }), '—');
assert.equal(
  inventoryPresentationText({ label: 'Tolerável', abbreviation: 'DA', color: '#00aa00', level: 2, matrixSource: 'CUSTOM', matrixVersionId: null }),
  'DA · Tolerável',
);

assert.equal(inventoryPresentationText(null), '—');
assert.equal(
  inventoryPresentationText({
    label: 'Baixo',
    abbreviation: 'B',
    color: '#00aa00',
    level: 2,
    matrixSource: 'SYSTEM',
    matrixVersionId: null,
  }),
  'B · Baixo',
);

console.log('risk-inventory.presentation.spec.ts OK');
