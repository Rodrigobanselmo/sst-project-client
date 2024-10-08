import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { StatusEnum } from 'project/enum/status.enum';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IEmployee } from 'core/interfaces/api/IEmployee';
import { api } from 'core/services/apiClient';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../errors/types';

export interface ICreateEmployee {
  name: string;
  cpf: string;
  rg?: string;
  cbo: string;
  hierarchyId: string;
  status?: StatusEnum;
  companyId?: string;
  cidIds?: string[];
}

export async function upsertRiskDocs(
  data: ICreateEmployee,
  companyId?: string,
) {
  if (!companyId) return null;
  const response = await api.post<IEmployee>(ApiRoutesEnum.EMPLOYEES, {
    ...data,
    companyId,
  });

  return response.data;
}

export function useMutCreateEmployee() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: ICreateEmployee) => upsertRiskDocs(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp) queryClient.invalidateQueries([QueryEnum.EMPLOYEES]);
        if (resp)
          queryClient.invalidateQueries([QueryEnum.COMPANY, resp?.companyId]);

        enqueueSnackbar('Empregado criado com sucesso', {
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
