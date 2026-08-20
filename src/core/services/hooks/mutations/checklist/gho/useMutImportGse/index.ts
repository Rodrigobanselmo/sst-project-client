import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IImportGsePayload {
  companyId?: string;
  companyCopyFromId: string;
  sourceWorkspaceId: string;
  sourceHomogeneousGroupId: string;
  sourceRiskFactorGroupDataId: string;
  targetRiskFactorGroupDataId: string;
  workspaceId: string;
  name: string;
  description?: string;
}

export interface IImportGseResult {
  id: string;
  name: string;
  description: string;
  directRiskCount: number;
}

export async function importGse(data: IImportGsePayload) {
  if (!data.companyId) return null;
  if (!data.workspaceId) return null;
  if (!data.sourceRiskFactorGroupDataId) return null;
  if (!data.targetRiskFactorGroupDataId) return null;

  const response = await api.post<IImportGseResult>(
    `${ApiRoutesEnum.GHO}/import/${data.companyId}`,
    data,
  );
  return response.data;
}

export function useMutImportGse() {
  const { enqueueSnackbar } = useSnackbar();
  const { getCompanyId } = useGetCompanyId();

  return useMutation(
    async (data: IImportGsePayload) =>
      importGse({ ...data, companyId: getCompanyId(data) }),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === QueryEnum.GHO,
        });
        enqueueSnackbar('GSE importado com sucesso', { variant: 'success' });
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(
          error.response?.data?.message || 'Não foi possível importar o GSE',
          { variant: 'error' },
        );
      },
    },
  );
}
