import { QueryKeyCharacterizationEnum } from '@v2/constants/enums/characterization-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import {
  captureCharacterizationTechnicalSnapshot,
  createCharacterizationTechnicalRecord,
  deleteOrArchiveCharacterizationTechnicalRecord,
  updateCharacterizationTechnicalRecord,
} from '../service/technical-traceability.service';

const technicalRecordsQueryKey = (variables: {
  companyId: string;
  workspaceId: string;
  characterizationId: string;
}) => [
  QueryKeyCharacterizationEnum.TECHNICAL_RECORDS,
  variables.companyId,
  variables.workspaceId,
  variables.characterizationId,
];

export const useMutateCreateCharacterizationTechnicalRecord = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: createCharacterizationTechnicalRecord,
    invalidateManyQueryKeys: (_data, variables) => [
      technicalRecordsQueryKey(variables),
    ],
    onSuccess: () => onSuccessMessage('Registro técnico criado com sucesso'),
    onError: onErrorMessage,
  });
};

export const useMutateUpdateCharacterizationTechnicalRecord = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: updateCharacterizationTechnicalRecord,
    invalidateManyQueryKeys: (_data, variables) => [
      technicalRecordsQueryKey(variables),
    ],
    onSuccess: () => onSuccessMessage('Registro técnico atualizado com sucesso'),
    onError: onErrorMessage,
  });
};

export const useMutateDeleteCharacterizationTechnicalRecord = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: deleteOrArchiveCharacterizationTechnicalRecord,
    invalidateManyQueryKeys: (_data, variables) => [
      technicalRecordsQueryKey(variables),
    ],
    onSuccess: (data) =>
      onSuccessMessage(
        data?.action === 'ARCHIVED'
          ? 'Registro técnico arquivado'
          : 'Registro técnico excluído',
      ),
    onError: onErrorMessage,
  });
};

export const useMutateCaptureCharacterizationTechnicalSnapshot = () => {
  const { onErrorMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: captureCharacterizationTechnicalSnapshot,
    invalidateQueryKey: false,
    onError: onErrorMessage,
  });
};
