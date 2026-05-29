import { FormRoutes } from '@v2/constants/routes/forms.routes';
import {
  FormParticipantsBrowseModel,
  IFormParticipantsBrowseModel,
} from '@v2/models/form/models/form-participants/form-participants-browse.model';
import { normalizeBrowseParticipantsApiPayload } from '@v2/models/form/models/form-participants/normalize-browse-participants-api';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { IObjectToQueryParamsProps } from '@v2/utils/object-to-query-params';
import { api } from 'core/services/apiClient';
import { BrowseFormParticipantsParams } from './browse-form-participants.types';

export async function browseFormParticipants({
  companyId,
  applicationId,
  filters,
  ...query
}: BrowseFormParticipantsParams) {
  const searchTerm =
    typeof filters?.search === 'string' ? filters.search.trim() : '';

  const queryParams: IObjectToQueryParamsProps = {};

  if (searchTerm) {
    queryParams.search = searchTerm;
  }

  queryParams.orderBy = query.orderBy;
  queryParams.page = query.pagination?.page;
  queryParams.limit = query.pagination?.limit;
  if (filters?.hierarchyIds?.length) {
    queryParams.hierarchyIds = filters.hierarchyIds;
  }
  if (filters?.workspaceIds?.length) {
    queryParams.workspaceIds = filters.workspaceIds;
  }
  if (filters?.hasResponded === true) {
    queryParams.hasResponded = 'true';
  } else if (filters?.hasResponded === false) {
    queryParams.hasResponded = 'false';
  }

  const response = await api.get<unknown>(
    bindUrlParams({
      path: FormRoutes.FORM_PARTICIPANTS.PATH,
      pathParams: { companyId, applicationId },
      queryParams,
    }),
  );

  const normalized = normalizeBrowseParticipantsApiPayload(response.data);

  return new FormParticipantsBrowseModel({
    results: normalized.results as IFormParticipantsBrowseModel['results'],
    pagination: normalized.pagination,
    filterSummary: normalized.filterSummary,
  });
}
