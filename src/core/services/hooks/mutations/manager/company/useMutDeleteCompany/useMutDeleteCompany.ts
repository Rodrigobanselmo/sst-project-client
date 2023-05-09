import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { ICompany, IWorkspace } from 'core/interfaces/api/ICompany';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

interface IDeleteCompany {
  isClinic?: boolean;
  companyId?: string;
}

export async function deleteCompany(
  companyId: string,
  options?: IDeleteCompany,
) {
  if (!companyId) return null;

  const response = await api.delete<ICompany>(
    `${ApiRoutesEnum.COMPANIES}/${companyId}${
      options?.isClinic ? '/clinic' : ''
    }`,
  );
  return response.data;
}

export function useMutDeleteCompany() {
  const { enqueueSnackbar } = useSnackbar();
  const { getCompanyId, user } = useGetCompanyId();

  return useMutation(
    async (data: IDeleteCompany) => deleteCompany(getCompanyId(data), data),
    {
      onSuccess: async (companyResp) => {
        if (companyResp) {
          queryClient.invalidateQueries([QueryEnum.COMPANIES, user?.companyId]);
          queryClient.invalidateQueries([QueryEnum.COMPANY, companyResp.id]);
        }

        enqueueSnackbar('deletado com sucesso', {
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
