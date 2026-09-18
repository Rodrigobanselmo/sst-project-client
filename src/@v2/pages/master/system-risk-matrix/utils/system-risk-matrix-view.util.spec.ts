/**
 * Executar:
 * npx tsx src/@v2/pages/master/system-risk-matrix/utils/system-risk-matrix-view.util.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { RoutesEnum } from 'core/enums/routes.enums';
import { RoleEnum } from 'project/enum/roles.enums';

import { RiskMatrixRoutes } from '@v2/constants/routes/risk-matrix.routes';
import { RISK_MATRIX_COVERAGE_LABELS } from '@v2/pages/companies/risk-matrices/maps/risk-matrix.maps';
import { RISK_MATRIX_SUGGESTED_COLORS } from '@v2/pages/companies/risk-matrices/utils/risk-matrix-hex.util';
import {
  CompanyRiskMatrixVersionStatusEnum,
  RiskMatrixAxisEnum,
  RiskMatrixCoverageKeyEnum,
  RiskMatrixGridOrientationEnum,
  RiskMatrixSourceEnum,
  RiskMatrixYAxisDirectionEnum,
  type SystemRiskMatrixProjection,
} from '@v2/services/security/risk-matrix/service/risk-matrix.types';
import { riskMatrixQueryKeys } from '@v2/services/security/risk-matrix/hooks/risk-matrix.query-keys';

import {
  SYSTEM_RISK_MATRIX_HIDDEN_ACTION_LABELS,
  getSystemRiskMatrixToolbarState,
  hydrateSystemRiskMatrixView,
} from './system-risk-matrix-view.util';

const projection: SystemRiskMatrixProjection = {
  source: RiskMatrixSourceEnum.SYSTEM,
  name: 'Padrão SimpleSST',
  description: 'Metodologia nativa 5×5 do SimpleSST.',
  readOnly: true,
  coverages: [
    RiskMatrixCoverageKeyEnum.FIS,
    RiskMatrixCoverageKeyEnum.QUI,
    RiskMatrixCoverageKeyEnum.BIO,
    RiskMatrixCoverageKeyEnum.ACI,
    RiskMatrixCoverageKeyEnum.ERG,
    RiskMatrixCoverageKeyEnum.PSICOSOCIAL,
  ],
  methodologicalGaps: [],
  version: {
    id: 'system-risk-matrix-version',
    matrixId: 'system-risk-matrix',
    companyId: null,
    versionNumber: 1,
    status: CompanyRiskMatrixVersionStatusEnum.PUBLISHED,
    nameSnapshot: 'Padrão SimpleSST',
    publishedAt: null,
    gridOrientation: RiskMatrixGridOrientationEnum.SEVERITY_ON_X,
    yAxisDirection: RiskMatrixYAxisDirectionEnum.DESCENDING_TOP_TO_BOTTOM,
    coverages: [
      RiskMatrixCoverageKeyEnum.FIS,
      RiskMatrixCoverageKeyEnum.QUI,
      RiskMatrixCoverageKeyEnum.BIO,
      RiskMatrixCoverageKeyEnum.ACI,
      RiskMatrixCoverageKeyEnum.ERG,
      RiskMatrixCoverageKeyEnum.PSICOSOCIAL,
    ],
    axisLevels: [
      {
        id: 's1',
        axis: RiskMatrixAxisEnum.SEVERITY,
        value: 1,
        label: 'Desprezível',
        criteriaByCoverage: [
          { coverageKey: RiskMatrixCoverageKeyEnum.FIS, criterion: 'FIS S1' },
          {
            coverageKey: RiskMatrixCoverageKeyEnum.PSICOSOCIAL,
            criterion: 'Potencial de dano clínico irrelevante sem repercussão funcional',
          },
        ],
      },
      {
        id: 'p1',
        axis: RiskMatrixAxisEnum.PROBABILITY,
        value: 1,
        label: 'Desprezível (Improvável)',
        criteriaByCoverage: [
          { coverageKey: RiskMatrixCoverageKeyEnum.FIS, criterion: 'FIS P1' },
          {
            coverageKey: RiskMatrixCoverageKeyEnum.PSICOSOCIAL,
            criterion:
              'O fator de risco é quase inexistente ou presente em intensidade muito baixa, sem impacto observável',
          },
        ],
      },
    ],
    classifications: [
      {
        id: 'system-classification-1',
        key: 'C1',
        label: 'Muito baixo',
        color: '#3CBE7D',
        sortOrder: 1,
        compatibilityBands: [1],
      },
      {
        id: 'system-classification-2',
        key: 'C2',
        label: 'Baixo',
        color: '#8FA728',
        sortOrder: 2,
        compatibilityBands: [2],
      },
    ],
    cells: [
      {
        id: 'system-cell-s1-p1',
        severity: 1,
        probability: 1,
        classificationId: 'system-classification-1',
      },
    ],
  },
};

const view = hydrateSystemRiskMatrixView(projection);
const toolbar = getSystemRiskMatrixToolbarState();

assert.equal(view.readOnly, true);
assert.equal(view.canSave, true);
assert.equal(view.canPublish, false);
assert.equal(view.canManageAvailability, false);
assert.equal(view.canDuplicate, false);
assert.equal(view.canChangeMatrix, false);
assert.deepEqual(view.visibleWriteActionLabels, ['Salvar']);
assert.deepEqual([...SYSTEM_RISK_MATRIX_HIDDEN_ACTION_LABELS], [
  'Salvar rascunho',
  'Publicar versão',
  'Gerenciar disponibilidade',
  'Duplicar',
  'Alterar matriz',
]);
assert.equal(toolbar.visibleWriteActionLabels.length, 1);
assert.deepEqual(toolbar.visibleWriteActionLabels, ['Salvar']);

assert.equal(view.editor.name, 'Padrão SimpleSST');
assert.equal(
  view.editor.gridOrientation,
  RiskMatrixGridOrientationEnum.SEVERITY_ON_X,
);
assert.equal(
  view.editor.yAxisDirection,
  RiskMatrixYAxisDirectionEnum.DESCENDING_TOP_TO_BOTTOM,
);
assert.deepEqual(view.undefinedCoverages, []);
assert.deepEqual(view.undefinedCoveragesByAxis[RiskMatrixAxisEnum.PROBABILITY], []);
assert.deepEqual(view.undefinedCoveragesByAxis[RiskMatrixAxisEnum.SEVERITY], []);
assert.equal(
  view.editor.axisLevels.find(
    (level) =>
      level.axis === RiskMatrixAxisEnum.SEVERITY && level.value === 1,
  )?.criteriaByCoverage[RiskMatrixCoverageKeyEnum.PSICOSOCIAL],
  'Potencial de dano clínico irrelevante sem repercussão funcional',
);
assert.equal(
  view.editor.axisLevels.find(
    (level) =>
      level.axis === RiskMatrixAxisEnum.PROBABILITY && level.value === 1,
  )?.criteriaByCoverage[RiskMatrixCoverageKeyEnum.PSICOSOCIAL],
  'O fator de risco é quase inexistente ou presente em intensidade muito baixa, sem impacto observável',
);
assert.equal(
  view.editor.axisLevels.find(
    (level) =>
      level.axis === RiskMatrixAxisEnum.PROBABILITY && level.value === 1,
  )?.label,
  'Desprezível (Improvável)',
);
assert.equal(view.editor.cells[0].classificationKey, 'C1');
assert.ok(!view.editor.classifications.some((item) => item.sortOrder === 6));
assert.ok(
  !RISK_MATRIX_SUGGESTED_COLORS.includes(
    view.editor.classifications[0].color as (typeof RISK_MATRIX_SUGGESTED_COLORS)[number],
  ),
);

assert.equal(
  RoutesEnum.DATABASE_SYSTEM_RISK_MATRIX,
  '/dashboard/dados/matriz-padrao-simplesst',
);
assert.equal(RiskMatrixRoutes.SYSTEM, 'v2/master/system-risk-matrix');
assert.deepEqual(riskMatrixQueryKeys.system(), ['risk-matrices', 'system']);
assert.equal(RoleEnum.MASTER, 'master');

const pageSource = readFileSync(
  'src/@v2/pages/master/system-risk-matrix/SystemRiskMatrixPage.tsx',
  'utf8',
);
for (const label of SYSTEM_RISK_MATRIX_HIDDEN_ACTION_LABELS) {
  assert.equal(
    pageSource.includes(label),
    false,
    `SYSTEM page must not expose "${label}"`,
  );
}
assert.equal(pageSource.includes('RiskMatrixWorkspaceAvailabilityDialog'), false);
assert.equal(pageSource.includes('useMutateReplaceRiskMatrixDraft'), false);
assert.equal(pageSource.includes('useMutatePublishRiskMatrixVersion'), false);
assert.equal(pageSource.includes('permanece como lacuna'), false);
assert.equal(pageSource.includes('Não há critério de probabilidade psicossocial'), false);
assert.equal(pageSource.includes('FIS/QUI — Físicos e Químicos'), false);
assert.ok(pageSource.includes('CriterionHierarchyView'));
assert.ok(pageSource.includes('SAccordion'));
assert.ok(pageSource.includes('defaultExpanded={false}'));
assert.ok(pageSource.includes('Edição editorial'));
assert.ok(/Salvar\n\s*<\/Button>/.test(pageSource));
assert.equal(pageSource.includes('expanded={'), false);
assert.equal(pageSource.includes('groupCoverageCriteriaForDisplay'), false);
assert.equal(pageSource.includes('Salvar rascunho'), false);
assert.equal(pageSource.includes('system-presentation'), false);

const gridSource = readFileSync(
  'src/@v2/pages/companies/risk-matrices/components/RiskMatrixGridEditor.tsx',
  'utf8',
);
assert.ok(gridSource.includes('groupCoverageCriteriaForDisplay'));
assert.ok(gridSource.includes('CriterionHierarchyView'));
assert.ok(gridSource.includes("badgeColor || 'grey.200'"));
assert.ok(gridSource.includes('axisLevelColorByValue?:'));
assert.equal(gridSource.includes('FIS/QUI — Físicos e Químicos'), false);
assert.equal(RiskMatrixCoverageKeyEnum.PSICOSOCIAL, 'PSICOSOCIAL');
assert.equal(
  RISK_MATRIX_COVERAGE_LABELS[RiskMatrixCoverageKeyEnum.PSICOSOCIAL],
  'PSIC',
);

console.log('system-risk-matrix-view.util.spec.ts OK');
