import { CompanyExamRiskCoverageRoutes } from '@v2/constants/routes/company-exam-risk-coverage.routes';
import { api } from 'core/services/apiClient';

import type {
  IBrowseCompanyExamRiskCoverageParams,
  ICompanyExamRiskCoverageItem,
  ICompanyExamRiskCoverageResponse,
  IFetchCompanyExamRiskCoverageDetailParams,
} from './company-exam-risk-coverage.types';

export async function browseCompanyExamRiskCoverage(
  params: IBrowseCompanyExamRiskCoverageParams,
): Promise<ICompanyExamRiskCoverageResponse> {
  const { companyId, ...query } = params;
  const response = await api.get<ICompanyExamRiskCoverageResponse>(
    CompanyExamRiskCoverageRoutes.BASE(companyId),
    { params: query },
  );
  return response.data;
}

export async function fetchCompanyExamRiskCoverageDetail(
  params: IFetchCompanyExamRiskCoverageDetailParams,
): Promise<ICompanyExamRiskCoverageItem> {
  const { companyId, riskId, ...query } = params;
  const response = await api.get<ICompanyExamRiskCoverageItem>(
    CompanyExamRiskCoverageRoutes.DETAIL(companyId, riskId),
    { params: query },
  );
  return response.data;
}
