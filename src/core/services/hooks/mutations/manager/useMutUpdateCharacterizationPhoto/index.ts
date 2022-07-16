import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { ICharacterization } from 'core/interfaces/api/ICharacterization';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../errors/types';

export interface IUpdateCharacterizationPhoto {
  id: string;
  workspaceId?: string;
  order?: number;
  name?: string;
}

export async function updateCharacterizationPhoto(
  data: IUpdateCharacterizationPhoto,
  companyId: string,
  workspaceId: string,
) {
  const path =
    ApiRoutesEnum.CHARACTERIZATIONS_PHOTO.replace(
      ':companyId',
      companyId,
    ).replace(':workspaceId', workspaceId) +
    '/' +
    data.id;

  const response = await api.patch<ICharacterization>(path, data);

  return response.data;
}

export function useMutUpdateCharacterizationPhoto() {
  const { enqueueSnackbar } = useSnackbar();
  const { companyId, workspaceId } = useGetCompanyId();

  return useMutation(
    async ({ workspaceId: workId, ...data }: IUpdateCharacterizationPhoto) =>
      updateCharacterizationPhoto(data, companyId || '', workId || workspaceId),
    {
      onSuccess: async (resp) => {
        if (resp) {
          const actualData = queryClient.getQueryData(
            // eslint-disable-next-line prettier/prettier
            [QueryEnum.CHARACTERIZATIONS, resp.companyId, resp.workspaceId],
          );
          if (actualData)
            queryClient.setQueryData(
              [QueryEnum.CHARACTERIZATIONS, resp.companyId, resp.workspaceId],
              (oldData: ICharacterization[] | undefined) => {
                if (oldData) {
                  const newData = [...oldData];

                  const updateIndexData = oldData.findIndex(
                    (old) => old.id == resp.id,
                  );
                  if (updateIndexData != -1) {
                    newData[updateIndexData] = resp;
                  } else {
                    newData.unshift(resp);
                  }

                  return newData;
                }
                return [];
              },
            );
        }

        enqueueSnackbar('Ação realizado com sucesso', {
          variant: 'success',
        });
        return resp;
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
