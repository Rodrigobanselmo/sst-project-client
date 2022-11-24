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

export interface ICreateProtocol {
  name: string;
  companyId: string;
  status?: StatusEnum;
}

export async function createProtocol(
  data: ICreateProtocol,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.post<IProtocol>(`${ApiRoutesEnum.PROTOCOL}`, {
    ...data,
    companyId,
  });

  return response.data;
}

export function useMutCreateProtocol() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useGetCompanyId();

  return useMutation(
    async (data: ICreateProtocol) =>
      createProtocol(data, data.companyId || user?.companyId),
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
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
