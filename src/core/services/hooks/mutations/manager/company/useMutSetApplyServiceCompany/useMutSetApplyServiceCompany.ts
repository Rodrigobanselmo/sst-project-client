import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

interface ISetCompanyClinics {
  applyServiceIds: string[];
  companyId: string;
}

export async function setApplyCompany(
  data: ISetCompanyClinics,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.post(
    `${ApiRoutesEnum.COMPANY}/set-apply-service`.replace(
      ':companyId',
      companyId,
    ),
    { ...data, companyId },
  );
  return response.data;
}

export function useMutSetApplyServiceCompany() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: ISetCompanyClinics) =>
      setApplyCompany(data, getCompanyId(data)),
    {
      onSuccess: async () => {
        queryClient.invalidateQueries([QueryEnum.COMPANY_GROUP]);
        queryClient.invalidateQueries([QueryEnum.COMPANIES]);
        queryClient.invalidateQueries([QueryEnum.COMPANY]);

        enqueueSnackbar('Clinicas editadas com sucesso', {
          variant: 'success',
        });
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
