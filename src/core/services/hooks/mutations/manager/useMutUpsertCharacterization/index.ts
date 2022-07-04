import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { CharacterizationTypeEnum } from 'project/enum/characterization-type.enum';

import { refreshToken } from 'core/contexts/AuthContext';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { ICharacterization } from 'core/interfaces/api/ICharacterization';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../errors/types';

export interface IAddCharacterizationPhoto {
  file?: File;
  name?: string;
  id?: string;
  photoUrl: string;
}

export interface IUpsertCharacterization {
  id?: string;
  type?: CharacterizationTypeEnum;
  hierarchyIds?: string[];
  name?: string;
  description?: string;
  companyId?: string;
  workspaceId?: string;
  considerations?: string[];
  photos?: IAddCharacterizationPhoto[];
}

export async function updateCharacterization(
  data: IUpsertCharacterization,
  companyId: string,
  workspaceId: string,
) {
  const formData = new FormData();
  data.photos?.forEach((photo) => {
    if (photo.file) formData.append('files[]', photo.file);
    if (photo.name) formData.append('photos[]', photo.name);
  });

  delete data.photos;

  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      return value.forEach((item) => {
        formData.append(`${key}[]`, item);
      });
    }

    if (value || value === '') formData.append(key, value);
  });

  const { token } = await refreshToken();

  const path = ApiRoutesEnum.CHARACTERIZATIONS.replace(
    ':companyId',
    companyId,
  ).replace(':workspaceId', workspaceId);

  const response = await api.post(path, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export function useMutUpsertCharacterization() {
  const { enqueueSnackbar } = useSnackbar();
  const { getCompanyId, workspaceId } = useGetCompanyId();

  return useMutation(
    async ({ workspaceId: wId, ...data }: IUpsertCharacterization) =>
      updateCharacterization(data, getCompanyId(data), wId || workspaceId),
    {
      onSuccess: async (resp) => {
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
