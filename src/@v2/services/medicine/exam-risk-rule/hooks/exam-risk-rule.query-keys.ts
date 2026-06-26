import type { IBrowseExamRiskRulesParams } from '../service/exam-risk-rule.types';

export const examRiskRuleQueryKeys = {
  all: () => ['exam-risk-rule'],
  browse: (params?: IBrowseExamRiskRulesParams) => [
    'exam-risk-rule',
    'browse',
    params ?? {},
  ],
  detail: (id: string) => ['exam-risk-rule', 'detail', id],
  riskCandidates: (search?: string, type?: string) => [
    'exam-risk-rule',
    'risk-candidates',
    search ?? '',
    type ?? '',
  ],
  examCandidates: (search?: string) => [
    'exam-risk-rule',
    'exam-candidates',
    search ?? '',
  ],
};
