/**
 * Runnable with:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/modals/ModalEditExamRisk/hooks/exam-risk-editor-dirty.spec.ts
 */
import assert from 'assert';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import {
  getExamRiskEditorSnapshot,
  isExamRiskEditorDirty,
} from './exam-risk-editor-dirty';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

const baselineData = {
  id: 1,
  examId: 10,
  riskId: 'risk-1',
  isPeriodic: true,
  isMale: true,
  isFemale: true,
  validityInMonths: 12,
  callback: () => null,
  error: { risk: false, exam: false },
};

const baseline = getExamRiskEditorSnapshot(baselineData, {
  validityInMonths: 12,
  isPeriodic: true,
});

run('open without edits is pristine', () => {
  assert.equal(
    isExamRiskEditorDirty(baselineData, { validityInMonths: 12 }, baseline),
    false,
  );
});

run('callback/error transients are ignored', () => {
  assert.equal(
    isExamRiskEditorDirty(
      { ...baselineData, error: { risk: true, exam: true } },
      { validityInMonths: 12 },
      baseline,
    ),
    false,
  );
});

run('minRiskDegree/grau edit is dirty', () => {
  assert.equal(
    isExamRiskEditorDirty(
      baselineData,
      { validityInMonths: 12, minRiskDegree: '4' },
      baseline,
    ),
    true,
  );
});

run('stay success snapshot is pristine', () => {
  const afterStay = getExamRiskEditorSnapshot(baselineData, {
    validityInMonths: 6,
  });
  assert.equal(
    isExamRiskEditorDirty(
      baselineData,
      { validityInMonths: 6 },
      afterStay,
    ),
    false,
  );
});

const modalSource = readFileSync(
  resolve('src/components/organisms/modals/ModalEditExamRisk/ModalEditExamRisk.tsx'),
  'utf8',
);
run('exam risk EDIT has stay/exit save buttons with shared color', () => {
  assert.equal(modalSource.includes('getSaveActionColor'), true);
  assert.equal(modalSource.includes('isEdit'), true);
  assert.equal(modalSource.includes("setSaveIntent('stay')"), true);
  assert.equal(modalSource.includes("setSaveIntent('exit')"), true);
  assert.equal(modalSource.includes('Salvar e sair'), true);
});

run('exam risk ADD keeps a single Salvar that exits', () => {
  assert.equal(
    (modalSource.match(/text: 'Salvar e sair'/g) || []).length,
    1,
  );
  assert.equal(modalSource.includes("onClick: () => setSaveIntent('exit')"), true);
});

const examesPageSource = readFileSync(
  resolve('src/pages/dashboard/empresas/[companyId]/exames/index.page.tsx'),
  'utf8',
);
const sstPageSource = readFileSync(
  resolve(
    'src/pages/dashboard/empresas/[companyId]/novo/[stage]/index.page.tsx',
  ),
  'utf8',
);
const characterizationStageSource = readFileSync(
  resolve(
    'src/pages/dashboard/empresas/[companyId]/novo/[stage]/components/CharacterizationStage/CharacterizationStage.tsx',
  ),
  'utf8',
);
const examsTableSource = readFileSync(
  resolve('src/components/organisms/tables/ExamsRiskTable/ExamsRiskTable.tsx'),
  'utf8',
);
run('real Caracterização > Exames chain mounts ModalEditExamRisk', () => {
  assert.equal(examesPageSource.includes('ModalEditExamRisk'), true);
  assert.equal(sstPageSource.includes('ModalEditExamRisk'), true);
  assert.equal(characterizationStageSource.includes('ExamsRiskTable'), true);
  assert.equal(examsTableSource.includes('ModalEnum.EXAM_RISK'), true);
});

const dataModalSource = readFileSync(
  resolve(
    'src/components/organisms/modals/ModalEditExamRiskData/ModalEditExamRiskData.tsx',
  ),
  'utf8',
);
run('hook hydrates modal data once so later stack changes do not eat dirty', () => {
  const hookSource = readFileSync(
    resolve(
      'src/components/organisms/modals/ModalEditExamRisk/hooks/useEditExams.ts',
    ),
    'utf8',
  );
  assert.equal(hookSource.includes('hydratedExamKeyRef'), true);
  assert.equal(hookSource.includes("saveIntentRef.current === 'stay'"), true);
  assert.equal(hookSource.includes('onClose();'), true);
});

run('risk-tool exam data modal remains close-on-save', () => {
  assert.equal(dataModalSource.includes('Salvar e sair'), false);
  assert.equal(dataModalSource.includes('getSaveActionColor'), false);
});

console.log('\nAll exam-risk-editor-dirty tests passed.');
