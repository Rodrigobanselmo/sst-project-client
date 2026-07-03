import { useFetch } from '@v2/hooks/api/useFetch';

import { browseExamRiskRuleAiPresets } from '../service/exam-risk-rule.service';
import type { IBrowseExamRiskRuleAiPresetsParams } from '../service/exam-risk-rule.types';
import { examRiskRuleQueryKeys } from './exam-risk-rule.query-keys';

export const useFetchExamRiskRuleAiPresets = (
  params: IBrowseExamRiskRuleAiPresetsParams = {},
  enabled = true,
) =>
  useFetch({
    queryKey: examRiskRuleQueryKeys.aiPresets(params),
    queryFn: () => browseExamRiskRuleAiPresets(params),
    enabled,
    refetchOnMount: true,
  });
