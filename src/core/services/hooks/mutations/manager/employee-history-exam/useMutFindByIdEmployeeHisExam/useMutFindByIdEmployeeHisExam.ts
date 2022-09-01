import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IEmployeeExamsHistory } from 'core/interfaces/api/IEmployee';
import { api } from 'core/services/apiClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IFindByIdEmployeeExamHistory {
  id: number;
  companyId?: string;
}

export async function findById(
  data: IFindByIdEmployeeExamHistory,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.get<IEmployeeExamsHistory>(
    ApiRoutesEnum.EMPLOYEE_HISTORY_EXAM + '/' + data.id + '/' + companyId,
  );

  return response.data;
}

export function useMutFindByIdEmployeeHisExam() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IFindByIdEmployeeExamHistory) =>
      findById(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        return resp;
      },
      onError: (error: IErrorResp) => {
        if (error.response?.data)
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
