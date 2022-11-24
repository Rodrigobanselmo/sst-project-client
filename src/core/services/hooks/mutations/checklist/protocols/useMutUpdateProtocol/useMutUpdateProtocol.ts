import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { StatusEnum } from 'project/enum/status.enum';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IProtocol } from 'core/interfaces/api/IProtocol';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

interface ICreateProtocol {
  id?: number;
  name: string;
  companyId: string;
  status?: StatusEnum;
}

export async function updateProtocol(
  data: ICreateProtocol,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.patch<IProtocol>(
    `${ApiRoutesEnum.PROTOCOL}/${data.id}/${companyId}`,
    {
      ...data,
      companyId,
    },
  );

  return response.data;
}

export function useMutUpdateProtocol() {
  const { user } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: ICreateProtocol) =>
      updateProtocol(data, data.companyId || user?.companyId),
    {
      onSuccess: async (newProtocol) => {
        if (newProtocol) {
          queryClient.invalidateQueries([QueryEnum.PROTOCOLS]);
        }

        enqueueSnackbar('Protocolo criado com sucesso', {
          variant: 'success',
        });
        return newProtocol;
      },
      onError: (error: IErrorResp) => {
        if (error.response.status == 400)
          enqueueSnackbar('Você não tem permissão para editar esse dado', {
            variant: 'error',
          });
        else {
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
        }
      },
    },
  );
}
