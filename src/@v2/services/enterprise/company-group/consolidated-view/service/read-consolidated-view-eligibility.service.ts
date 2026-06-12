import { ConsolidatedViewEligibilityModel } from '@v2/models/enterprise/company-group/consolidated-view-eligibility.model';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

import { CompanyGroupRoutes } from '../../home-summary/constants/company-group.routes';

export async function readConsolidatedViewEligibility(params: {
  companyGroupId: number;
  applicationIds?: string[];
}): Promise<ConsolidatedViewEligibilityModel> {
  const response = await api.get<ConsolidatedViewEligibilityModel>(
    bindUrlParams({
      path: CompanyGroupRoutes.CONSOLIDATED_VIEW_ELIGIBILITY,
      pathParams: { companyGroupId: params.companyGroupId },
      queryParams: params.applicationIds?.length
        ? { applicationIds: params.applicationIds.join(',') }
        : undefined,
    }),
  );

  return response.data;
}
