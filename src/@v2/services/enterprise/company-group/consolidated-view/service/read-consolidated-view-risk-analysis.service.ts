import { ConsolidatedViewRiskAnalysisModel } from '@v2/models/enterprise/company-group/consolidated-view-risk-analysis.model';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

import { CompanyGroupRoutes } from '../../home-summary/constants/company-group.routes';

export async function readConsolidatedViewRiskAnalysis(params: {
  companyGroupId: number;
  applicationIds?: string[];
}): Promise<ConsolidatedViewRiskAnalysisModel> {
  const response = await api.get<ConsolidatedViewRiskAnalysisModel>(
    bindUrlParams({
      path: CompanyGroupRoutes.CONSOLIDATED_VIEW_RISK_ANALYSIS,
      pathParams: { companyGroupId: params.companyGroupId },
      queryParams: {
        ...(params.applicationIds?.length
          ? { applicationIds: params.applicationIds.join(',') }
          : {}),
      },
    }),
  );

  return response.data;
}
