import { ActionOperationalGroupRoutes } from '@v2/constants/routes/action-operational-group.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

import {
  BrowseOperationalActionSuggestionsParams,
  ConfirmOperationalActionSuggestionParams,
  DismissOperationalActionSuggestionParams,
  OperationalActionSuggestion,
} from './operational-action-group.types';

export async function browseOperationalActionSuggestions(
  params: BrowseOperationalActionSuggestionsParams,
) {
  const response = await api.get<OperationalActionSuggestion[]>(
    bindUrlParams({
      path: ActionOperationalGroupRoutes.SUGGESTIONS,
      pathParams: {},
      queryParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
      },
    }),
  );

  return response.data;
}

export async function confirmOperationalActionSuggestion(
  params: ConfirmOperationalActionSuggestionParams,
) {
  const response = await api.post(ActionOperationalGroupRoutes.BASE, {
    recommendationIds: params.recommendationIds,
    label: params.label,
    companyId:
      params.scope === 'COMPANY' ? params.viewingCompanyId : undefined,
  });

  return response.data;
}

export async function dismissOperationalActionSuggestion(
  params: DismissOperationalActionSuggestionParams,
) {
  const response = await api.post(ActionOperationalGroupRoutes.DISMISS, {
    recommendationIds: params.recommendationIds,
    label: params.label,
    companyId:
      params.scope === 'COMPANY' ? params.viewingCompanyId : undefined,
  });

  return response.data;
}
