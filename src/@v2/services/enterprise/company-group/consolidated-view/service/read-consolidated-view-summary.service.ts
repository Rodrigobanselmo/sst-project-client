import { ConsolidatedViewSummaryModel } from '@v2/models/enterprise/company-group/consolidated-view-summary.model';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

import { CompanyGroupRoutes } from '../../home-summary/constants/company-group.routes';

export async function readConsolidatedViewSummary(params: {
  companyGroupId: number;
  applicationIds?: string[];
}): Promise<ConsolidatedViewSummaryModel> {
  const response = await api.get<ConsolidatedViewSummaryModel>(
    bindUrlParams({
      path: CompanyGroupRoutes.CONSOLIDATED_VIEW_SUMMARY,
      pathParams: { companyGroupId: params.companyGroupId },
      queryParams: params.applicationIds?.length
        ? { applicationIds: params.applicationIds.join(',') }
        : undefined,
    }),
  );

  return response.data;
}
