import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IGho } from 'core/interfaces/api/IGho';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

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
        if (resp?.companyId) {
          // Só atualizar caches cujo dado é lista (ex.: useQueryGHOAll). Chaves como [GHO, companyId, ghoId] guardam um único IGho — chamar .map nelas quebrava o onSuccess e a persistência parecia falhar.
          queryClient.setQueriesData(
            {
              queryKey: [QueryEnum.GHO, resp.companyId],
              predicate: (query) => Array.isArray(query.state.data),
            },
            (oldData: unknown) => {
              if (!Array.isArray(oldData)) return oldData;
              return (oldData as IGho[]).map((gho) => {
                if (gho.id != resp.id) return gho;
                return {
                  ...gho,
                  ...resp,
                  hierarchies: resp.hierarchies ?? gho.hierarchies,
                };
              });
            },
          );

          void queryClient.invalidateQueries([QueryEnum.GHO, resp.companyId]);
        }

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
