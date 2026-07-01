import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { QueryKeySubTypeEnum } from '@v2/constants/enums/sub-type-query-key.enum';

import { createRiskSubType } from '../service/create-risk-sub-type.service';
import { CreateRiskSubTypeParams } from '../service/create-risk-sub-type.types';

export const useMutateCreateRiskSubType = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: createRiskSubType,
    invalidateManyQueryKeys: () => [[QueryKeySubTypeEnum.SUB_TYPE]],
    onSuccess: () => onSuccessMessage('Subtipo criado com sucesso'),
    onError: onErrorMessage,
  });
};

export type { CreateRiskSubTypeParams };
