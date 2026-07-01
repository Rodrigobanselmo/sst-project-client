import { useFetch } from '@v2/hooks/api/useFetch';

import { browseExamRiskRuleCoverageGaps } from '../service/exam-risk-rule.service';
import type { IBrowseExamRiskRuleCoverageGapsParams } from '../service/exam-risk-rule-coverage-gaps.types';
import { examRiskRuleQueryKeys } from './exam-risk-rule.query-keys';

export const useFetchExamRiskRuleCoverageGaps = (
  params: IBrowseExamRiskRuleCoverageGapsParams,
  enabled = true,
) =>
  useFetch({
    queryKey: examRiskRuleQueryKeys.coverageGaps(params),
    queryFn: () => browseExamRiskRuleCoverageGaps(params),
    enabled,
    refetchOnMount: true,
  });
