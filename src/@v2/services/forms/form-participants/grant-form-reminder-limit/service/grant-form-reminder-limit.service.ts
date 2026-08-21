import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import {
  GrantFormReminderLimitParams,
  GrantFormReminderLimitResult,
} from './grant-form-reminder-limit.types';

export async function grantFormReminderLimit({
  companyId,
  applicationId,
  quantity,
  reason,
}: GrantFormReminderLimitParams): Promise<GrantFormReminderLimitResult> {
  const response = await api.post<GrantFormReminderLimitResult>(
    bindUrlParams({
      path: FormRoutes.FORM_PARTICIPANTS.GRANT_REMINDER_LIMIT,
      pathParams: { companyId, applicationId },
    }),
    { quantity, reason },
  );

  return response.data;
}
