import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

interface ISetCompanyClinics {
  clinicId: string;
  companyId: string;
}

export async function setClinicCompany(
  data: ISetCompanyClinics[],
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.post(
    `${ApiRoutesEnum.COMPANY}/set-clinics`.replace(':companyId', companyId),
    { ids: data },
  );
  return response.data;
}

export function useMutSetClinicsCompany() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: ISetCompanyClinics[]) =>
      setClinicCompany(data, getCompanyId(data)),
    {
      onSuccess: async (data) => {
        queryClient.invalidateQueries([QueryEnum.COMPANY_GROUP]);
        queryClient.invalidateQueries([QueryEnum.COMPANIES]);
        if (data?.companyId)
          queryClient.invalidateQueries([QueryEnum.COMPANY, data?.companyId]);
        else queryClient.invalidateQueries([QueryEnum.COMPANY]);

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
