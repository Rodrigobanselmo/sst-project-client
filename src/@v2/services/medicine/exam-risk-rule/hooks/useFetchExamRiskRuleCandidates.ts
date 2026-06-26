import { useFetch } from '@v2/hooks/api/useFetch';

import {
  searchExamRiskRuleExamCandidates,
  searchExamRiskRuleRiskCandidates,
} from '../service/exam-risk-rule.service';
import type { ExamRiskRuleCategoryEnum } from '../service/exam-risk-rule.types';
import { examRiskRuleQueryKeys } from './exam-risk-rule.query-keys';

export const useFetchExamRiskRuleRiskCandidates = (
  params: { search?: string; type?: ExamRiskRuleCategoryEnum },
  enabled = true,
) =>
  useFetch({
    queryKey: examRiskRuleQueryKeys.riskCandidates(params.search, params.type),
    queryFn: () => searchExamRiskRuleRiskCandidates(params),
    enabled,
  });

export const useFetchExamRiskRuleExamCandidates = (
  params: { search?: string },
  enabled = true,
) =>
  useFetch({
    queryKey: examRiskRuleQueryKeys.examCandidates(params.search),
    queryFn: () => searchExamRiskRuleExamCandidates(params),
    enabled,
  });
