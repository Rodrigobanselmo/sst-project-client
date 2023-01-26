import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { AlertsTypeEnum } from 'core/constants/maps/alert.map';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';
import { IErrorResp } from 'core/services/errors/types';

export interface IUpsIUpserALert {
  companyId?: string;
  type?: AlertsTypeEnum;
}

export async function sendAlert(data: IUpsIUpserALert, companyId?: string) {
  if (!companyId) return null;

  const response = await api.post<null>(
    `${ApiRoutesEnum.ALERT}`.replace(':companyId', companyId) + '/send',
    {
      ...data,
      companyId,
    },
  );

  return response.data;
}

export function useMutSendAlert() {
  const { enqueueSnackbar } = useSnackbar();
  const { getCompanyId } = useGetCompanyId();

  return useMutation(
    async (data: IUpsIUpserALert) => sendAlert({ ...data }, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        enqueueSnackbar('Alerta enviado com sucesso', {
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
