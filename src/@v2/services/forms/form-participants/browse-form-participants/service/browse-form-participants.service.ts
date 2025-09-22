import { FormRoutes } from '@v2/constants/routes/forms.routes';
import {
  FormParticipantsBrowseModel,
  IFormParticipantsBrowseModel,
} from '@v2/models/form/models/form-participants/form-participants-browse.model';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { BrowseFormParticipantsParams } from './browse-form-participants.types';

export async function browseFormParticipants({
  companyId,
  applicationId,
  filters,
  ...query
}: BrowseFormParticipantsParams) {
  const response = await api.get<IFormParticipantsBrowseModel>(
    bindUrlParams({
      path: FormRoutes.FORM_PARTICIPANTS.PATH,
      pathParams: { companyId, applicationId },
      queryParams: { ...query, ...filters },
    }),
  );

  return new FormParticipantsBrowseModel(response.data);
}
