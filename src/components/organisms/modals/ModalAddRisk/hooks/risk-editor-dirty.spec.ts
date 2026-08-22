/**
 * Runnable with:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/modals/ModalAddRisk/hooks/risk-editor-dirty.spec.ts
 */
import assert from 'assert';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import {
  getRiskEditorSnapshot,
  isRiskEditorDirty,
} from './risk-editor-dirty';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

const baseline = {
  id: 'risk-1',
  name: 'Ruído',
  type: 'FIS',
  hasSubmit: false,
  severity: 3,
};

run('open without edits is pristine', () => {
  assert.equal(
    isRiskEditorDirty(
      getRiskEditorSnapshot(baseline, { name: 'Ruído', type: 'FIS' }),
      getRiskEditorSnapshot(baseline, { name: 'Ruído', type: 'FIS' }),
    ),
    false,
  );
});

run('severity string vs number is pristine', () => {
  assert.equal(
    isRiskEditorDirty(
      getRiskEditorSnapshot(baseline, {
        name: 'Ruído',
        type: 'FIS',
        severity: '3',
      }),
      getRiskEditorSnapshot(baseline, {
        name: 'Ruído',
        type: 'FIS',
        severity: 3,
      }),
    ),
    false,
  );
});

run('undefined form fields do not wipe loaded data', () => {
  assert.equal(
    isRiskEditorDirty(
      getRiskEditorSnapshot(baseline, {}),
      getRiskEditorSnapshot(baseline, { name: undefined }),
    ),
    false,
  );
});

run('hasSubmit is ignored', () => {
  assert.equal(
    isRiskEditorDirty(
      getRiskEditorSnapshot({ ...baseline, hasSubmit: true }, { name: 'Ruído' }),
      getRiskEditorSnapshot({ ...baseline, hasSubmit: false }, { name: 'Ruído' }),
    ),
    false,
  );
});

run('persistent field edit is dirty', () => {
  assert.equal(
    isRiskEditorDirty(
      getRiskEditorSnapshot(baseline, { name: 'Calor', type: 'FIS' }),
      getRiskEditorSnapshot(baseline, { name: 'Ruído', type: 'FIS' }),
    ),
    true,
  );
});

run('markFormPristine snapshot returns to primary-equivalent pristine', () => {
  const afterStay = getRiskEditorSnapshot(
    { ...baseline, hasSubmit: false },
    { name: 'Calor', type: 'FIS' },
  );
  assert.equal(isRiskEditorDirty(afterStay, afterStay), false);
});

run('failed save keeps dirty when form still differs from baseline', () => {
  assert.equal(
    isRiskEditorDirty(
      getRiskEditorSnapshot(baseline, { name: 'Calor', type: 'FIS' }),
      getRiskEditorSnapshot(baseline, { name: 'Ruído', type: 'FIS' }),
    ),
    true,
  );
});

const pageSource = readFileSync(
  resolve(
    'src/pages/dashboard/empresas/[companyId]/fatores-riscos/[riskId]/edit/index.page.tsx',
  ),
  'utf8',
);
const modalSource = readFileSync(
  resolve('src/components/organisms/modals/ModalAddRisk/index.tsx'),
  'utf8',
);

run('risk page uses shared color helper', () => {
  assert.equal(pageSource.includes('getSaveActionColor'), true);
  assert.equal(pageSource.includes('saveActionColor'), true);
  assert.equal(pageSource.includes('saveDisabled'), true);
});

run('traditional risk modal does not use dirty save color', () => {
  assert.equal(modalSource.includes('getSaveActionColor'), false);
  assert.equal(modalSource.includes('saveActionColor'), false);
  assert.equal(modalSource.includes("text: riskData?.id ? 'Salvar' : 'Criar'"), true);
});

const hookSource = readFileSync(
  resolve('src/components/organisms/modals/ModalAddRisk/hooks/useAddRisk.ts'),
  'utf8',
);
run('after hydration the baseline is not rebased on every form change', () => {
  assert.equal(hookSource.includes('isHydratingRef'), true);
  assert.equal(
    hookSource.includes('if (!isHydratingRef.current) return;'),
    true,
  );
  assert.equal(hookSource.includes('hasHydratedBaselineRef'), false);
  assert.equal(
    hookSource.includes('hasHydratedBaselineRef.current && isDirtyRef.current'),
    false,
  );
});

run('risk page close uses preventDiscardIf and stay uses markFormPristine', () => {
  assert.equal(hookSource.includes('preventDiscardIf'), true);
  assert.equal(hookSource.includes('markFormPristine'), true);
  assert.equal(hookSource.includes('isRiskEditorDirty'), true);
});

console.log('\nAll risk-editor-dirty tests passed.');
