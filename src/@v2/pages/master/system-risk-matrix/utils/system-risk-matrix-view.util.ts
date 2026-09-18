import {
  RiskMatrixAxisEnum,
  RiskMatrixCoverageKeyEnum,
  type SystemRiskMatrixMethodologicalGap,
  type SystemRiskMatrixProjection,
} from '@v2/services/security/risk-matrix/service/risk-matrix.types';

import { hydrateEditorState } from '@v2/pages/companies/risk-matrices/utils/risk-matrix-editor-state.util';

export const SYSTEM_RISK_MATRIX_HIDDEN_ACTION_LABELS = [
  'Salvar rascunho',
  'Publicar versão',
  'Gerenciar disponibilidade',
  'Duplicar',
  'Alterar matriz',
] as const;

export function getSystemRiskMatrixToolbarState() {
  return {
    readOnly: true as const,
    canSave: false,
    canPublish: false,
    canManageAvailability: false,
    canDuplicate: false,
    canChangeMatrix: false,
    visibleWriteActionLabels: [] as string[],
  };
}

export function getUndefinedCoveragesByAxisFromGaps(
  gaps: SystemRiskMatrixMethodologicalGap[] | null | undefined,
): Record<RiskMatrixAxisEnum, RiskMatrixCoverageKeyEnum[]> {
  const next: Record<RiskMatrixAxisEnum, RiskMatrixCoverageKeyEnum[]> = {
    [RiskMatrixAxisEnum.SEVERITY]: [],
    [RiskMatrixAxisEnum.PROBABILITY]: [],
  };

  for (const gap of gaps ?? []) {
    if (
      gap.field !== 'AXIS_CRITERIA' ||
      gap.reason !== 'NO_PUBLISHED_SOURCE'
    ) {
      continue;
    }

    if (
      gap.axis === RiskMatrixAxisEnum.SEVERITY ||
      gap.axis === RiskMatrixAxisEnum.PROBABILITY
    ) {
      next[gap.axis].push(gap.coverageKey);
      continue;
    }

    next[RiskMatrixAxisEnum.SEVERITY].push(gap.coverageKey);
    next[RiskMatrixAxisEnum.PROBABILITY].push(gap.coverageKey);
  }

  return next;
}

export function getUndefinedCoveragesFromGaps(
  gaps: SystemRiskMatrixMethodologicalGap[] | null | undefined,
) {
  return [
    ...new Set(
      Object.values(getUndefinedCoveragesByAxisFromGaps(gaps)).flat(),
    ),
  ];
}

export function hydrateSystemRiskMatrixView(
  projection: SystemRiskMatrixProjection,
) {
  const undefinedCoveragesByAxis = getUndefinedCoveragesByAxisFromGaps(
    projection.methodologicalGaps,
  );

  return {
    editor: hydrateEditorState(projection.version, {
      name: projection.name,
      description: projection.description,
    }),
    gaps: projection.methodologicalGaps,
    undefinedCoveragesByAxis,
    undefinedCoverages: getUndefinedCoveragesFromGaps(
      projection.methodologicalGaps,
    ),
    source: projection.source,
    ...getSystemRiskMatrixToolbarState(),
  };
}

export function isSystemRiskMatrixCoverageUndefined(
  coverage: RiskMatrixCoverageKeyEnum,
  undefinedCoverages: RiskMatrixCoverageKeyEnum[],
) {
  return undefinedCoverages.includes(coverage);
}
