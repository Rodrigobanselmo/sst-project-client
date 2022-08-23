import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { refreshToken } from 'core/contexts/AuthContext';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { ICompany } from 'core/interfaces/api/ICompany';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IAddCompanyPhoto {
  file: File;
  companyId?: string;
}

export async function addCompanyPhoto(
  data: IAddCompanyPhoto,
  companyId: string,
) {
  const formData = new FormData();
  formData.append('file', data.file);

  const { token, api } = await refreshToken();

  const path =
    ApiRoutesEnum.COMPANY.replace(':companyId', companyId) + '/photo';

  const response = await api.post<ICompany>(path, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export function useMutAddCompanyPhoto() {
  const { enqueueSnackbar } = useSnackbar();
  const { getCompanyId } = useGetCompanyId();

  return useMutation(
    async ({ ...data }: IAddCompanyPhoto) =>
      addCompanyPhoto(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp) {
          const company = queryClient.getQueryData<ICompany>([
            QueryEnum.COMPANY,
            resp.id,
          ]);

          queryClient.setQueryData([QueryEnum.COMPANY, resp.id], {
            ...(company || {}),
            ...resp,
          });
        }

        enqueueSnackbar('Ação realizado com sucesso', {
          variant: 'success',
        });
        return resp;
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
