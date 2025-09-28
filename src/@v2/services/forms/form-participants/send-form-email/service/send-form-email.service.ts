import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { SendFormEmailParams } from './send-form-email.types';

export async function sendFormEmail({
  companyId,
  applicationId,
  participantIds,
}: SendFormEmailParams) {
  const response = await api.post(
    bindUrlParams({
      path: FormRoutes.FORM_PARTICIPANTS.SEND_EMAIL,
      pathParams: { companyId, applicationId },
    }),
    { participantIds },
  );

  return response.data;
}
