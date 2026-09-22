/**
 * Executar:
 * npx tsx src/core/services/hooks/mutations/checklist/riskData/useMutApplyCurrentRiskMatrix/apply-current-risk-matrix.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const hookSource = readFileSync(
  'src/core/services/hooks/mutations/checklist/riskData/useMutApplyCurrentRiskMatrix/index.ts',
  'utf8',
);
const headerSource = readFileSync(
  'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/components/RiskToolHeader/RiskToolGhoHorizontal/index.tsx',
  'utf8',
);
const routesSource = readFileSync('src/core/enums/api-routes.enums.ts', 'utf8');
const rowV2 = readFileSync(
  'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/components/SideRowTable/components/RowColumns/index.tsx',
  'utf8',
);

assert.ok(routesSource.includes('RISK_DATA_APPLY_CURRENT_MATRIX'));
assert.ok(routesSource.includes('RISK_DATA_APPLY_CURRENT_MATRIX_GSE'));
assert.ok(routesSource.includes('apply-current-risk-matrix/gse'));
assert.ok(hookSource.includes('RISK_DATA_APPLY_CURRENT_MATRIX'));
assert.ok(hookSource.includes('RISK_DATA_APPLY_CURRENT_MATRIX_GSE'));
assert.ok(hookSource.includes('applyCurrentRiskMatrixToGse'));
assert.ok(hookSource.includes('useMutApplyCurrentRiskMatrixToGse'));
assert.ok(hookSource.includes('invalidateQueries'));
assert.ok(headerSource.includes('Aplicar matriz de risco'));
assert.ok(headerSource.includes('handleApplyCurrentRiskMatrix'));
assert.ok(headerSource.includes('showApplyMatrixButton'));
assert.ok(headerSource.includes('ViewsDataEnum.CHARACTERIZATION'));
assert.ok(headerSource.includes('ViewsDataEnum.GSE'));
assert.ok(headerSource.includes('este GSE'));
assert.ok(headerSource.includes('esta caracterização'));
assert.ok(headerSource.includes('Riscos herdados'));
assert.ok(headerSource.includes('window.confirm'));
assert.ok(headerSource.includes('useMutApplyCurrentRiskMatrix'));
assert.ok(headerSource.includes('useMutApplyCurrentRiskMatrixToGse'));
assert.ok(headerSource.includes('Sincronizar com o plano'));
assert.ok(!headerSource.includes('ViewsDataEnum.HIERARCHY &&'));
assert.ok(!headerSource.includes('ViewsDataEnum.EMPLOYEE'));

const afterColV2 = readFileSync(
  'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/components/SideRowTable/components/columns/ProbabilityAfterColumn/index.tsx',
  'utf8',
);
assert.ok(
  afterColV2.includes('...(data?.probability ? { probability: data.probability } : {})'),
);

assert.ok(rowV2.includes('OccupationalRiskResultPill'));
assert.ok(rowV2.includes('alignSelfStart'));

console.log('apply-current-risk-matrix.spec.ts OK');
