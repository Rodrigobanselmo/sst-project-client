import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IEnvironment } from 'core/interfaces/api/IEnvironment';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../errors/types';

export async function deleteEnvironment(
  id: string,
  companyId: string,
  workspaceId: string,
) {
  if (!companyId) return;

  const path = ApiRoutesEnum.ENVIRONMENTS.replace(
    ':companyId',
    companyId,
  ).replace(':workspaceId', workspaceId);

  const response = await api.delete<IEnvironment>(path + '/' + id);

  return response.data || { id };
}

export function useMutDeleteEnvironment() {
  const { enqueueSnackbar } = useSnackbar();
  const { companyId, workspaceId } = useGetCompanyId();

  return useMutation(
    async (id: string) => deleteEnvironment(id, companyId || '', workspaceId),
    {
      onSuccess: async (resp) => {
        if (!companyId) {
          enqueueSnackbar('ID da empresa não encontrado', {
            variant: 'error',
          });

          return;
        }

        if (resp) {
          const actualData = queryClient.getQueryData(
            // eslint-disable-next-line prettier/prettier
            [QueryEnum.ENVIRONMENTS, resp.companyId, resp.workspaceId],
          );
          if (actualData)
            queryClient.setQueryData(
              [QueryEnum.ENVIRONMENTS, resp.companyId, resp.workspaceId],
              (oldData: IEnvironment[] | undefined) =>
                oldData ? oldData.filter((data) => data.id !== resp.id) : [],
            );
        }

        enqueueSnackbar('Ambiente de trabalho deletado com sucesso', {
          variant: 'success',
        });

        return resp;
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
