import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { ICompany } from 'core/interfaces/api/ICompany';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export async function reactivateCompany(companyId: string) {
  if (!companyId) return null;

  const response = await api.patch<ICompany>(
    `${ApiRoutesEnum.COMPANIES}/${companyId}/reactivate`,
  );
  return response.data;
}

export function useMutReactivateCompany() {
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(async (companyId: string) => reactivateCompany(companyId), {
    onSuccess: async (companyResp) => {
      if (companyResp) {
        queryClient.invalidateQueries([QueryEnum.COMPANIES]);
        queryClient.invalidateQueries([QueryEnum.COMPANY, companyResp.id]);
      }

      enqueueSnackbar('Empresa reativada com sucesso', {
        variant: 'success',
      });
      return companyResp;
    },
    onError: (error: IErrorResp) => {
      enqueueSnackbar(
        error.response?.data?.message || 'Erro ao reativar empresa',
        {
          variant: 'error',
        },
      );
    },
  });
}
