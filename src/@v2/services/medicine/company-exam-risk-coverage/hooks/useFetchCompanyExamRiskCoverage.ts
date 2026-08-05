import { useFetch } from '@v2/hooks/api/useFetch';

import { browseCompanyExamRiskCoverage } from '../company-exam-risk-coverage.service';
import type { IBrowseCompanyExamRiskCoverageParams } from '../company-exam-risk-coverage.types';
import { companyExamRiskCoverageQueryKeys } from './company-exam-risk-coverage.query-keys';

export const useFetchCompanyExamRiskCoverage = (
  params: IBrowseCompanyExamRiskCoverageParams,
  enabled = true,
) =>
  useFetch({
    queryKey: companyExamRiskCoverageQueryKeys.browse(params),
    queryFn: () => browseCompanyExamRiskCoverage(params),
    enabled: enabled && Boolean(params.companyId),
    refetchOnMount: true,
  });
