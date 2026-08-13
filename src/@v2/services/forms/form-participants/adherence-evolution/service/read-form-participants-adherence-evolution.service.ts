import { FormRoutes } from '@v2/constants/routes/forms.routes';
import {
  IFormParticipantsAdherenceEvolutionModel,
  normalizeAdherenceEvolutionPayload,
} from '@v2/models/form/models/form-participants/form-participants-adherence-evolution.model';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { IObjectToQueryParamsProps } from '@v2/utils/object-to-query-params';
import { api } from 'core/services/apiClient';
import { ReadFormParticipantsAdherenceEvolutionParams } from './read-form-participants-adherence-evolution.types';

export async function readFormParticipantsAdherenceEvolution({
  companyId,
  applicationId,
  filters,
}: ReadFormParticipantsAdherenceEvolutionParams): Promise<IFormParticipantsAdherenceEvolutionModel> {
  const searchTerm =
    typeof filters?.search === 'string' ? filters.search.trim() : '';

  const queryParams: IObjectToQueryParamsProps = {};

  if (searchTerm) {
    queryParams.search = searchTerm;
  }
  if (filters?.hierarchyIds?.length) {
    queryParams.hierarchyIds = filters.hierarchyIds;
  }
  if (filters?.workspaceIds?.length) {
    queryParams.workspaceIds = filters.workspaceIds;
  }

  const response = await api.get<unknown>(
    bindUrlParams({
      path: FormRoutes.FORM_PARTICIPANTS.ADHERENCE_EVOLUTION,
      pathParams: { companyId, applicationId },
      queryParams,
    }),
  );

  return normalizeAdherenceEvolutionPayload(response.data);
}
