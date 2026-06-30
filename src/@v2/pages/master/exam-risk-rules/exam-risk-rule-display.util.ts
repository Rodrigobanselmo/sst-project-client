import type { IExamRiskRule } from '@v2/services/medicine/exam-risk-rule/service/exam-risk-rule.types';
import { ExamRiskRuleScopeEnum } from '@v2/services/medicine/exam-risk-rule/service/exam-risk-rule.types';

import { examRiskRuleCategoryLabels } from './exam-risk-rule-labels';

const normalize = (value: string | null | undefined): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

/**
 * Nome exibível do fator de risco SimpleSST para a Biblioteca Risco × Exame.
 * Prioriza `riskNameSnapshot` (preenchido no sync NR-7/ACGIH) sobre o rótulo
 * normativo bruto em `agentName` (substância NR-7).
 */
export const resolveRiskFactorDisplayName = (rule: IExamRiskRule): string => {
  switch (rule.scope) {
    case ExamRiskRuleScopeEnum.RISK:
      return normalize(rule.riskNameSnapshot) ?? rule.riskFactorId ?? '—';
    case ExamRiskRuleScopeEnum.CATEGORY:
      return rule.riskCategory
        ? examRiskRuleCategoryLabels[rule.riskCategory]
        : '—';
    case ExamRiskRuleScopeEnum.GROUP:
      return (
        normalize(rule.subTypeNameSnapshot) ??
        String(rule.riskSubTypeId ?? '—')
      );
    case ExamRiskRuleScopeEnum.AGENT: {
      const fromSnapshot = normalize(rule.riskNameSnapshot);
      if (fromSnapshot) return fromSnapshot;
      return (
        normalize(rule.agentName) ?? normalize(rule.agentCas) ?? '—'
      );
    }
    default:
      return '—';
  }
};

/** Subtítulo quando o rótulo normativo (NR-7) difere do fator de risco exibido. */
export const resolveNormativeOriginLabel = (
  rule: IExamRiskRule,
): string | null => {
  if (rule.scope !== ExamRiskRuleScopeEnum.AGENT) return null;

  const normative = normalize(rule.agentName);
  if (!normative) return null;

  const display = resolveRiskFactorDisplayName(rule);
  if (display === '—') return null;

  const same =
    normative.localeCompare(display, 'pt-BR', { sensitivity: 'accent' }) === 0;
  if (same) return null;

  return `Origem normativa: ${normative}`;
};
