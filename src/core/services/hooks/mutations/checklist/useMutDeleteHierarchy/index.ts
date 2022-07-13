import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../errors/types';

export async function createHierarchy(id: string, companyId?: string) {
  if (!companyId) return;

  const response = await api.delete<IHierarchy>(
    `${ApiRoutesEnum.HIERARCHY}/${id}/${companyId}`,
  );

  return response.data;
}

export function useMutDeleteHierarchy() {
  const { enqueueSnackbar } = useSnackbar();

  const { companyId } = useGetCompanyId();

  return useMutation(async (id: string) => createHierarchy(id, companyId), {
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
          [QueryEnum.HIERARCHY, resp.companyId],
        );
        if (actualData)
          queryClient.setQueryData(
            [QueryEnum.HIERARCHY, resp.companyId],
            (oldData: IHierarchy[] | undefined) =>
              oldData ? oldData.filter((data) => data.id !== resp.id) : [],
          );
      }

      enqueueSnackbar('Hierarquia deletado com sucesso', {
        variant: 'success',
      });

      return resp;
    },
    onError: (error: IErrorResp) => {
      if (error.response.data.message.includes('fkey'))
        enqueueSnackbar(
          'Proibido deletar hierarquia quando ligada a um empregado',
          { variant: 'error' },
        );
      else enqueueSnackbar(error.response.data.message, { variant: 'error' });
    },
  });
}
