import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { QueryKeySubTypeEnum } from '@v2/constants/enums/sub-type-query-key.enum';

import {
  updateRiskSubTypeMaster,
  updateRiskSubTypeMasterStatus,
} from '../risk-sub-type-master.service';
import { riskSubTypeMasterQueryKeys } from '../risk-sub-type-master.query-keys';
import { createRiskSubType } from '../../create-risk-sub-type/service/create-risk-sub-type.service';

export const useMutateCreateRiskSubTypeMaster = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: createRiskSubType,
    invalidateManyQueryKeys: () => [
      ['risk-sub-type-master', 'browse'],
      [QueryKeySubTypeEnum.SUB_TYPE],
    ],
    onSuccess: () => onSuccessMessage('Subtipo criado com sucesso'),
    onError: onErrorMessage,
  });
};

export const useMutateUpdateRiskSubTypeMaster = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: updateRiskSubTypeMaster,
    invalidateManyQueryKeys: () => [
      ['risk-sub-type-master', 'browse'],
      [QueryKeySubTypeEnum.SUB_TYPE],
    ],
    onSuccess: () => onSuccessMessage('Subtipo atualizado'),
    onError: onErrorMessage,
  });
};

export const useMutateUpdateRiskSubTypeMasterStatus = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: updateRiskSubTypeMasterStatus,
    invalidateManyQueryKeys: () => [
      ['risk-sub-type-master', 'browse'],
      [QueryKeySubTypeEnum.SUB_TYPE],
    ],
    onSuccess: () => onSuccessMessage('Status do subtipo atualizado'),
    onError: onErrorMessage,
  });
};
