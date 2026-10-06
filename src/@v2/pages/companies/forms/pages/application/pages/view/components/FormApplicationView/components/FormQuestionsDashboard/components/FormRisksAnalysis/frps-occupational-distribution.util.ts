import type { IFormQuestionsAnswersAnalysisBrowseResultModel } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';
import { pickCanonicalGroupMemberId } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/helpers/group-risk-analysis-display.utils';
import {
  resolveOccupationalRiskLevel,
  type OccupationalRiskLevel,
} from 'core/utils/helpers/occupational-risk-level.util';

import {
  FRPS_OCCUPATIONAL_FILTER_LEVELS,
  frpsOccupationalLevelLabel,
} from './frps-occupational-summary.util';

export type FrpsOccupationalDistributionBucket = {
  level: OccupationalRiskLevel;
  label: string;
  count: number;
  /** Ausente quando não há diagnósticos classificados. */
  percentage: number | null;
};

export type FrpsOccupationalDistribution = {
  total: number;
  classified: number;
  unclassified: number;
  levels: FrpsOccupationalDistributionBucket[];
};

export type FrpsOccupationalDiagnosisGroup = {
  memberEntityIds: string[];
};

export type FrpsOccupationalDiagnosisRisk = {
  riskId: string;
  severity?: number;
  groups: FrpsOccupationalDiagnosisGroup[];
  ungroupedEntityIds: string[];
};

function percentageOfClassified(count: number, classified: number): number | null {
  if (classified <= 0) return null;
  return (count / classified) * 100;
}

/**
 * Conta um diagnóstico por agrupamento e um por setor não agrupado.
 * O nível do agrupamento usa o mesmo membro canônico do card.
 */
export function aggregateFrpsOccupationalDistribution(params: {
  risks: FrpsOccupationalDiagnosisRisk[];
  analysisResults: IFormQuestionsAnswersAnalysisBrowseResultModel[];
  getEffectiveProbability: (entityId: string, riskId: string) => number;
}): FrpsOccupationalDistribution {
  const counts = new Map<OccupationalRiskLevel, number>(
    FRPS_OCCUPATIONAL_FILTER_LEVELS.map((level) => [level, 0]),
  );
  let total = 0;
  let unclassified = 0;

  const countDiagnosis = (severity: number | undefined, probability: number) => {
    total += 1;
    const level = resolveOccupationalRiskLevel(severity, probability);
    if (level == null) {
      unclassified += 1;
      return;
    }
    counts.set(level, (counts.get(level) ?? 0) + 1);
  };

  for (const risk of params.risks) {
    for (const group of risk.groups) {
      if (group.memberEntityIds.length === 0) continue;
      const canonicalMemberId = pickCanonicalGroupMemberId({
        memberEntityIds: group.memberEntityIds,
        riskId: risk.riskId,
        results: params.analysisResults,
      });
      countDiagnosis(
        risk.severity,
        params.getEffectiveProbability(canonicalMemberId, risk.riskId),
      );
    }

    for (const entityId of risk.ungroupedEntityIds) {
      countDiagnosis(
        risk.severity,
        params.getEffectiveProbability(entityId, risk.riskId),
      );
    }
  }

  const classified = total - unclassified;

  return {
    total,
    classified,
    unclassified,
    levels: FRPS_OCCUPATIONAL_FILTER_LEVELS.map((level) => {
      const count = counts.get(level) ?? 0;
      return {
        level,
        label: frpsOccupationalLevelLabel(level),
        count,
        percentage: percentageOfClassified(count, classified),
      };
    }),
  };
}
