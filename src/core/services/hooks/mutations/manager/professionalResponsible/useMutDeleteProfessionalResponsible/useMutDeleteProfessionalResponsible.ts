import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IProfessionalResponsible } from 'core/interfaces/api/IProfessionalResponsible';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IDeleteProfessionalResponsible {
  id?: number;
  companyId?: string;
}

export async function upsertRiskDocs(
  data: IDeleteProfessionalResponsible,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.delete<IProfessionalResponsible>(
    ApiRoutesEnum.PROFESSIONAL_RESP.replace(':companyId', companyId) +
      '/' +
      data.id,
  );

  return response.data;
}

export function useMutDeleteProfessionalResponsible() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IDeleteProfessionalResponsible) =>
      upsertRiskDocs(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp) queryClient.invalidateQueries([QueryEnum.PROFESSIONAL_RESP]);

        enqueueSnackbar('Responsável deletado com sucesso', {
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
