import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { EnvironmentTypeEnum } from 'project/enum/environment-type.enum';

import { refreshToken } from 'core/contexts/AuthContext';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IEnvironment } from 'core/interfaces/api/IEnvironment';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../errors/types';

export interface IAddEnvironmentPhoto {
  file?: File;
  name?: string;
  id?: string;
  photoUrl: string;
}

export interface IUpsertEnvironment {
  id?: string;
  type?: EnvironmentTypeEnum;
  hierarchyIds?: string[];
  considerations?: string[];
  activities?: string[];
  name?: string;
  description?: string;
  companyId?: string;
  workspaceId?: string;
  order?: number;
  photos?: IAddEnvironmentPhoto[];
  noiseValue?: string;
  temperature?: string;
  luminosity?: string;
  moisturePercentage?: string;
}

export async function updateEnvironment(
  data: IUpsertEnvironment,
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

  const path = ApiRoutesEnum.ENVIRONMENTS.replace(
    ':companyId',
    companyId,
  ).replace(':workspaceId', workspaceId);

  const response = await api.post<IEnvironment>(path, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export function useMutUpsertEnvironment() {
  const { enqueueSnackbar } = useSnackbar();
  const { getCompanyId, workspaceId } = useGetCompanyId();

  return useMutation(
    async ({ workspaceId: wId, ...data }: IUpsertEnvironment) =>
      updateEnvironment(data, getCompanyId(data), wId || workspaceId),
    {
      onSuccess: async (resp) => {
        if (resp) {
          const actualData = queryClient.getQueryData(
            // eslint-disable-next-line prettier/prettier
            [QueryEnum.ENVIRONMENTS, resp.companyId, resp.workspaceId],
          );
          if (actualData) {
            queryClient.invalidateQueries([
              QueryEnum.ENVIRONMENT,
              resp.companyId,
              resp.workspaceId,
              resp.id,
            ]);
            queryClient.setQueryData(
              [QueryEnum.ENVIRONMENTS, resp.companyId, resp.workspaceId],
              (oldData: IEnvironment[] | undefined) => {
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
