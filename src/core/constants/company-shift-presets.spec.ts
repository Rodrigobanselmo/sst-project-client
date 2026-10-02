/**
 * npx tsx src/core/constants/company-shift-presets.spec.ts
 */
import assert from 'node:assert/strict';

import {
  COMPANY_SHIFT_DURATION_CHANGE_WARNING,
  COMPANY_SHIFT_PRESETS,
} from './company-shift-presets.constant';
import {
  didCompanyShiftDurationChange,
  durationMinutesFromInput,
  findCompanyShiftPreset,
} from './company-shift-presets.util';

assert.equal(COMPANY_SHIFT_PRESETS.length, 7);

assert.deepEqual(
  COMPANY_SHIFT_PRESETS.map((p) => [p.name, p.durationMinutes]),
  [
    ['Jornada Padrão — 8 horas', 480],
    ['Jornada de 8 horas — Revezamento', 480],
    ['Jornada de 6 horas — Fixa', 360],
    ['Jornada de 6 horas — Revezamento', 360],
    ['Jornada Diurna — 12 horas', 720],
    ['Jornada Noturna — 12 horas', 720],
    ['Jornada de 12 horas — Revezamento', 720],
  ],
);

assert.match(
  COMPANY_SHIFT_PRESETS[0].description,
  /Jornada padrão de 8 horas diárias/,
);
assert.match(COMPANY_SHIFT_PRESETS[1].description, /revezamento entre turmas/);
assert.match(COMPANY_SHIFT_PRESETS[4].description, /período diurno/);
assert.match(COMPANY_SHIFT_PRESETS[5].description, /período noturno/);

assert.equal(findCompanyShiftPreset('padrao-8h')?.durationMinutes, 480);
assert.equal(findCompanyShiftPreset('missing'), undefined);

assert.equal(didCompanyShiftDurationChange(480, 480), false);
assert.equal(didCompanyShiftDurationChange(480, 360), true);
assert.equal(didCompanyShiftDurationChange(null, null), false);
assert.equal(didCompanyShiftDurationChange(undefined, null), false);
assert.equal(didCompanyShiftDurationChange(480, null), true);
assert.equal(didCompanyShiftDurationChange(null, 480), true);

assert.equal(durationMinutesFromInput(''), null);
assert.equal(durationMinutesFromInput('480'), 480);
assert.equal(durationMinutesFromInput('0'), undefined);
assert.equal(durationMinutesFromInput('12.5'), undefined);
assert.equal(durationMinutesFromInput('abc'), undefined);

assert.match(
  COMPANY_SHIFT_DURATION_CHANGE_WARNING,
  /vinculada a trabalhadores/,
);
assert.match(COMPANY_SHIFT_DURATION_CHANGE_WARNING, /nova duração/);

console.log('company-shift-presets.spec: ok');
