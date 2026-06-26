import { useFetch } from '@v2/hooks/api/useFetch';

import { browseExamRiskRules } from '../service/exam-risk-rule.service';
import type { IBrowseExamRiskRulesParams } from '../service/exam-risk-rule.types';
import { examRiskRuleQueryKeys } from './exam-risk-rule.query-keys';

export const useFetchBrowseExamRiskRules = (
  params: IBrowseExamRiskRulesParams,
  enabled = true,
) =>
  useFetch({
    queryKey: examRiskRuleQueryKeys.browse(params),
    queryFn: () => browseExamRiskRules(params),
    enabled,
    refetchOnMount: true,
  });
