import { CompanyExamRiskLinkStatusRoutes } from '@v2/constants/routes/company-exam-risk-link-status.routes';
import { api } from 'core/services/apiClient';

import type {
  IBrowseExamRiskLinkStatusParams,
  IExamRiskLinkStatusResponse,
} from './company-exam-risk-link-status.types';

export async function browseExamRiskLinkStatus(
  params: IBrowseExamRiskLinkStatusParams,
): Promise<IExamRiskLinkStatusResponse> {
  const { companyId, ...query } = params;
  const response = await api.get<IExamRiskLinkStatusResponse>(
    CompanyExamRiskLinkStatusRoutes.BASE(companyId),
    { params: query },
  );
  return response.data;
}
