import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { ICompany, IWorkspace } from 'core/interfaces/api/ICompany';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../errors/types';

export interface IUpdateCompany
  extends Partial<
    Pick<
      ICompany,
      'type' | 'address' | 'primary_activity' | 'secondary_activity'
    >
  > {
  id?: string;
  status?: string;
  name?: string;
  cnpj?: string;
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
  workspace?: Partial<IWorkspace>[];
}

export async function updateCompany(data: IUpdateCompany, companyId?: string) {
  if (!companyId) return null;

  const response = await api.patch<ICompany>(ApiRoutesEnum.COMPANIES, {
    ...data,
    companyId,
  });
  return response.data;
}

export function useMutUpdateCompany() {
  const { enqueueSnackbar } = useSnackbar();
  const { getCompanyId } = useGetCompanyId();

  return useMutation(
    async (data: IUpdateCompany) => updateCompany(data, getCompanyId(data)),
    {
      onSuccess: async (companyResp) => {
        if (companyResp) {
          queryClient.setQueryData(
            [QueryEnum.COMPANIES, companyResp.id],
            (oldData: ICompany[] | undefined) =>
              oldData
                ? oldData.map((data) =>
                    companyResp.id === data.id
                      ? { ...data, ...companyResp }
                      : data,
                  )
                : [companyResp],
          );

          queryClient.setQueryData(
            [QueryEnum.COMPANY, companyResp.id],
            () => companyResp,
          );
        }

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
