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
  inventoryDefaultColumnLabel,
  inventoryColumnDraftHeaderChoice,
  inventoryColumnDraftHeaderLabel,
  inventoryColumnDraftOrientation,
  inventoryColumnHeaderOrientation,
  inventoryColumnOrientation,
  inventoryScreenColumnHeaderLabel,
  inventoryScreenColumnHeaderOrientation,
  inventoryScreenColumnLayout,
  inventoryColumnWidthWeight,
  inventoryTableMinWidth,
  inventoryWidthPercent,
  inventoryVerticalHeaderBoxPx,
  inventoryScreenColumnOrientation,
  inventoryPresentationText,
  inventoryProbabilityHint,
  inventoryProbabilityText,
  inventoryResidualProbabilityText,
  inventoryUnitScopeText,
  inventoryVerticalRiskText,
  INVENTORY_CONFIGURABLE_COLUMNS,
  INVENTORY_HEADER_GROUPS,
  INVENTORY_EXPOSED_LABEL,
  INVENTORY_SCOPE_LABEL,
  INVENTORY_WIDTH_FLOOR_PX,
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
assert.equal(tableSource.includes("inventoryDefaultColumnLabel('EPI')"), true);
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
assert.equal(tableSource.includes('inventoryVerticalHeaderBoxPx'), true);
assert.equal(INVENTORY_VERTICAL_LINE_PX, 140);
assert.equal(INVENTORY_VERTICAL_HEADER_LINE_PX, 104);
assert.equal(INVENTORY_VERTICAL_HEADER_LINE_PX < INVENTORY_VERTICAL_LINE_PX, true);
assert.equal(tableSource.includes('maxWidth: stackPx'), true);
assert.equal(tableSource.includes('width: stackPx'), true);
assert.equal(tableSource.includes("overflow: 'hidden'"), true);
assert.equal(INVENTORY_VERTICAL_LINE_PX > 0 && INVENTORY_VERTICAL_LINE_PX < 200, true);
assert.equal(INVENTORY_VERTICAL_STACK_PX > 0 && INVENTORY_VERTICAL_STACK_PX < INVENTORY_VERTICAL_LINE_PX, true);
assert.equal(tableSource.includes('inventoryScreenColumnLayout'), true);
assert.equal(tableSource.includes('<colgroup>'), true);
assert.equal(tableSource.includes('inventoryWidthPercent(column.layout.weight, totalWeight)'), true);
assert.equal(tableSource.includes('inventoryTableMinWidth'), true);
assert.equal(tableSource.includes('totalWeight * INVENTORY_WIDTH_FLOOR_PX'), false);
assert.equal(tableSource.includes("verticalAlign: 'middle'"), true);
assert.equal(tableSource.includes('lineHeight: 1.15'), true);
assert.equal(tableSource.includes('contentAlignY="top"'), true);
assert.equal(tableSource.includes("alignItems: contentAlignY === 'top' ? 'center' : undefined"), true);
assert.equal(tableSource.includes("justifyContent: contentAlignY === 'top' ? 'flex-end' : undefined"), true);
assert.equal(tableSource.includes("verticalAlign: 'top'"), true);
assert.equal(tableSource.includes("display: 'inline-block'"), true);
assert.equal(tableSource.includes('align={column.layout.align}'), true);
assert.equal(tableSource.includes("align={layout('severity').align}"), true);
assert.equal(tableSource.includes('minWidth: 1480'), false);

