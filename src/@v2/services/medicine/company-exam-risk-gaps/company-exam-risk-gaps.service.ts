import { CompanyExamRiskGapsRoutes } from '@v2/constants/routes/company-exam-risk-gaps.routes';
import { api } from 'core/services/apiClient';

import type {
  IBrowseCompanyExamRiskGapsParams,
  ICompanyExamRiskGapsResponse,
} from './company-exam-risk-gaps.types';

export async function browseCompanyExamRiskGaps(
  params: IBrowseCompanyExamRiskGapsParams,
): Promise<ICompanyExamRiskGapsResponse> {
  const { companyId, ...query } = params;
  const response = await api.get<ICompanyExamRiskGapsResponse>(
    CompanyExamRiskGapsRoutes.BASE(companyId),
    { params: query },
  );
  return response.data;
}
