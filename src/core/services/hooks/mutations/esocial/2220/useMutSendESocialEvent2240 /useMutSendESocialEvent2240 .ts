import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { refreshToken } from 'core/contexts/AuthContext';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';
import { downloadFile } from 'core/utils/helpers/downloadFile';

import { IErrorResp } from '../../../../../errors/types';

export interface ISendEvent2240 {
  companyId: string;
  tpAmb?: number;
  procEmi?: number;
}

export async function mutSend2240(data: ISendEvent2240) {
  const { token } = await refreshToken();
  const response = await api.post(
    `${ApiRoutesEnum.ESOCIAL_EVENT_2240}`,
    {
      ...data,
    },
    {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (response.headers['content-type'] === 'text/html; charset=utf-8')
    return data;

  downloadFile(response);

  return data;
}

export function useMutSendESocialEvent2240() {
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(async (data: ISendEvent2240) => mutSend2240(data), {
    onSuccess: async (resp) => {
      queryClient.invalidateQueries([QueryEnum.PREVIEW_EVENT_2220]);
      queryClient.invalidateQueries([QueryEnum.ESOCIAL_EVENT_BATCH]);
      queryClient.invalidateQueries([QueryEnum.ESOCIAL_EVENT]);
      queryClient.invalidateQueries([QueryEnum.COMPANIES]);

      enqueueSnackbar('Lote de eventos enviado', {
        variant: 'success',
      });
      return resp;
    },
    onError: (error: IErrorResp) => {
      if (error.response?.data)
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
    },
  });
}
