import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { grantFormReminderLimit } from '../service/grant-form-reminder-limit.service';
import { GrantFormReminderLimitResult } from '../service/grant-form-reminder-limit.types';

export const useMutateGrantFormReminderLimit = () => {
  const { onErrorMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: grantFormReminderLimit,
    invalidateQueryKey: (_, variables) => [
      QueryKeyFormEnum.FORM_APPLICATION,
      variables.companyId,
      variables.applicationId,
    ],
    onError: onErrorMessage,
  });
};

export type { GrantFormReminderLimitResult };
