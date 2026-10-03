/**
 * Pontual: preset Política SSMA (somente client).
 *
 *   npx tsx src/components/organisms/modals/company/ModalEditCompany/company-hse-policy-preset.spec.ts
 */
import assert from 'node:assert/strict';

import {
  HSE_POLICY_PRESET_OVERWRITE_MESSAGE,
  SIMPLESST_HSE_POLICY_PRESET,
  resolveHsePolicyPresetApplication,
} from './company-hse-policy-preset';
import { resolveSingleFieldPresetApplication } from './company-text-preset';

assert.equal(
  resolveHsePolicyPresetApplication({
    current: '',
    confirmedOverwrite: false,
  }),
  SIMPLESST_HSE_POLICY_PRESET,
);

assert.equal(
  resolveHsePolicyPresetApplication({
    current: '  ',
    confirmedOverwrite: false,
  }),
  SIMPLESST_HSE_POLICY_PRESET,
);

assert.equal(
  resolveHsePolicyPresetApplication({
    current: 'política própria',
    confirmedOverwrite: false,
  }),
  'needs-confirmation',
);

assert.equal(
  resolveHsePolicyPresetApplication({
    current: 'política própria',
    confirmedOverwrite: true,
  }),
  SIMPLESST_HSE_POLICY_PRESET,
);

assert.equal(
  resolveSingleFieldPresetApplication({
    current: 'x',
    preset: 'y',
    confirmedOverwrite: false,
  }),
  'needs-confirmation',
);

assert.match(HSE_POLICY_PRESET_OVERWRITE_MESSAGE, /substituí-lo/);
assert.match(HSE_POLICY_PRESET_OVERWRITE_MESSAGE, /Salvar/);
assert.doesNotMatch(HSE_POLICY_PRESET_OVERWRITE_MESSAGE, /Missão/);
assert.equal(
  SIMPLESST_HSE_POLICY_PRESET.startsWith('Promover ambientes de trabalho seguros'),
  true,
);
assert.doesNotMatch(SIMPLESST_HSE_POLICY_PRESET, /ALTUS|DETEN|MOEVE/i);

console.log('company-hse-policy-preset.spec.ts: ok');
