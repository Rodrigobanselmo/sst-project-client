import { CompanyExamRiskCopyFromRiskRoutes } from '@v2/constants/routes/company-exam-risk-copy-from-risk.routes';
import { api } from 'core/services/apiClient';

import type {
  IExamRiskCopyFromRiskParams,
  IExamRiskCopyFromRiskResponse,
} from './company-exam-risk-copy-from-risk.types';

export async function copyExamRiskFromRisk(
  params: IExamRiskCopyFromRiskParams,
): Promise<IExamRiskCopyFromRiskResponse> {
  const { companyId, ...body } = params;
  const response = await api.post<IExamRiskCopyFromRiskResponse>(
    CompanyExamRiskCopyFromRiskRoutes.EXECUTE(companyId),
    body,
  );
  return response.data;
}
