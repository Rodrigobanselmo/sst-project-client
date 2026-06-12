import { ConsolidatedViewParticipantsModel } from '@v2/models/enterprise/company-group/consolidated-view-participants.model';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

import { CompanyGroupRoutes } from '../../home-summary/constants/company-group.routes';

export async function readConsolidatedViewParticipants(params: {
  companyGroupId: number;
  applicationIds?: string[];
  search?: string;
  hasResponded?: boolean;
  page?: number;
  limit?: number;
}): Promise<ConsolidatedViewParticipantsModel> {
  const response = await api.get<ConsolidatedViewParticipantsModel>(
    bindUrlParams({
      path: CompanyGroupRoutes.CONSOLIDATED_VIEW_PARTICIPANTS,
      pathParams: { companyGroupId: params.companyGroupId },
      queryParams: {
        ...(params.applicationIds?.length
          ? { applicationIds: params.applicationIds.join(',') }
          : {}),
        ...(params.search ? { search: params.search } : {}),
        ...(params.hasResponded === true ? { hasResponded: 'true' } : {}),
        ...(params.hasResponded === false ? { hasResponded: 'false' } : {}),
        ...(params.page ? { page: params.page } : {}),
        ...(params.limit ? { limit: params.limit } : {}),
      },
    }),
  );

  return response.data;
}
