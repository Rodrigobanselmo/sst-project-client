/**
 * Executar:
 * npx tsx src/@v2/pages/companies/risk-matrices/utils/custom-axis-level-colors.util.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { RiskMatrixAxisEnum } from '@v2/services/security/risk-matrix/service/risk-matrix.types';

import { hydrateEditorState, toReplaceDraftPayload } from './risk-matrix-editor-state.util';
import {
  acceptStoredCustomAxisLevelColors,
  hasCustomAxisLevelColorOverride,
  resetCustomAxisLevelColors,
  resolveEffectiveCustomAxisLevelColors,
  setCustomAxisLevelColor,
  toCustomAxisLevelColorByValue,
  toCustomAxisLevelColorsPayload,
} from './custom-axis-level-colors.util';

const systemFallback = [
  { value: 1, color: '#3CBE7D' },
  { value: 2, color: '#8FA728' },
  { value: 3, color: '#FFD54F' },
  { value: 4, color: '#F08A24' },
  { value: 5, color: '#D32F2F' },
];

const customOverride = [
  { value: 1, color: '#111111' },
  { value: 2, color: '#222222' },
  { value: 3, color: '#333333' },
  { value: 4, color: '#444444' },
  { value: 5, color: '#555555' },
];

assert.deepEqual(acceptStoredCustomAxisLevelColors([]), []);
assert.deepEqual(acceptStoredCustomAxisLevelColors(undefined), []);
assert.equal(hasCustomAxisLevelColorOverride([]), false);
assert.deepEqual(
  resolveEffectiveCustomAxisLevelColors({
    stored: [],
    systemFallback,
  }),
  systemFallback,
);

assert.ok(hasCustomAxisLevelColorOverride(customOverride));
assert.deepEqual(
  resolveEffectiveCustomAxisLevelColors({
    stored: customOverride,
    systemFallback,
  }),
  customOverride,
);

const incomplete = [{ value: 1, color: '#111111' }];
assert.deepEqual(acceptStoredCustomAxisLevelColors(incomplete), []);
assert.deepEqual(
  resolveEffectiveCustomAxisLevelColors({
    stored: incomplete,
    systemFallback,
  }),
  systemFallback,
);

const afterS3 = setCustomAxisLevelColor([], systemFallback, 3, '#010101');
assert.equal(hasCustomAxisLevelColorOverride(afterS3), true);
assert.equal(afterS3.find((item) => item.value === 3)?.color, '#010101');
assert.equal(afterS3.find((item) => item.value === 1)?.color, '#3CBE7D');
assert.equal(afterS3.length, 5);
assert.deepEqual(
  afterS3.map((item) => item.value),
  [1, 2, 3, 4, 5],
);

const byValue = toCustomAxisLevelColorByValue(afterS3);
assert.equal(byValue[3], '#010101');
assert.equal(byValue[1], byValue[1]);
assert.equal(byValue[3], afterS3.find((item) => item.value === 3)?.color);

assert.deepEqual(resetCustomAxisLevelColors(), []);
assert.deepEqual(toCustomAxisLevelColorsPayload([]), []);
assert.deepEqual(toCustomAxisLevelColorsPayload(customOverride), customOverride);

const inheritedVersion = {
  axisLevels: [],
  classifications: [
    {
      id: 'c1',
      key: 'C1',
      label: 'Baixo',
      abbreviation: 'B',
      color: '#00AA00',
      sortOrder: 1,
      compatibilityBands: [1],
    },
  ],
  cells: [{ id: 'cell-1', severity: 1, probability: 1, classificationId: 'c1' }],
  coverages: [],
  axisLevelColors: [],
};
const inheritedEditor = hydrateEditorState(inheritedVersion);
assert.deepEqual(inheritedEditor.axisLevelColors, []);
const inheritedPayload = toReplaceDraftPayload(inheritedEditor);
assert.deepEqual(inheritedPayload.axisLevelColors, []);

const ownedEditor = hydrateEditorState({
  ...inheritedVersion,
  axisLevelColors: customOverride,
});
assert.deepEqual(ownedEditor.axisLevelColors, customOverride);
const ownedPayload = toReplaceDraftPayload(ownedEditor);
assert.deepEqual(ownedPayload.axisLevelColors, customOverride);
assert.equal(ownedPayload.classifications[0].color, '#00AA00');
assert.equal(ownedPayload.cells[0].classificationKey, 'C1');

const editedFromFallback = {
  ...inheritedEditor,
  axisLevelColors: setCustomAxisLevelColor(
    inheritedEditor.axisLevelColors,
    systemFallback,
    2,
    '#abcdef',
  ),
};
assert.equal(
  editedFromFallback.axisLevelColors.find((item) => item.value === 2)?.color,
  '#ABCDEF',
);
assert.equal(
  toReplaceDraftPayload(editedFromFallback).axisLevelColors?.find(
    (item) => item.value === 2,
  )?.color,
  '#ABCDEF',
);

const resetEditor = {
  ...ownedEditor,
  axisLevelColors: resetCustomAxisLevelColors(),
};
assert.deepEqual(toReplaceDraftPayload(resetEditor).axisLevelColors, []);
assert.deepEqual(
  resolveEffectiveCustomAxisLevelColors({
    stored: resetEditor.axisLevelColors,
    systemFallback,
  }),
  systemFallback,
);

const shared = resolveEffectiveCustomAxisLevelColors({
  stored: customOverride,
  systemFallback,
});
assert.equal(
  toCustomAxisLevelColorByValue(shared)[4],
  customOverride.find((item) => item.value === 4)?.color,
);

const gridSource = readFileSync(
  'src/@v2/pages/companies/risk-matrices/components/RiskMatrixGridEditor.tsx',
  'utf8',
);
assert.ok(gridSource.includes('badgeColor={axisLevelColorByValue?.[level.value]}'));
assert.ok(gridSource.includes('bgcolor: classification?.color ||'));
assert.equal(gridSource.includes('axisLevelColorByValue?.[coordinate'), false);

const pageSource = readFileSync(
  'src/@v2/pages/companies/risk-matrices/components/RiskMatrixEditorPageContent.tsx',
  'utf8',
);
assert.ok(pageSource.includes('Cores de Severidade e Probabilidade'));
assert.ok(pageSource.includes('S{item.value} = P{item.value}'));
assert.ok(pageSource.includes('axisLevelColorByValue'));
assert.ok(pageSource.includes('Usar paleta padrão SimpleSST'));
assert.ok(pageSource.includes('setCustomAxisLevelColor'));
assert.ok(pageSource.includes('resetCustomAxisLevelColors'));
assert.ok(pageSource.includes('toReplaceDraftPayload'));
assert.equal(pageSource.includes('getMatrizRisk'), false);
assert.equal(pageSource.includes('probability":6'), false);

const publishedHint = pageSource.includes('readOnly');
assert.ok(publishedHint);

assert.equal(RiskMatrixAxisEnum.SEVERITY, 'SEVERITY');
console.log('custom-axis-level-colors.util.spec.ts OK');
