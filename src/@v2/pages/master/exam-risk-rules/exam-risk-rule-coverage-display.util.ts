import {
  ExamRiskRuleCoverageStatusEnum,
  IExamRiskRuleCoverageGapItem,
} from '@v2/services/medicine/exam-risk-rule/service/exam-risk-rule-coverage-gaps.types';
import { ExamRiskRuleScopeEnum } from '@v2/services/medicine/exam-risk-rule/service/exam-risk-rule.types';

export type ExamRiskRuleCoverageDisplayTier =
  | 'DIRECT'
  | 'GENERIC_GROUP'
  | 'GENERIC_CATEGORY'
  | 'INDIRECT'
  | 'UNCOVERED';

export type ExamRiskRuleCoverageDisplayMeta = {
  label: string;
  tier: ExamRiskRuleCoverageDisplayTier;
  chipColor: 'success' | 'info' | 'warning' | 'error' | 'default';
};

const SCOPE_PRIORITY: Record<ExamRiskRuleScopeEnum, number> = {
  [ExamRiskRuleScopeEnum.RISK]: 4,
  [ExamRiskRuleScopeEnum.AGENT]: 3,
  [ExamRiskRuleScopeEnum.GROUP]: 2,
  [ExamRiskRuleScopeEnum.CATEGORY]: 1,
};

const resolveStrongestScope = (
  scopes: ExamRiskRuleScopeEnum[],
): ExamRiskRuleScopeEnum | null => {
  if (!scopes.length) return null;
  return scopes.reduce((best, scope) =>
    SCOPE_PRIORITY[scope] > SCOPE_PRIORITY[best] ? scope : best,
  );
};

export const resolveExamRiskRuleCoverageDisplay = (
  item: IExamRiskRuleCoverageGapItem,
): ExamRiskRuleCoverageDisplayMeta => {
  if (item.coverageStatus === ExamRiskRuleCoverageStatusEnum.UNCOVERED) {
    return {
      label: 'Sem exame padrão',
      tier: 'UNCOVERED',
      chipColor: 'error',
    };
  }

  if (
    item.coverageStatus === ExamRiskRuleCoverageStatusEnum.INDIRECT_BIOLOGICAL_ONLY
  ) {
    return {
      label: 'Cobertura indireta por indicador',
      tier: 'INDIRECT',
      chipColor: 'warning',
    };
  }

  const strongestScope = resolveStrongestScope(item.matchedRuleScopes);

  if (
    strongestScope === ExamRiskRuleScopeEnum.RISK ||
    strongestScope === ExamRiskRuleScopeEnum.AGENT
  ) {
    return {
      label: 'Coberto por regra direta',
      tier: 'DIRECT',
      chipColor: 'success',
    };
  }

  if (strongestScope === ExamRiskRuleScopeEnum.GROUP) {
    return {
      label: 'Coberto por grupo',
      tier: 'GENERIC_GROUP',
      chipColor: 'info',
    };
  }

  if (strongestScope === ExamRiskRuleScopeEnum.CATEGORY) {
    return {
      label: 'Coberto por categoria',
      tier: 'GENERIC_CATEGORY',
      chipColor: 'default',
    };
  }

  return {
    label: 'Coberto por regra',
    tier: 'DIRECT',
    chipColor: 'success',
  };
};

export const formatCoverageReasons = (reasons: string[]): string =>
  reasons.length ? reasons.join(' · ') : '—';

export const formatSubTypes = (
  subTypes: IExamRiskRuleCoverageGapItem['subTypes'],
): string =>
  subTypes.length ? subTypes.map((subType) => subType.name).join(', ') : '—';

export const formatBiologicalIndicators = (
  indicators: IExamRiskRuleCoverageGapItem['confirmedBiologicalIndicators'],
): string => {
  if (!indicators.length) return '—';
  return indicators
    .map((indicator) => {
      const exams = indicator.confirmedExamNames.length
        ? ` (${indicator.confirmedExamNames.join(', ')})`
        : '';
      return `${indicator.substanceName}${exams}`;
    })
    .join(' · ');
};
