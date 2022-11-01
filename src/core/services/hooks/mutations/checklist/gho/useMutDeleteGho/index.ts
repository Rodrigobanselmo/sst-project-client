import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IGho } from 'core/interfaces/api/IGho';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export async function createGho(id: string, companyId?: string) {
  if (!companyId) return;

  const response = await api.delete<IGho>(
    `${ApiRoutesEnum.GHO}/${id}/${companyId}`,
  );

  return response.data || { id };
}

export function useMutDeleteGho() {
  const { enqueueSnackbar } = useSnackbar();
  const { companyId } = useGetCompanyId();

  return useMutation(async (id: string) => createGho(id, companyId), {
    onSuccess: async (resp) => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey[0] === QueryEnum.GHO && !!query.queryKey[2];
        },
      });

      if (!companyId) {
        enqueueSnackbar('ID da empresa não encontrado', {
          variant: 'error',
        });

        return;
      }

      if (resp) {
        const actualData = queryClient.getQueryData(
          // eslint-disable-next-line prettier/prettier
          [QueryEnum.GHO, companyId],
        );
        if (actualData)
          queryClient.setQueryData(
            [QueryEnum.GHO, companyId],
            (oldData: IGho[] | undefined) =>
              oldData ? oldData.filter((data) => data.id !== resp.id) : [],
          );
        queryClient.invalidateQueries([QueryEnum.RISK_DATA, companyId]);
        queryClient.invalidateQueries([QueryEnum.HIERARCHY, companyId]);
      }

      enqueueSnackbar('Grupo homogênio de exposição deletado com sucesso', {
        variant: 'success',
      });

      return resp;
    },
    onError: (error: IErrorResp) => {
      enqueueSnackbar(error.response.data.message, { variant: 'error' });
    },
  });
}
