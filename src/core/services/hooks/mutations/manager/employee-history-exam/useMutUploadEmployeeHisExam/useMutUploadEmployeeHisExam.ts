import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { refreshToken } from 'core/contexts/AuthContext';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IEmployeeExamsHistory } from 'core/interfaces/api/IEmployee';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IUpdateExamFile {
  ids?: number[];
  companyId?: string;
  file?: File;
}

export async function uploadExamFile(data: IUpdateExamFile) {
  if (!data.companyId) return null;
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      return value.forEach((item) => {
        formData.append(`${key}[]`, item);
      });
    }

    formData.append(key, value);
  });

  const { token } = await refreshToken();

  const path = `${ApiRoutesEnum.EMPLOYEE_HISTORY_EXAM}/upload/${data.companyId}`;

  const response = await api.post<IEmployeeExamsHistory[]>(path, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export function useMutUploadEmployeeHisExam() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpdateExamFile) =>
      uploadExamFile({ ...data, companyId: getCompanyId(data) }),
    {
      onSuccess: async (resp) => {
        if (resp)
          queryClient.invalidateQueries([QueryEnum.EMPLOYEE_HISTORY_EXAM]);

        enqueueSnackbar('Arquivo adicionado com sucesso', {
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
