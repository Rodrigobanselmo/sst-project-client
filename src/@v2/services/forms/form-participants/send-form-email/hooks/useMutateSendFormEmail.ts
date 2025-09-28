import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { sendFormEmail } from '../service/send-form-email.service';

export const useMutateSendFormEmail = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: sendFormEmail,
    invalidateQueryKey: (_, variables) => [
      QueryKeyFormEnum.FORM_PARTICIPANTS,
      variables.companyId,
      variables.applicationId,
    ],
    onSuccess: () => onSuccessMessage('Email enviado com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
