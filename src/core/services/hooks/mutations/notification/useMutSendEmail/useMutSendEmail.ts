import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { refreshToken } from 'core/contexts/AuthContext';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { ICharacterization } from 'core/interfaces/api/ICharacterization';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../errors/types';
import { EmailsTemplatesEnum } from './../../../../../enums/emails-templates';

export interface ISendEmail {
  files?: File[];
  template: EmailsTemplatesEnum;
  companyId?: string;
}

export async function sendEmail(data: ISendEmail) {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      return value.forEach((item) => {
        formData.append(`${key}[]`, item);
      });
    }
    if (value || value === '') formData.append(key, value);
  });

  const { token } = await refreshToken();

  const path = ApiRoutesEnum.NOTIFICATION + '/email';

  const response = await api.post<ICharacterization>(path, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export function useMutSendEmail() {
  const { enqueueSnackbar } = useSnackbar();
  const { getCompanyId } = useGetCompanyId();

  return useMutation(
    async ({ ...data }: ISendEmail) =>
      sendEmail({ ...data, companyId: getCompanyId(data) }),
    {
      onSuccess: async (resp) => {
        return resp;
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
