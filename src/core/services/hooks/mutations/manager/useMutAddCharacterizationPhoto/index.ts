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

export interface IAddCharacterizationPhoto {
  file: File;
  name: string;
  companyCharacterizationId: string;
  workspaceId?: string;
}

export async function addCharacterizationPhoto(
  data: IAddCharacterizationPhoto,
  companyId: string,
  workspaceId: string,
) {
  const formData = new FormData();

  formData.append('file', data.file);
  formData.append('name', data.name);
  formData.append('companyCharacterizationId', data.companyCharacterizationId);

  const { token } = await refreshToken();

  const path =
    ApiRoutesEnum.CHARACTERIZATIONS.replace(':companyId', companyId).replace(
      ':workspaceId',
      workspaceId,
    ) + '/photo';

  const response = await api.post<ICharacterization>(path, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export function useMutAddCharacterizationPhoto() {
  const { enqueueSnackbar } = useSnackbar();
  const { getCompanyId, workspaceId } = useGetCompanyId();

  return useMutation(
    async ({ workspaceId: workId, ...data }: IAddCharacterizationPhoto) =>
      addCharacterizationPhoto(data, getCompanyId(data), workId || workspaceId),
    {
      onSuccess: async (resp) => {
        console.log(resp);
        if (resp) {
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
                console.log('newData', newData);

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
