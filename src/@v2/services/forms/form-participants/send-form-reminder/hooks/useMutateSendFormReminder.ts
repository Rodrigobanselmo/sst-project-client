import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { sendFormReminder } from '../service/send-form-reminder.service';
import { SendFormReminderResult } from '../service/send-form-reminder.types';

export const useMutateSendFormReminder = () => {
  const { onErrorMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: sendFormReminder,
    invalidateQueryKey: (_, variables) => [
      QueryKeyFormEnum.FORM_APPLICATION,
      variables.companyId,
      variables.applicationId,
    ],
    onError: onErrorMessage,
  });

  return mutate;
};
