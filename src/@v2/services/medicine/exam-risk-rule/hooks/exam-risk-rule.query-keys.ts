import type {
  IBrowseExamRiskRuleAiPresetsParams,
  IBrowseExamRiskRulesParams,
} from '../service/exam-risk-rule.types';
import type { IBrowseExamRiskRuleCoverageGapsParams } from '../service/exam-risk-rule-coverage-gaps.types';

export const examRiskRuleQueryKeys = {
  all: () => ['exam-risk-rule'],
  browse: (params?: IBrowseExamRiskRulesParams) => [
    'exam-risk-rule',
    'browse',
    params ?? {},
  ],
  coverageGaps: (params?: IBrowseExamRiskRuleCoverageGapsParams) => [
    'exam-risk-rule',
    'coverage-gaps',
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
  aiPresetsRoot: () => ['exam-risk-rule', 'ai-presets'],
  aiPresets: (params?: IBrowseExamRiskRuleAiPresetsParams) => [
    'exam-risk-rule',
    'ai-presets',
    params ?? {},
  ],
  aiPresetDetail: (id: string) => ['exam-risk-rule', 'ai-presets', id],
};
