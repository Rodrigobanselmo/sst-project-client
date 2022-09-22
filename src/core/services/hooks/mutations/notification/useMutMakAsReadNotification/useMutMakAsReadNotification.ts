import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { INotification } from 'core/interfaces/api/INotification';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../errors/types';

export interface INotificationUserUpdate {
  id?: number;
  ids?: number[];
}

export async function updateMessage(data: INotificationUserUpdate) {
  const response = await api.patch<INotification>(
    `${ApiRoutesEnum.NOTIFICATION}/${data.id}/user`,
    {
      ...data,
    },
  );

  return response.data;
}

export function useMutMakAsReadNotification() {
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async ({ ...data }: INotificationUserUpdate) => updateMessage({ ...data }),
    {
      onSuccess: async (resp) => {
        queryClient.invalidateQueries([QueryEnum.NOTIFICATION]);
        return resp;
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
