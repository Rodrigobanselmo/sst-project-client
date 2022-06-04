import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { ICompany } from 'core/interfaces/api/ICompany';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { useAuth } from '../../../../../contexts/AuthContext';
import { IErrorResp } from '../../../../errors/types';

interface ICreateCompany
  extends Pick<
    ICompany,
    'type' | 'address' | 'primary_activity' | 'secondary_activity'
  > {
  id?: string;
  status?: string;
  name: string;
  cnpj: string;
  description?: string;
  fantasy?: string;
  size?: string;
  phone?: string;
  legal_nature?: string;
  cadastral_situation?: string;
  activity_start_date?: string;
  cadastral_situation_date?: string;
  legal_nature_code?: string;
  cadastral_situation_description?: string;
}

export async function createCompany(data: ICreateCompany, companyId?: string) {
  if (!companyId) return null;

  const response = await api.post<ICompany>(ApiRoutesEnum.COMPANIES, {
    ...data,
    companyId,
  });
  return response.data;
}

export function useMutCreateCompany() {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: ICreateCompany) => createCompany(data, user?.companyId),
    {
      onSuccess: async (companyResp) => {
        if (companyResp)
          queryClient.setQueryData(
            [QueryEnum.COMPANIES, user?.companyId],
            (oldData: ICompany[] | undefined) =>
              oldData ? [companyResp, ...oldData] : [companyResp],
          );

        enqueueSnackbar('Empresa criada com sucesso', {
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
