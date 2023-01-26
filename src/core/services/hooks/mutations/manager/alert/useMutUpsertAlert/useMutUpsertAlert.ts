import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { AlertsTypeEnum } from 'core/constants/maps/alert.map';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IAlert } from 'core/interfaces/api/IAlert';
import { api } from 'core/services/apiClient';
import { IErrorResp } from 'core/services/errors/types';
import { queryClient } from 'core/services/queryClient';

export interface IUpsIUpserALert {
  companyId?: string;
  type?: AlertsTypeEnum;
  emails?: string[];
  usersIds?: number[];
  groupsIds?: number[];
  configJson?: IAlert['configJson'];

  removeEmails?: string[];
  removeUsersIds?: number[];
  removeGroupsIds?: number[];
}

export async function upsertOs(data: IUpsIUpserALert, companyId?: string) {
  if (!companyId) return null;

  const response = await api.post<null>(
    `${ApiRoutesEnum.ALERT}`.replace(':companyId', companyId),
    {
      ...data,
      companyId,
    },
  );

  return response.data;
}

export function useMutUpsertAlert() {
  const { enqueueSnackbar } = useSnackbar();
  const { getCompanyId } = useGetCompanyId();

  return useMutation(
    async (data: IUpsIUpserALert) => upsertOs({ ...data }, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        queryClient.invalidateQueries([QueryEnum.ALERT]);

        enqueueSnackbar('Alerta editado com sucesso', {
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
