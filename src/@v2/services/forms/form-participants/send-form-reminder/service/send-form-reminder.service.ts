import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import {
  SendFormReminderParams,
  SendFormReminderResult,
} from './send-form-reminder.types';

export async function sendFormReminder({
  companyId,
  applicationId,
}: SendFormReminderParams): Promise<SendFormReminderResult> {
  const response = await api.post<SendFormReminderResult>(
    bindUrlParams({
      path: FormRoutes.FORM_PARTICIPANTS.SEND_REMINDER,
      pathParams: { companyId, applicationId },
    }),
  );

  return response.data;
}
