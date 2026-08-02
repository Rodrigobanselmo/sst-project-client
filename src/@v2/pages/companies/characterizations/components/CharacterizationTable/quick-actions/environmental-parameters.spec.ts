/**
 * Contrato Fase 2E — Parâmetros Ambientais (coluna + elegibilidade).
 *
 * Executar:
 * npx tsx src/@v2/pages/companies/characterizations/components/CharacterizationTable/quick-actions/environmental-parameters.spec.ts
 */
import assert from 'node:assert/strict';

import {
  countEnvironmentalParametersFilled,
  ENVIRONMENTAL_PARAMETERS,
  formatEnvironmentalParametersCompact,
  formatEnvironmentalParametersTooltip,
  isEnvironmentalParameterFilled,
  resolveEnvironmentalFillStatus,
} from './environmental-parameters.util';

assert.equal(ENVIRONMENTAL_PARAMETERS.length, 4);
assert.deepEqual(
  ENVIRONMENTAL_PARAMETERS.map((p) => p.key),
  ['temperature', 'moisturePercentage', 'noiseValue', 'luminosity'],
);

assert.equal(isEnvironmentalParameterFilled('24'), true);
assert.equal(isEnvironmentalParameterFilled('0'), true);
assert.equal(isEnvironmentalParameterFilled(''), false);

const sample = {
  temperature: '24',
  moisturePercentage: '58',
  noiseValue: '',
  luminosity: '650',
};

assert.deepEqual(countEnvironmentalParametersFilled(sample), {
  filled: 3,
  total: 4,
});
assert.equal(resolveEnvironmentalFillStatus(0, 4), 'empty');
assert.equal(resolveEnvironmentalFillStatus(2, 4), 'partial');
assert.equal(resolveEnvironmentalFillStatus(4, 4), 'complete');

assert.equal(
  formatEnvironmentalParametersCompact(sample),
  'T 24° · U 58% · L 650lx',
);
assert.equal(formatEnvironmentalParametersCompact({}), '');

const tip = formatEnvironmentalParametersTooltip(sample);
assert.ok(tip.includes('Temperatura:'));
assert.ok(tip.includes('24 °C'));
assert.ok(tip.includes('Ruído:'));
assert.ok(tip.includes('Não informado'));

/** Extensível: total do catálogo controla o denominador do badge. */
assert.equal(ENVIRONMENTAL_PARAMETERS.length >= 4, true);

console.log('environmental-parameters.spec.ts OK');
