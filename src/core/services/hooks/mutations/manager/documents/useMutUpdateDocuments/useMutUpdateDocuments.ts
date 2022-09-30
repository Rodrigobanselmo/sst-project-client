import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IContact } from 'core/interfaces/api/IContact';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IUpdateContact {
  id?: number;
  name: string;
  companyId?: string;
  phone?: string;
  phone_1?: string;
  email?: string;
  obs?: string;
}

export async function upsertRiskDocs(data: IUpdateContact, companyId?: string) {
  if (!companyId) return null;

  const response = await api.patch<IContact>(
    ApiRoutesEnum.CONTACTS.replace(':companyId', companyId) + '/' + data.id,
    {
      ...data,
      companyId,
    },
  );

  return response.data;
}

export function useMutUpdateContact() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpdateContact) => upsertRiskDocs(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp) queryClient.invalidateQueries([QueryEnum.CONTACTS]);

        enqueueSnackbar('Contato editado com sucesso', {
          variant: 'success',
        });
        return resp;
      },
      onError: (error: IErrorResp) => {
        if (error.response?.data)
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
