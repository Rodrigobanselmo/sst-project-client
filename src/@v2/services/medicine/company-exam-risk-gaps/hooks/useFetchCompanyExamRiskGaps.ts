import { useFetch } from '@v2/hooks/api/useFetch';

import { browseCompanyExamRiskGaps } from '../company-exam-risk-gaps.service';
import type { IBrowseCompanyExamRiskGapsParams } from '../company-exam-risk-gaps.types';
import { companyExamRiskGapsQueryKeys } from './company-exam-risk-gaps.query-keys';

export const useFetchCompanyExamRiskGaps = (
  params: IBrowseCompanyExamRiskGapsParams,
  enabled = true,
) =>
  useFetch({
    queryKey: companyExamRiskGapsQueryKeys.browse(params),
    queryFn: () => browseCompanyExamRiskGaps(params),
    enabled: enabled && Boolean(params.companyId),
    refetchOnMount: true,
  });
