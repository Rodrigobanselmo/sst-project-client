import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { ICompany } from 'core/interfaces/api/ICompany';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { useAuth } from '../../../../../contexts/AuthContext';
import { IErrorResp } from '../../../../errors/types';

interface IUpdateCompany extends Pick<ICompany, 'type'> {
  id: number;
  status?: string;
  name?: string;
  cnpj?: string;
  description?: string;
  fantasy?: string;
}

export async function updateCompany(data: IUpdateCompany, companyId?: string) {
  if (!companyId) return null;

  const response = await api.post<ICompany>(ApiRoutesEnum.COMPANIES, {
    ...data,
    companyId,
  });
  return response.data;
}

export function useMutUpdateCompany() {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpdateCompany) => updateCompany(data, user?.companyId),
    {
      onSuccess: async (companyResp) => {
        if (companyResp)
          queryClient.setQueryData(
            [QueryEnum.COMPANIES, user?.companyId],
            (oldData: ICompany[] | undefined) =>
              oldData
                ? oldData.map((data) =>
                    companyResp.id === data.id
                      ? { ...data, ...companyResp }
                      : data,
                  )
                : [companyResp],
          );

        enqueueSnackbar('Empresa editada com sucesso', {
          variant: 'success',
        });
        return companyResp;
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
