import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IGho } from 'core/interfaces/api/IGho';
import { api } from 'core/services/apiClient';

import { IErrorResp } from '../../../../../errors/types';
import { invalidateGhoFamily } from '../invalidate-gho-queries.util';

export interface IUpdateGho extends Partial<Pick<IGho, 'name' | 'status'>> {
  id: string;
  hierarchies?: { id: string; workspaceId: string }[];
  workspaceIds?: string[];
  confirmUnlinkWorkspaces?: boolean;
  companyId?: string;
  startDate?: Date;
  endDate?: Date;
}

export async function updateGho(data: IUpdateGho, companyId?: string) {
  if (!companyId) return null;

  const response = await api.patch<IGho>(`${ApiRoutesEnum.GHO}/${data.id}`, {
    ...data,
    companyId,
  });

  return response.data;
}

export function useMutUpdateGho() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpdateGho) => updateGho(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        // O PATCH pode omitir hierarchies. Listagem paginada, detalhe e /all
        // convergem pelo refetch da família gho.
        await invalidateGhoFamily();

        enqueueSnackbar('Grupo homogênio de exposição editado com sucesso', {
          variant: 'success',
        });
        return resp;
      },
      onError: (error: IErrorResp) => {
        if (error.response?.data)
          enqueueSnackbar(error.response.data.message, {
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'center',
            },
          });
      },
    },
  );
}
