/**
 * Executar:
 * npx tsx src/@v2/pages/companies/risk-inventory/risk-inventory.presentation.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { RISK_TECHNICAL_PHYSICAL_COLUMNS } from '@v2/pages/companies/risk-technical-data/risk-technical-data.presentation';

import {
  formatInventoryEpis,
  formatInventoryLines,
  inventoryExposedEmployeeText,
  inventoryDefaultColumnLabel,
  inventoryColumnCanHide,
  inventoryColumnVisible,
  inventoryColumnFamily,
  inventoryExtraColumnLabel,
  inventoryHeaderGroups,
  inventoryHeaderRuns,
  inventoryTableHeaderGroups,
  inventoryOptionalColumnHeaderOrientation,
  inventoryOptionalColumnOrientation,
  inventoryOptionalColumnWidthWeight,
  inventoryOptionalCriteriaText,
  inventoryOptionalDefaultSetting,
  inventoryOrderColumnIncludedInDocx,
  inventoryOrderColumnScreenOnly,
  inventoryOrderColumnVisible,
  inventoryVisibleOptionalColumns,
  reconcileInventoryColumnOrder,
  resolveInventoryColumnOrder,
  inventoryVisibleExtraColumns,
  INVENTORY_EXTRA_COLUMNS,
  inventoryOriginText,
  inventoryOriginVisible,
  INVENTORY_HIDEABLE_COLUMN_KEYS,
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
  INVENTORY_DIALOG_COLUMNS,
  INVENTORY_HEADER_GROUPS,
  INVENTORY_ORIGIN_WIDTH_WEIGHT,
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
assert.equal(tableSource.includes('inventoryWidthPercent('), true);
assert.equal(tableSource.includes("slot.kind === 'optional'"), true);
assert.equal(tableSource.includes('inventoryTableMinWidth'), true);
assert.equal(tableSource.includes('totalWeight * INVENTORY_WIDTH_FLOOR_PX'), false);
assert.equal(tableSource.includes("verticalAlign: 'middle'"), false);
assert.equal(tableSource.includes('lineHeight: 1.15'), true);
assert.equal(tableSource.includes('contentAlignY="top"'), true);
assert.equal(tableSource.includes("align={slot.id === 'type' ? 'left' : layout.align}"), true);
assert.equal(tableSource.includes("align={slot.id === 'type' ? 'left' : layout(slot.id).align}"), true);
assert.equal(tableSource.includes("columnId === 'type' ? 'left'"), true);
assert.equal(
  tableSource.includes("alignItems:\n            contentAlignY === 'top' ? (align === 'left' ? 'flex-start' : 'center') : undefined"),
  true,
);
assert.equal(tableSource.includes("justifyContent: contentAlignY === 'top' ? 'flex-end' : undefined"), true);
assert.equal(tableSource.includes("verticalAlign: 'top'"), true);
assert.equal(tableSource.includes("verticalAlign: 'bottom'"), true);
assert.equal(tableSource.includes("display: 'inline-block'"), true);
assert.equal(tableSource.includes('layout(slot.id).align'), true);
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
assert.equal(tableSource.includes('inventoryHeaderRuns'), true);
assert.equal(tableSource.includes('resolveInventoryColumnOrder'), true);
assert.equal(tableSource.includes("id: 'origin'"), true);
assert.equal(tableSource.includes('inventoryOrderColumnVisible'), true);
assert.equal(tableSource.includes('inventoryOriginText(unit)'), false);
assert.equal(tableSource.includes('row.originText'), true);
assert.equal(tableSource.includes('unit.originSliceLabel'), false);
assert.equal(tableSource.includes('useState<ReadonlySet<string>>(() => new Set())'), true);
assert.equal(tableSource.includes('expandedUnitIds.has(unit.id)'), true);
assert.equal(tableSource.includes("rotate(-90deg)"), true);
assert.equal(tableSource.includes('originHomogeneousGroupIds.join'), true);
assert.equal(tableSource.includes('headerLabel(slot.id, slot.label)'), true);
assert.equal(tableSource.includes("borderLeft: '2px solid'"), true);
assert.equal(tableSource.includes("inventoryColumnFamily(key) === 'residual'"), true);
assert.equal(INVENTORY_CONFIGURABLE_COLUMNS.some((column) => column.key === 'ORIGIN'), false);
assert.equal(INVENTORY_CONFIGURABLE_COLUMNS.some((column) => column.key === 'SEVERITY_RESIDUAL'), false);
assert.equal(INVENTORY_DIALOG_COLUMNS[0].key, 'TYPE');
assert.equal(INVENTORY_DIALOG_COLUMNS[1].key, 'ORIGIN');
assert.equal(inventoryOriginVisible(null), false);
assert.equal(inventoryOriginVisible(undefined), false);
assert.equal(
  inventoryOriginVisible({ version: 1, columns: [{ key: 'TYPE', orientation: 'VERTICAL' }] }),
  false,
);
assert.equal(
  inventoryOriginVisible({
    version: 1,
    columns: [{ key: 'ORIGIN', orientation: 'HORIZONTAL', visible: false }],
  }),
  false,
);
assert.equal(
  inventoryOriginVisible({
    version: 1,
    columns: [{ key: 'ORIGIN', orientation: 'HORIZONTAL', visible: true, widthWeight: 8 }],
  }),
  true,
);
const structuralKeys = ['TYPE', 'HAZARD', 'DAMAGE', 'SEVERITY', 'PROBABILITY', 'REAL_RISK', 'RESIDUAL_RISK'] as const;
structuralKeys.forEach((key) => {
  assert.equal(inventoryColumnCanHide(key), false);
  assert.equal(
    inventoryColumnVisible(
      { version: 1, columns: [{ key, orientation: 'HORIZONTAL', visible: false }] },
      key,
    ),
    true,
  );
});
INVENTORY_HIDEABLE_COLUMN_KEYS.forEach((key) => {
  assert.equal(inventoryColumnCanHide(key), true);
  assert.equal(
    inventoryColumnVisible(
      { version: 1, columns: [{ key, orientation: 'HORIZONTAL', visible: false }] },
      key,
    ),
    false,
  );
});
assert.equal(inventoryColumnVisible(null, 'GENERATING_SOURCE'), true);
assert.equal(inventoryColumnVisible(null, 'ORIGIN'), false);
assert.equal(
  inventoryColumnVisible(
    { version: 1, columns: [{ key: 'ORIGIN', orientation: 'HORIZONTAL' }] },
    'ORIGIN',
  ),
  false,
);
const hiddenEpiWeights = INVENTORY_CONFIGURABLE_COLUMNS.filter((column) => column.key !== 'EPI').map((column) =>
  inventoryColumnWidthWeight(null, column.key),
);
const hiddenEpiPercent = hiddenEpiWeights.reduce(
  (sum, weight) => sum + inventoryWidthPercent(weight, hiddenEpiWeights.reduce((total, item) => total + item, 0)),
  0,
);
assert.ok(Math.abs(hiddenEpiPercent - 100) < 0.001);
assert.equal(inventoryColumnWidthWeight(null, 'ORIGIN'), INVENTORY_ORIGIN_WIDTH_WEIGHT);
assert.equal(INVENTORY_ORIGIN_WIDTH_WEIGHT, 6);
assert.equal(
  inventoryColumnWidthWeight(
    { version: 1, columns: [{ key: 'ORIGIN', orientation: 'HORIZONTAL', widthWeight: 20, visible: true }] },
    'ORIGIN',
  ),
  20,
);
assert.equal(
  inventoryTableMinWidth([
    ...INVENTORY_CONFIGURABLE_COLUMNS.map((column) => inventoryColumnWidthWeight(null, column.key)),
    INVENTORY_ORIGIN_WIDTH_WEIGHT,
  ]),
  canonicalTotal * INVENTORY_WIDTH_FLOOR_PX,
);
const screenWithoutOrigin = [
  'type',
  'hazard',
  'damage',
  'source',
  'epi',
  'epc',
  'adm',
  'severity',
  'probability',
  'real',
  'recs',
  'pAfter',
  'residual',
];
const screenWithOrigin = ['type', 'origin', ...screenWithoutOrigin.slice(1)];
assert.equal(inventoryHeaderGroups(screenWithoutOrigin)[0].colSpan, 4);
assert.equal(inventoryHeaderGroups(screenWithOrigin)[0].colSpan, 5);
assert.equal(inventoryHeaderGroups(screenWithOrigin)[1].colSpan, 6);
assert.equal(inventoryHeaderGroups(screenWithOrigin)[2].colSpan, 3);
assert.equal(
  inventoryHeaderGroups(screenWithOrigin).reduce((sum, group) => sum + group.colSpan, 0),
  INVENTORY_CONFIGURABLE_COLUMNS.length + 1,
);
const screenHidingOptional = screenWithoutOrigin.filter(
  (column) => !['source', 'epi', 'epc', 'adm', 'recs', 'pAfter'].includes(column),
);
const hiddenGroups = inventoryHeaderGroups(screenHidingOptional);
assert.deepEqual(
  hiddenGroups.map((group) => group.colSpan),
  [3, 3, 1],
);
assert.equal(
  hiddenGroups.reduce((sum, group) => sum + group.colSpan, 0),
  screenHidingOptional.length,
);
assert.equal(
  inventoryOriginText({ name: 'GSE Operacional', originType: 'GSE' }),
  'GSE Operacional\n(GSE)',
);
assert.equal(inventoryOriginText({ name: '  ', originType: null }), 'GSE');
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
assert.equal(tableSource.includes('headerLabel(slot.id, slot.label)'), true);

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
assert.equal(dialogSource.includes("aria-label': `Word:"), true);
assert.equal(dialogSource.includes('label="Word"'), true);
assert.equal(dialogSource.includes('label="Tela"'), true);
assert.equal(dialogSource.includes('includeInDocx: docxDraft[column.key]'), true);
assert.equal(dialogSource.includes('headerLabel'), true);
assert.equal(dialogSource.includes('INVENTORY_DIALOG_COLUMNS'), true);
assert.equal(dialogSource.includes('label="Mostrar conteúdo"'), false);
assert.equal(dialogSource.includes('label="Mostrar"'), false);
assert.equal(dialogSource.includes('inventoryColumnCanHide(column.key)'), true);
assert.equal(dialogSource.includes('visible: visibleDraft[column.key]'), true);
assert.equal(dialogSource.includes('maxWidth="lg"'), true);
assert.equal(dialogSource.includes('maxWidth="md"'), false);
assert.equal(dialogSource.includes('flexWrap: \'wrap\''), true);
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

const pgrStep = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    '../../../../components/organisms/modals/ModalAddDocVersion/components/2-pgr/index.tsx',
  ),
  'utf8',
);
const caLabel = "Não mostrar CA's de EPI's";
const switches = pgrStep.split('<SSwitch').slice(1);
const caSwitch = switches.find((block) => block.includes(caLabel));
assert.ok(caSwitch);
assert.equal(caSwitch.includes('isHideCA'), true);
assert.equal(caSwitch.includes('isHideOriginColumn'), false);
assert.equal(switches.some((block) => block.includes('isHideOriginColumn')), false);
assert.equal(pgrStep.includes('Não mostrar coluna de origem na APR por cargo'), false);
assert.equal(pgrStep.includes("Não mostrar coluna de origem nas APR's"), false);

const screenIds = ['type', 'hazard', 'damage', 'source', 'epi', 'epc', 'adm', 'severity', 'probability', 'real', 'recs', 'pAfter', 'residual'];
const nativeBands = inventoryHeaderGroups(screenIds);
const withTechnical = inventoryTableHeaderGroups(screenIds, 1);
assert.equal(withTechnical[1].id, 'real');
assert.equal(withTechnical[1].colSpan, nativeBands[1].colSpan);
assert.equal(withTechnical[2].id, 'residual');
assert.equal(withTechnical[2].colSpan, nativeBands[2].colSpan);
assert.equal(withTechnical[3].label, 'DADOS TÉCNICOS');
assert.equal(withTechnical[3].colSpan, 1);
assert.equal(inventoryTableHeaderGroups(screenIds, 0).some((group) => group.id === 'technical'), false);
assert.deepEqual(
  INVENTORY_EXTRA_COLUMNS.map((column) => column.key),
  ['cas', 'propagation', 'unit', 'nr15lt', 'twa', 'stel', 'ipvs', 'pv', 'pe', 'carnogenicityACGIH', 'carnogenicityLinach', 'symptoms'],
);
assert.equal(INVENTORY_EXTRA_COLUMNS.some((column) => column.key === 'exams' || column.key === 'severity'), false);
const extraPreference = {
  version: 1 as const,
  columns: [],
  extraColumns: [
    { key: 'cas' as const, orientation: 'VERTICAL' as const, widthWeight: 2, visible: false },
    { key: 'symptoms' as const, orientation: 'HORIZONTAL' as const, widthWeight: 16 },
  ],
};
assert.deepEqual(inventoryVisibleExtraColumns(extraPreference).map((column) => column.key), ['symptoms']);
const nativeWeight = INVENTORY_DIALOG_COLUMNS.reduce((sum, column) => {
  if (!inventoryColumnVisible(null, column.key)) return sum;
  return sum + inventoryColumnWidthWeight(null, column.key);
}, 0);
const shownWeight = nativeWeight + 16;
assert.equal(
  Math.round(
    (inventoryWidthPercent(16, shownWeight) +
      INVENTORY_DIALOG_COLUMNS.reduce((sum, column) => {
        if (!inventoryColumnVisible(null, column.key)) return sum;
        return sum + inventoryWidthPercent(inventoryColumnWidthWeight(null, column.key), shownWeight);
      }, 0)) *
      10,
  ),
  1000,
);
assert.equal(tableSource.includes('inventoryHeaderRuns'), true);
assert.equal(tableSource.includes('technicalValues'), true);
assert.equal(tableSource.includes("id: 'severity'"), true);

const symptomsCatalog = INVENTORY_EXTRA_COLUMNS.find((column) => column.key === 'symptoms');
const symptomsTechnical = RISK_TECHNICAL_PHYSICAL_COLUMNS.find((column) => column.key === 'symptoms');
assert.equal(symptomsCatalog?.headerLabel, 'Efeitos e Sintomas');
assert.equal(symptomsTechnical?.headerLabel, 'Efeitos e Sintomas');
assert.equal(
  inventoryExtraColumnLabel({ key: 'symptoms', orientation: 'HORIZONTAL', headerLabel: 'Local' }),
  'Local',
);
assert.equal(
  inventoryExtraColumnLabel({ key: 'symptoms', orientation: 'HORIZONTAL' }),
  'Efeitos e Sintomas',
);

const canonicalOrder = [
  'TYPE',
  'ORIGIN',
  'HAZARD',
  'DAMAGE',
  'GENERATING_SOURCE',
  'EPI',
  'ENGINEERING',
  'ADMINISTRATIVE',
  'SEVERITY',
  'PROBABILITY',
  'REAL_RISK',
  'RECOMMENDATIONS',
  'PROBABILITY_RESIDUAL',
  'RESIDUAL_RISK',
] as const;
const withoutOrder = {
  version: 1 as const,
  columns: [] as [],
  extraColumns: [
    { key: 'cas' as const, orientation: 'VERTICAL' as const },
    { key: 'symptoms' as const, orientation: 'HORIZONTAL' as const },
  ],
};
assert.deepEqual(resolveInventoryColumnOrder(withoutOrder), [...canonicalOrder, 'cas', 'symptoms']);
assert.deepEqual(
  inventoryHeaderRuns(resolveInventoryColumnOrder(withoutOrder).filter((key) => key !== 'ORIGIN')).map((run) => [
    run.family,
    run.colSpan,
  ]),
  [
    ['occupation', 4],
    ['real', 6],
    ['residual', 3],
    ['technical', 2],
  ],
);
assert.equal(reconcileInventoryColumnOrder(undefined, ['symptoms']), undefined);
assert.deepEqual(
  reconcileInventoryColumnOrder(['TYPE', 'cas', 'HAZARD'], ['cas', 'symptoms']),
  ['TYPE', 'cas', 'HAZARD', 'symptoms'],
);
assert.deepEqual(reconcileInventoryColumnOrder(['TYPE', 'cas', 'symptoms'], ['symptoms']), ['TYPE', 'symptoms']);

const interleaved = {
  version: 1 as const,
  columns: [] as [],
  extraColumns: [
    { key: 'symptoms' as const, orientation: 'HORIZONTAL' as const },
    { key: 'cas' as const, orientation: 'VERTICAL' as const },
  ],
  columnOrder: [
    'TYPE',
    'ORIGIN',
    'HAZARD',
    'DAMAGE',
    'symptoms',
    'GENERATING_SOURCE',
    'EPI',
    'cas',
    'ENGINEERING',
    'ADMINISTRATIVE',
    'SEVERITY',
    'PROBABILITY',
    'REAL_RISK',
    'RECOMMENDATIONS',
    'PROBABILITY_RESIDUAL',
    'RESIDUAL_RISK',
  ],
};
const visibleInterleaved = resolveInventoryColumnOrder(interleaved).filter((key) => key !== 'ORIGIN');
assert.deepEqual(inventoryHeaderRuns(visibleInterleaved).map((run) => [run.family, run.colSpan]), [
  ['occupation', 3],
  ['technical', 1],
  ['occupation', 1],
  ['real', 1],
  ['technical', 1],
  ['real', 5],
  ['residual', 3],
]);
assert.equal(inventoryColumnFamily('symptoms'), 'technical');
assert.equal(inventoryColumnFamily('SEVERITY'), 'real');
assert.equal(inventoryColumnFamily('RECOMMENDATIONS'), 'residual');

const hiddenSlot = {
  version: 1 as const,
  columns: [{ key: 'GENERATING_SOURCE' as const, orientation: 'HORIZONTAL' as const, visible: false }],
  extraColumns: [{ key: 'symptoms' as const, orientation: 'HORIZONTAL' as const, visible: false }],
  columnOrder: ['TYPE', 'HAZARD', 'symptoms', 'GENERATING_SOURCE', 'DAMAGE'] as const,
};
const logicalHidden = resolveInventoryColumnOrder(hiddenSlot);
assert.ok(logicalHidden.indexOf('symptoms') > logicalHidden.indexOf('HAZARD'));
assert.ok(logicalHidden.indexOf('symptoms') < logicalHidden.indexOf('DAMAGE'));
assert.ok(logicalHidden.includes('GENERATING_SOURCE'));
const visibleHidden = logicalHidden.filter((key) => key !== 'GENERATING_SOURCE' && key !== 'symptoms' && key !== 'ORIGIN');
assert.equal(inventoryHeaderRuns(visibleHidden).some((run) => run.family === 'technical'), false);

const partial = resolveInventoryColumnOrder({
  version: 1,
  columns: [],
  extraColumns: [
    { key: 'symptoms', orientation: 'HORIZONTAL' },
    { key: 'cas', orientation: 'VERTICAL' },
  ],
  columnOrder: ['HAZARD', 'symptoms', 'EPI', 'not-a-column' as 'TYPE', 'HAZARD'],
});
assert.equal(partial.filter((key) => key === 'HAZARD').length, 1);
assert.equal(partial.includes('not-a-column' as 'TYPE'), false);
assert.equal(partial.at(-1), 'cas');
assert.ok(partial.indexOf('TYPE') < partial.indexOf('HAZARD'));

const tabSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'RiskInventoryTabContent.tsx'),
  'utf8',
);
const orderDialogSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'RiskInventoryColumnOrderDialog.tsx'),
  'utf8',
);
const columnsDialogSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'RiskInventoryColumnsDialog.tsx'),
  'utf8',
);
const serviceSource = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    '../../../services/security/risk-inventory/update-risk-inventory-columns.service.ts',
  ),
  'utf8',
);
assert.equal(tabSource.includes('Organizar colunas'), true);
assert.equal(tabSource.includes('Colunas opcionais'), true);
assert.equal(orderDialogSource.includes('columnOrder: draft'), true);
assert.equal(orderDialogSource.includes('Subir'), true);
assert.equal(orderDialogSource.includes('só Word'), true);
assert.equal(orderDialogSource.includes('só tela'), true);
assert.equal(columnsDialogSource.includes('columnPreference?.columnOrder'), true);
assert.equal(serviceSource.includes('columnOrder'), true);
assert.equal(serviceSource.includes('optionalColumns'), true);
assert.equal(serviceSource.includes('columns: null'), true);

const optionalDialogSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'RiskInventoryOptionalColumnsDialog.tsx'),
  'utf8',
);
assert.equal(optionalDialogSource.includes('label="Tela"'), true);
assert.equal(optionalDialogSource.includes('label="Word"'), true);
assert.equal(optionalDialogSource.includes('Disponível em breve'), false);
assert.equal(optionalDialogSource.includes('includeInDocx: event.target.checked'), true);
assert.equal(optionalDialogSource.includes('RISK_INVENTORY_OPTIONAL_DOCX_RENDERERS_READY'), true);
assert.equal(optionalDialogSource.includes('Conteúdo'), true);
assert.equal(optionalDialogSource.includes('Largura'), true);
assert.equal(optionalDialogSource.includes('inventoryOptionalColumnWidthWeight'), true);
assert.equal(optionalDialogSource.includes('headerOrientation'), true);
assert.equal(optionalDialogSource.includes('widthWeight: next'), true);
assert.equal(tableSource.includes('inventoryOptionalColumnOrientation'), true);
assert.equal(tableSource.includes('inventoryOptionalColumnHeaderOrientation'), true);
assert.equal(tableSource.includes('column.headerVertical'), true);
assert.equal(inventoryOptionalDefaultSetting('frequency').includeInDocx, false);
assert.equal(inventoryOptionalDefaultSetting('frequency').visible, true);
assert.equal(inventoryOptionalDefaultSetting('employeeCountGho').widthWeight, 2);
assert.equal(inventoryOptionalDefaultSetting('employeeCountGho').headerOrientation, 'VERTICAL');
assert.equal(inventoryOptionalDefaultSetting('medsImplemented').widthWeight, 10);
assert.equal(inventoryOptionalDefaultSetting('frequency').widthWeight, 8);
assert.equal(inventoryOptionalColumnOrientation({ key: 'frequency', orientation: 'VERTICAL' }), 'VERTICAL');
assert.equal(
  inventoryOptionalColumnHeaderOrientation({
    key: 'frequency',
    orientation: 'HORIZONTAL',
    headerOrientation: 'VERTICAL',
  }),
  'VERTICAL',
);
assert.equal(
  inventoryOptionalColumnWidthWeight({ key: 'frequency', orientation: 'HORIZONTAL', widthWeight: 12 }),
  12,
);
assert.equal(inventoryOptionalColumnWidthWeight({ key: 'frequency', orientation: 'HORIZONTAL' }), 8);

const legacyNoOptionals = {
  version: 1 as const,
  columns: [{ key: 'EPI' as const, orientation: 'HORIZONTAL' as const, visible: true }],
  extraColumns: [{ key: 'cas' as const, orientation: 'VERTICAL' as const }],
};
assert.equal(inventoryVisibleOptionalColumns(legacyNoOptionals).length, 0);
assert.equal(inventoryOrderColumnVisible(legacyNoOptionals, 'frequency'), false);
assert.equal(inventoryOrderColumnIncludedInDocx(legacyNoOptionals, 'frequency'), false);
assert.equal(resolveInventoryColumnOrder(legacyNoOptionals).includes('frequency'), false);
assert.equal(resolveInventoryColumnOrder(legacyNoOptionals).includes('employeeCountGho'), false);

assert.equal(
  inventoryOrderColumnVisible(
    {
      version: 1 as const,
      columns: [],
      optionalColumns: [{ key: 'frequency' as const, orientation: 'HORIZONTAL' as const, visible: true }],
    },
    'frequency',
  ),
  true,
);
assert.equal(
  inventoryOrderColumnVisible(
    {
      version: 1 as const,
      columns: [],
      optionalColumns: [{ key: 'frequency' as const, orientation: 'HORIZONTAL' as const, visible: false }],
    },
    'frequency',
  ),
  false,
);
assert.equal(
  inventoryOrderColumnVisible(
    {
      version: 1 as const,
      columns: [],
      optionalColumns: [{ key: 'frequency' as const, orientation: 'HORIZONTAL' as const }],
    },
    'frequency',
  ),
  false,
);

const screenOnlyPref = {
  version: 1 as const,
  columns: [{ key: 'EPI' as const, orientation: 'HORIZONTAL' as const, visible: true, includeInDocx: false }],
};
assert.equal(inventoryOrderColumnVisible(screenOnlyPref, 'EPI'), true);
assert.equal(inventoryOrderColumnIncludedInDocx(screenOnlyPref, 'EPI'), false);
assert.equal(inventoryOrderColumnScreenOnly(screenOnlyPref, 'EPI'), true);

const wordOnlyPref = {
  version: 1 as const,
  columns: [{ key: 'EPI' as const, orientation: 'HORIZONTAL' as const, visible: false, includeInDocx: true }],
};
assert.equal(inventoryOrderColumnVisible(wordOnlyPref, 'EPI'), false);
assert.equal(inventoryOrderColumnIncludedInDocx(wordOnlyPref, 'EPI'), true);
assert.equal(inventoryOrderColumnScreenOnly(wordOnlyPref, 'EPI'), false);

const legacyPref = {
  version: 1 as const,
  columns: [{ key: 'EPI' as const, orientation: 'HORIZONTAL' as const, visible: false }],
};
assert.equal(inventoryOrderColumnIncludedInDocx(legacyPref, 'EPI'), false);

const optionalPref = {
  version: 1 as const,
  columns: [] as [],
  optionalColumns: [{ key: 'frequency' as const, orientation: 'HORIZONTAL' as const, visible: true, includeInDocx: true }],
};
assert.equal(inventoryOrderColumnVisible(optionalPref, 'frequency'), true);
assert.equal(inventoryOrderColumnIncludedInDocx(optionalPref, 'frequency'), true);
assert.equal(inventoryOrderColumnScreenOnly(optionalPref, 'frequency'), false);

const optionalScreenOnly = {
  version: 1 as const,
  columns: [] as [],
  optionalColumns: [{ key: 'frequency' as const, orientation: 'HORIZONTAL' as const, visible: true, includeInDocx: false }],
};
assert.equal(inventoryOrderColumnIncludedInDocx(optionalScreenOnly, 'frequency'), false);
assert.equal(inventoryOrderColumnScreenOnly(optionalScreenOnly, 'frequency'), true);

assert.equal(
  inventoryOptionalCriteriaText(
    {
      isQuantity: false,
      probabilityCriteria: {
        employeeCountTotal: 10,
        employeeCountGho: 3,
        minDurationJT: 480,
        minDurationEO: 120,
        chancesOfHappening: 3,
        frequency: 2,
        history: 1,
        medsImplemented: 4,
      },
    },
    'minDurationEO',
  ),
  '120 min',
);
assert.equal(
  inventoryOptionalCriteriaText(
    {
      isQuantity: false,
      probabilityCriteria: {
        employeeCountTotal: 10,
        employeeCountGho: 3,
        minDurationJT: 480,
        minDurationEO: 120,
        chancesOfHappening: 3,
        frequency: 2,
        history: 1,
        medsImplemented: 4,
      },
    },
    'minDurationJT',
  ),
  '480 min',
);
assert.equal(
  inventoryOptionalCriteriaText(
    {
      isQuantity: false,
      probabilityCriteria: {
        employeeCountTotal: null,
        employeeCountGho: null,
        minDurationJT: null,
        minDurationEO: null,
        chancesOfHappening: 3,
        frequency: 2,
        history: 1,
        medsImplemented: 5,
      },
    },
    'frequency',
  ),
  'Exporádica (Quizenal)',
);
assert.equal(
  inventoryOptionalCriteriaText(
    {
      isQuantity: false,
      probabilityCriteria: {
        employeeCountTotal: null,
        employeeCountGho: null,
        minDurationJT: null,
        minDurationEO: null,
        chancesOfHappening: 3,
        frequency: 2,
        history: 1,
        medsImplemented: 5,
      },
    },
    'chancesOfHappening',
  ),
  'Possível',
);
assert.equal(
  inventoryOptionalCriteriaText(
    {
      isQuantity: false,
      probabilityCriteria: {
        employeeCountTotal: null,
        employeeCountGho: null,
        minDurationJT: null,
        minDurationEO: null,
        chancesOfHappening: 3,
        frequency: 2,
        history: 1,
        medsImplemented: 5,
      },
    },
    'history',
  ),
  'Sem Registro de Ocorrências',
);
assert.equal(
  inventoryOptionalCriteriaText(
    {
      isQuantity: false,
      probabilityCriteria: {
        employeeCountTotal: null,
        employeeCountGho: null,
        minDurationJT: null,
        minDurationEO: null,
        chancesOfHappening: 3,
        frequency: 2,
        history: 1,
        medsImplemented: 5,
      },
    },
    'medsImplemented',
  ),
  'Sem Medidas de Prevenção',
);
assert.equal(
  inventoryOptionalCriteriaText({ isQuantity: true, probabilityCriteria: { employeeCountTotal: 1, employeeCountGho: 1, minDurationJT: 1, minDurationEO: 1, chancesOfHappening: 1, frequency: 1, history: 1, medsImplemented: 1 } }, 'frequency'),
  '—',
);
assert.equal(inventoryOptionalCriteriaText({ isQuantity: false, probabilityCriteria: null }, 'history'), '—');

const tableSourceForScreenOnly = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'RiskInventoryTable.tsx'),
  'utf8',
);
assert.equal(tableSourceForScreenOnly.includes('INVENTORY_SCREEN_ONLY_HINT'), true);
assert.equal(tableSourceForScreenOnly.includes('inventoryOrderColumnScreenOnly'), true);
assert.equal(tableSourceForScreenOnly.includes('kind: \'optional\''), true);
assert.equal(tableSourceForScreenOnly.includes("color: 'text.disabled'"), true);
assert.equal(tableSourceForScreenOnly.includes("bgcolor: 'action.hover'"), false);
assert.equal(tableSourceForScreenOnly.includes('opacity: 0.72'), false);
assert.equal(tableSourceForScreenOnly.includes('DescriptionOutlinedIcon'), false);
assert.equal(tableSourceForScreenOnly.includes('HeaderWordMark'), false);
assert.equal(tableSourceForScreenOnly.includes('HeaderWordInactiveMark'), false);
assert.equal(tableSourceForScreenOnly.includes('HeaderCellWithWordMark'), false);
assert.equal(tableSourceForScreenOnly.includes('HEADER_WORD_MARK_SLOT_PX'), false);
assert.equal(tableSourceForScreenOnly.includes('Coluna ativa no Word'), false);
assert.equal(tableSourceForScreenOnly.includes('Coluna inativa no Word'), false);
assert.equal(tableSourceForScreenOnly.includes("verticalAlign: 'bottom'"), true);

console.log('risk-inventory.presentation.spec.ts OK');
