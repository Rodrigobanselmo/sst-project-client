import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IProtocol } from 'core/interfaces/api/IProtocol';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export async function deleteProtocol(id: number, companyId?: string) {
  const response = await api.delete<IProtocol>(
    `${ApiRoutesEnum.PROTOCOL}/${id}/${companyId}`,
  );

  return response.data;
}

export function useMutDeleteProtocol() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useGetCompanyId();

  return useMutation(
    async (id: number) => deleteProtocol(id, user?.companyId),
    {
      onSuccess: async (newProtocol) => {
        if (newProtocol) {
          queryClient.invalidateQueries([QueryEnum.PROTOCOLS]);
        }

        enqueueSnackbar('Protocolo deletada com sucesso', {
          variant: 'success',
        });
        return newProtocol;
      },
      onError: (error: IErrorResp) => {
        if (error.response.status == 400)
          enqueueSnackbar('Você não tem permissão para deletar esse dado', {
            variant: 'error',
          });
        else {
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
        }
      },
    },
  );
}
