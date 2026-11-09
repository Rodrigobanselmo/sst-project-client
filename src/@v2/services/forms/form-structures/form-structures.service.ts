import { useQuery } from '@tanstack/react-query';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { api } from 'core/services/apiClient';

export interface FormStructureDimension {
  id: string;
  name: string;
}

export interface FormStructureScale extends FormStructureDimension {
  dimensions: FormStructureDimension[];
}

export interface FormStructureInput {
  name: string;
  scales: FormStructureScale[];
}

export interface FormStructure extends FormStructureInput {
  id: string;
  system: boolean;
}

export type FormStructureMode = 'scales' | 'dimensions';

const path = (companyId: string) =>
  `v2/companies/${companyId}/forms/structures`;
const queryKey = (companyId: string) => ['form-structures', companyId];

export function useFormStructures(companyId: string, enabled = true) {
  return useQuery({
    queryKey: queryKey(companyId),
    enabled,
    queryFn: async () => (await api.get<FormStructure[]>(path(companyId))).data,
  });
}

export function useSaveFormStructure(companyId: string) {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: async ({
      input,
      id,
    }: {
      input: FormStructureInput;
      id?: string;
    }) =>
      id
        ? api.patch(`${path(companyId)}/${id}`, input)
        : api.post(path(companyId), input),
    invalidateQueryKey: () => queryKey(companyId),
    onSuccess: () => onSuccessMessage('Estrutura salva com sucesso!'),
    onError: onErrorMessage,
  });
}

export function useDeleteFormStructure(companyId: string) {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: (id: string) => api.delete(`${path(companyId)}/${id}`),
    invalidateQueryKey: () => queryKey(companyId),
    onSuccess: () => onSuccessMessage('Estrutura excluída com sucesso!'),
    onError: onErrorMessage,
  });
}
