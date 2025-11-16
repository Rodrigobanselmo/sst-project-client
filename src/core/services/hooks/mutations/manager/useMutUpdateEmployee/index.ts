import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { SexTypeEnum } from 'project/enum/sex.enums';
import { StatusEnum } from 'project/enum/status.enum';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IEmployee } from 'core/interfaces/api/IEmployee';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../errors/types';

export interface IUpdateEmployee {
  name?: string;
  cpf?: string;
  rg?: string;
  hierarchyId?: string;
  cbo?: string;
  email?: string;
  phone?: string;
  sex?: SexTypeEnum;
  status?: StatusEnum;
  companyId?: string;
  lastExam?: Date | null;
  id?: number;
  birthday?: Date | null;
  cidIds?: string[];
}

export async function updateEmployee(
  data: IUpdateEmployee,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.patch<IEmployee>(ApiRoutesEnum.EMPLOYEES, {
    companyId,
    ...data,
  });

  return response.data;
}

export function useMutUpdateEmployee() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpdateEmployee) => updateEmployee(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp) queryClient.invalidateQueries([QueryEnum.EMPLOYEES]);

        enqueueSnackbar('Empregado Editado com sucesso', {
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
