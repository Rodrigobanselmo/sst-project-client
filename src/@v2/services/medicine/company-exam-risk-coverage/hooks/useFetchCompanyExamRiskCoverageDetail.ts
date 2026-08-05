import { useFetch } from '@v2/hooks/api/useFetch';

import { fetchCompanyExamRiskCoverageDetail } from '../company-exam-risk-coverage.service';
import type { IFetchCompanyExamRiskCoverageDetailParams } from '../company-exam-risk-coverage.types';
import { companyExamRiskCoverageQueryKeys } from './company-exam-risk-coverage.query-keys';

export const useFetchCompanyExamRiskCoverageDetail = (
  params: IFetchCompanyExamRiskCoverageDetailParams,
  enabled = true,
) =>
  useFetch({
    queryKey: companyExamRiskCoverageQueryKeys.detail(params),
    queryFn: () => fetchCompanyExamRiskCoverageDetail(params),
    enabled: enabled && Boolean(params.companyId) && Boolean(params.riskId),
    refetchOnMount: true,
  });
