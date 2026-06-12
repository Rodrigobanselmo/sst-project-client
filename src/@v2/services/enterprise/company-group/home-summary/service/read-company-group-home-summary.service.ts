import { CompanyGroupHomeSummaryModel } from '@v2/models/enterprise/company-group/company-group-home-summary.model';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

import { CompanyGroupRoutes } from '../constants/company-group.routes';

export async function readCompanyGroupHomeSummary(params: {
  companyGroupId: number;
}): Promise<CompanyGroupHomeSummaryModel> {
  const response = await api.get<CompanyGroupHomeSummaryModel>(
    bindUrlParams({
      path: CompanyGroupRoutes.HOME_SUMMARY,
      pathParams: { companyGroupId: params.companyGroupId },
    }),
  );

  return response.data;
}