assert.equal(INVENTORY_CONFIGURABLE_COLUMNS.length, 13);
assert.equal(inventoryScreenColumnLayout(null, 'severity').weight, 1);
assert.equal(inventoryScreenColumnLayout(null, 'probability').weight, 1);
assert.equal(inventoryScreenColumnLayout(null, 'real').weight, 2);
assert.equal(inventoryScreenColumnLayout(null, 'residual').weight, 2);
assert.equal(inventoryScreenColumnLayout(null, 'hazard').weight, 7);
assert.equal(inventoryScreenColumnLayout(null, 'damage').weight, 14);
assert.equal(inventoryScreenColumnLayout(null, 'type').weight, 2);
assert.equal(inventoryScreenColumnLayout(null, 'epi').weight, 5);
assert.equal(inventoryScreenColumnLayout(null, 'recs').weight, 8);
assert.equal(inventoryColumnWidthWeight(null, 'DAMAGE'), inventoryColumnWidthWeight(null, 'HAZARD') * 2);
assert.equal(inventoryColumnWidthWeight(null, 'REAL_RISK'), inventoryColumnWidthWeight(null, 'SEVERITY') * 2);
assert.equal(inventoryColumnWidthWeight(null, 'REAL_RISK'), inventoryColumnWidthWeight(null, 'PROBABILITY') * 2);
const canonicalTotal = INVENTORY_CONFIGURABLE_COLUMNS.reduce(
  (sum, column) => sum + inventoryColumnWidthWeight(null, column.key),
  0,
);
assert.equal(canonicalTotal, 64);
assert.equal(inventoryTableMinWidth(INVENTORY_CONFIGURABLE_COLUMNS.map((column) => inventoryColumnWidthWeight(null, column.key))), canonicalTotal * INVENTORY_WIDTH_FLOOR_PX);
const scaledCanonical = INVENTORY_CONFIGURABLE_COLUMNS.map((column) => inventoryColumnWidthWeight(null, column.key) * 10);
assert.equal(
  inventoryTableMinWidth(scaledCanonical),
  inventoryTableMinWidth(INVENTORY_CONFIGURABLE_COLUMNS.map((column) => inventoryColumnWidthWeight(null, column.key))),
);
assert.equal(inventoryTableMinWidth([1, 2, 7]), inventoryTableMinWidth([10, 20, 70]));
const raised = INVENTORY_CONFIGURABLE_COLUMNS.map((column, index) =>
  inventoryColumnWidthWeight(null, column.key) + (index === 0 ? 39 : 0),
);
assert.equal(raised.reduce((sum, weight) => sum + weight, 0), 103);
assert.equal(
  inventoryTableMinWidth(raised),
  inventoryTableMinWidth(INVENTORY_CONFIGURABLE_COLUMNS.map((column) => inventoryColumnWidthWeight(null, column.key))),
);
assert.equal(inventoryTableMinWidth(raised) === raised.reduce((sum, weight) => sum + weight, 0) * INVENTORY_WIDTH_FLOOR_PX, false);
function widthPercents(weights: number[]) {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  return weights.map((weight) => inventoryWidthPercent(weight, total));
}
const compactPercents = widthPercents([1, 2, 7]);
const scaledPercents = widthPercents([10, 20, 70]);
assert.equal(compactPercents.reduce((sum, percent) => sum + percent, 0), 100);
assert.equal(scaledPercents.reduce((sum, percent) => sum + percent, 0), 100);
compactPercents.forEach((percent, index) => assert.equal(percent, scaledPercents[index]));
assert.equal(widthPercents(scaledCanonical).reduce((sum, percent) => sum + percent, 0), 100);
assert.equal(
  inventoryWidthPercent(inventoryColumnWidthWeight(null, 'DAMAGE'), canonicalTotal),
  inventoryWidthPercent(inventoryColumnWidthWeight(null, 'HAZARD'), canonicalTotal) * 2,
);
assert.equal(
  INVENTORY_CONFIGURABLE_COLUMNS.reduce(
    (sum, column) => sum + inventoryWidthPercent(inventoryColumnWidthWeight(null, column.key), canonicalTotal),
    0,
  ),
  100,
);
assert.equal(
  inventoryColumnWidthWeight(
    { version: 1, columns: [{ key: 'DAMAGE', orientation: 'VERTICAL', headerOrientation: 'HORIZONTAL', widthWeight: 28 }] },
    'DAMAGE',
  ),
  28,
);
assert.equal(
  inventoryColumnWidthWeight(
    { version: 1, columns: [{ key: 'DAMAGE', orientation: 'VERTICAL', headerOrientation: 'HORIZONTAL', widthWeight: 28 }] },
    'HAZARD',
  ),
  7,
);
assert.equal(inventoryScreenColumnLayout(null, 'severity').align, 'center');
assert.equal(inventoryScreenColumnLayout(null, 'hazard').align, 'left');
assert.equal(inventoryVerticalHeaderBoxPx('S') <= 24, true);
assert.equal(
  inventoryVerticalHeaderBoxPx('Perigo ou Fator de Risco Ocupacional (P/FRO)'),
  INVENTORY_VERTICAL_HEADER_LINE_PX,
);
assert.equal(inventoryScreenColumnLayout(null, 'severity').stackPx, 32);
assert.equal(
  inventoryScreenColumnLayout(
    { version: 1, columns: [{ key: 'REAL_RISK', orientation: 'VERTICAL', headerOrientation: 'VERTICAL' }] },
    'real',
  ).weight,
  2,
);
assert.equal(
  inventoryScreenColumnLayout(
    { version: 1, columns: [{ key: 'HAZARD', orientation: 'VERTICAL', headerOrientation: 'VERTICAL' }] },
    'hazard',
  ).stackPx,
  INVENTORY_VERTICAL_STACK_PX,
);
assert.equal(
  INVENTORY_HEADER_GROUPS.reduce((sum, group) => sum + group.colSpan, 0),
  INVENTORY_CONFIGURABLE_COLUMNS.length,
);
assert.deepEqual(
  INVENTORY_HEADER_GROUPS.map((group) => ({ id: group.id, colSpan: group.colSpan, label: group.label })),
  [
    {
      id: 'occupation',
      colSpan: 4,
      label: 'Severidade (S) × Probabilidade (P) = RISCO OCUPACIONAL (RO):',
    },
    { id: 'real', colSpan: 6, label: 'RISCO REAL (Puro/Inerente)' },
    { id: 'residual', colSpan: 3, label: 'RISCO RESIDUAL' },
  ],
);
assert.equal(tableSource.includes('INVENTORY_HEADER_GROUPS'), true);
assert.equal(tableSource.includes('headerLabel(column.id, column.label)'), true);
assert.equal(tableSource.includes("borderLeft: '2px solid'"), true);
assert.equal(tableSource.includes('dividerBefore: true'), true);
assert.equal(INVENTORY_CONFIGURABLE_COLUMNS.some((column) => column.key === 'ORIGIN'), false);
assert.equal(INVENTORY_CONFIGURABLE_COLUMNS.some((column) => column.key === 'SEVERITY_RESIDUAL'), false);
for (const preference of [null, undefined] as const) {
  assert.equal(inventoryColumnOrientation(preference, 'TYPE'), 'VERTICAL');
  assert.equal(inventoryColumnHeaderOrientation(preference, 'TYPE'), 'VERTICAL');
  assert.equal(inventoryColumnDraftOrientation(preference, 'TYPE'), 'VERTICAL');
  assert.equal(inventoryColumnDraftHeaderChoice(preference, 'TYPE'), 'SAME');
  assert.equal(inventoryColumnOrientation(preference, 'EPI'), 'VERTICAL');
  assert.equal(inventoryColumnHeaderOrientation(preference, 'EPI'), 'HORIZONTAL');
  assert.equal(inventoryColumnDraftOrientation(preference, 'EPI'), 'VERTICAL');
  assert.equal(inventoryColumnDraftHeaderChoice(preference, 'EPI'), 'HORIZONTAL');
  assert.equal(inventoryColumnOrientation(preference, 'REAL_RISK'), 'VERTICAL');
  assert.equal(inventoryColumnHeaderOrientation(preference, 'REAL_RISK'), 'HORIZONTAL');
  assert.equal(inventoryColumnDraftOrientation(preference, 'REAL_RISK'), 'VERTICAL');
  assert.equal(inventoryColumnDraftHeaderChoice(preference, 'REAL_RISK'), 'HORIZONTAL');
  assert.equal(inventoryColumnOrientation(preference, 'RESIDUAL_RISK'), 'VERTICAL');
  assert.equal(inventoryColumnHeaderOrientation(preference, 'RESIDUAL_RISK'), 'HORIZONTAL');
  assert.equal(inventoryColumnDraftHeaderChoice(preference, 'RESIDUAL_RISK'), 'HORIZONTAL');
  assert.equal(inventoryColumnOrientation(preference, 'HAZARD'), 'HORIZONTAL');
  assert.equal(inventoryColumnHeaderOrientation(preference, 'HAZARD'), 'HORIZONTAL');
  assert.equal(inventoryColumnDraftHeaderChoice(preference, 'HAZARD'), 'SAME');
}
assert.equal(
  inventoryColumnOrientation(
    { version: 1, columns: [{ key: 'EPI', orientation: 'HORIZONTAL' }] },
    'TYPE',
  ),
  'VERTICAL',
);
assert.equal(
  inventoryColumnOrientation(
    { version: 1, columns: [{ key: 'EPI', orientation: 'HORIZONTAL' }] },
    'EPI',
  ),
  'HORIZONTAL',
);
assert.equal(
  inventoryColumnHeaderOrientation(
    { version: 1, columns: [{ key: 'EPI', orientation: 'HORIZONTAL' }] },
    'EPI',
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
assert.equal(inventoryColumnDraftOrientation(null, 'EPI'), 'VERTICAL');
assert.equal(
  inventoryColumnDraftHeaderChoice(
    { version: 1, columns: [{ key: 'REAL_RISK', orientation: 'VERTICAL' }] },
    'REAL_RISK',
  ),
  'SAME',
);
assert.equal(
  inventoryColumnHeaderOrientation(
    { version: 1, columns: [{ key: 'REAL_RISK', orientation: 'VERTICAL' }] },
    'REAL_RISK',
  ),
  'VERTICAL',
);
assert.equal(
  inventoryColumnHeaderOrientation(
    { version: 1, columns: [{ key: 'REAL_RISK', orientation: 'VERTICAL', headerOrientation: 'HORIZONTAL' }] },
    'REAL_RISK',
  ),
  'HORIZONTAL',
);
assert.equal(
  inventoryColumnHeaderOrientation(
    { version: 1, columns: [{ key: 'RESIDUAL_RISK', orientation: 'VERTICAL', headerOrientation: 'VERTICAL' }] },
    'RESIDUAL_RISK',
  ),
  'VERTICAL',
);
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
assert.equal(inventoryColumnHeaderOrientation(null, 'TYPE'), 'VERTICAL');
assert.equal(tableSource.includes('inventoryScreenColumnHeaderOrientation'), true);
assert.equal(tableSource.includes('inventoryScreenColumnOrientation'), true);
assert.equal(tableSource.includes('inventoryScreenColumnHeaderLabel'), true);
const hazardDefault = inventoryDefaultColumnLabel('HAZARD');
const damageDefault = inventoryDefaultColumnLabel('DAMAGE');
assert.equal(hazardDefault, 'Perigo ou Fator de Risco Ocupacional (P/FRO)');
assert.equal(damageDefault, 'Risco');
assert.equal(
  inventoryScreenColumnHeaderLabel(null, 'hazard', hazardDefault),
  hazardDefault,
);
assert.equal(
  inventoryScreenColumnHeaderLabel(
    { version: 1, columns: [{ key: 'HAZARD', orientation: 'VERTICAL' }] },
    'hazard',
    hazardDefault,
  ),
  hazardDefault,
);
assert.equal(
  inventoryScreenColumnHeaderLabel(
    { version: 1, columns: [{ key: 'HAZARD', orientation: 'VERTICAL', headerLabel: 'Perigo' }] },
    'hazard',
    hazardDefault,
  ),
  'Perigo',
);
assert.equal(
  inventoryScreenColumnHeaderLabel(
    { version: 1, columns: [{ key: 'HAZARD', orientation: 'VERTICAL' }] },
    'hazard',
    hazardDefault,
  ),
  hazardDefault,
);
assert.equal(
  inventoryScreenColumnHeaderLabel(
    { version: 1, columns: [{ key: 'HAZARD', orientation: 'VERTICAL', headerLabel: 'Perigo' }] },
    'damage',
    damageDefault,
  ),
  damageDefault,
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
assert.equal(inventoryDefaultColumnLabel('TYPE'), 'Tipo');
assert.equal(inventoryDefaultColumnLabel('GENERATING_SOURCE'), 'Fonte Geradora ou Circunstância de Risco');
assert.equal(inventoryDefaultColumnLabel('ENGINEERING'), 'EPC/ENG.');
assert.equal(inventoryDefaultColumnLabel('REAL_RISK'), 'RO');
assert.equal(inventoryDefaultColumnLabel('PROBABILITY_RESIDUAL'), 'P');
assert.equal(inventoryDefaultColumnLabel('RESIDUAL_RISK'), 'RO');
assert.equal(tableSource.includes('inventoryDefaultColumnLabel'), true);
assert.equal(tableSource.includes('Fator de risco'), false);
assert.equal(tableSource.includes('headerLabel(column.id, column.label)'), true);

const dialogSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'RiskInventoryColumnsDialog.tsx'),
  'utf8',
);
assert.equal(dialogSource.includes('Igual'), true);
assert.equal(dialogSource.includes("value=\"SAME\""), true);
assert.equal(dialogSource.includes('headerOrientation: title'), true);
assert.equal(dialogSource.includes("title === 'SAME'"), true);
assert.equal(dialogSource.includes('save(null)'), true);
assert.equal(dialogSource.includes('save(currentColumns())'), true);
assert.equal(dialogSource.includes('Definir como padrão do sistema'), true);
assert.equal(dialogSource.includes('SAuthShow'), true);
assert.equal(dialogSource.includes('RoleEnum.MASTER'), true);
assert.equal(dialogSource.includes('defineSystemDefault'), true);
assert.equal(dialogSource.includes('useMutateSystemRiskInventoryColumns'), true);
assert.equal(dialogSource.includes('currentColumns()'), true);
assert.equal(dialogSource.includes('widthWeight'), true);
assert.equal(dialogSource.includes('Largura'), true);
assert.equal(dialogSource.includes('placeholder="Título personalizado"'), true);
assert.equal(dialogSource.includes('placeholder="Padrão"'), false);
assert.equal(dialogSource.includes('Word:'), false);
assert.equal(dialogSource.includes('wordLabel'), false);
assert.equal(dialogSource.includes('headerLabel'), true);
assert.equal(dialogSource.includes('fontWeight: 700'), true);
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
