import { useFetch } from '@v2/hooks/api/useFetch';

import { browseExamRiskRuleRiskToExamAiPresets } from '../service/exam-risk-rule.service';
import type { IBrowseExamRiskRuleRiskToExamAiPresetsParams } from '../service/exam-risk-rule.types';
import { examRiskRuleQueryKeys } from './exam-risk-rule.query-keys';

export const useFetchExamRiskRuleRiskToExamAiPresets = (
  params: IBrowseExamRiskRuleRiskToExamAiPresetsParams = {},
  enabled = true,
) =>
  useFetch({
    queryKey: examRiskRuleQueryKeys.riskToExamAiPresets(params),
    queryFn: () => browseExamRiskRuleRiskToExamAiPresets(params),
    enabled,
    refetchOnMount: true,
  });
