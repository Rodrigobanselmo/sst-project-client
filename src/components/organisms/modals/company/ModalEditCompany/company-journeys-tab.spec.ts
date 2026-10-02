/**
 * npx tsx src/components/organisms/modals/company/ModalEditCompany/company-journeys-tab.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const modal = readFileSync(join(dir, 'index.tsx'), 'utf8');
const step = readFileSync(join(dir, 'components/8-journeys/index.tsx'), 'utf8');
const panel = readFileSync(
  join(
    dir,
    '../../../../../pages/dashboard/empresas/[companyId]/novo/[stage]/components/EmployeeStage/CompanyShiftsPanel.tsx',
  ),
  'utf8',
);
const presets = readFileSync(
  join(dir, '../../../../../core/constants/company-shift-presets.constant.ts'),
  'utf8',
);

assert.match(modal, /Jornadas de trabalho/);
assert.match(modal, /JourneysModalCompanyStep/);
assert.match(modal, /\{isEdit && <JourneysModalCompanyStep/);
assert.match(step, /CompanyShiftsPanel/);
assert.match(step, /title="Jornadas de trabalho"/);
assert.doesNotMatch(step, /onSubmit/);

assert.match(panel, /Usar modelo/);
assert.match(panel, /COMPANY_SHIFT_PRESETS/);
assert.match(panel, /didCompanyShiftDurationChange/);
assert.match(panel, /COMPANY_SHIFT_DURATION_CHANGE_WARNING/);
assert.match(panel, /window\.confirm/);
assert.match(panel, /!isEditing/);

assert.match(presets, /Jornada Padrão — 8 horas/);
assert.match(presets, /Jornada de 12 horas — Revezamento/);
assert.match(presets, /durationMinutes: 480/);
assert.match(presets, /durationMinutes: 360/);
assert.match(presets, /durationMinutes: 720/);

console.log('company-journeys-tab.spec: ok');
