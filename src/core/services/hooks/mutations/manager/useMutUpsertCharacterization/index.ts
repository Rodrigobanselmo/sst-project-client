import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { CharacterizationTypeEnum } from 'project/enum/characterization-type.enum';

import { refreshToken } from 'core/contexts/AuthContext';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum as DeQueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { ICharacterization } from 'core/interfaces/api/ICharacterization';
import { api } from 'core/services/apiClient';
import { queryClient as OldQueryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../errors/types';
import { StatusEnum } from './../../../../../../project/enum/status.enum';
import { QueryKeyEnum } from '@v2/constants/enums/query-key.enum';
import { queryClient } from 'layouts/default/providers';

export interface IAddCharacterizationPhoto {
  file?: File;
  name?: string;
  id?: string;
  photoUrl: string;
  updated_at?: Date;
}

export interface IUpsertCharacterization {
  id?: string;
  type?: CharacterizationTypeEnum;
  hierarchyIds?: string[];
  paragraphs?: string[];
  name?: string;
  description?: string;
  stageId?: number | null;
  order?: number | null;
  done_at?: Date | '';
  companyId?: string;
  noiseValue?: string;
  temperature?: string;
  luminosity?: string;
  moisturePercentage?: string;
  workspaceId?: string;
  considerations?: string[];
  activities?: string[];
  profileParentId?: string;
  profileName?: string;
  startDate?: Date;
  endDate?: Date;
  status?: StatusEnum;
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
      if (value.length === 0) {
        return formData.append(`${key}[]`, '');
      }
      return value.forEach((item) => {
        formData.append(`${key}[]`, item);
      });
    }

    if (key === 'order' || key === 'stageId') {
      if (value !== undefined) formData.append(key, value);
    } else if (value || value === '') formData.append(key, value);
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
          OldQueryClient.invalidateQueries([DeQueryEnum.GHO]);
          queryClient.invalidateQueries({
            queryKey: [QueryKeyEnum.CHARACTERIZATIONS],
          });

          const actualData = OldQueryClient.getQueryData(
            // eslint-disable-next-line prettier/prettier
            [DeQueryEnum.CHARACTERIZATIONS, resp.companyId, resp.workspaceId],
          );
          if (actualData) {
            OldQueryClient.invalidateQueries([
              DeQueryEnum.CHARACTERIZATION,
              resp.companyId,
              resp.workspaceId,
              resp.profileParentId || resp.id,
            ]);
            OldQueryClient.setQueryData(
              [DeQueryEnum.CHARACTERIZATIONS, resp.companyId, resp.workspaceId],
              (oldData: ICharacterization[] | undefined) => {
                if (oldData) {
                  const newData = [...oldData];

                  const updateIndexData = oldData.findIndex(
                    (old) => old.id == (resp.profileParentId || resp.id),
                  );

                  if (resp.profileParentId) {
                    if (!newData[updateIndexData]) return newData;

                    const updateIndexDataParent = newData[
                      updateIndexData
                    ].profiles.findIndex((old) => old.id == resp.id);

                    if (updateIndexDataParent != -1) {
                      newData[updateIndexData].profiles[updateIndexDataParent] =
                        resp;
                    } else {
                      newData[updateIndexData].profiles = [
                        ...newData[updateIndexData].profiles,
                        resp,
                      ];
                    }
                    return newData;
                  }

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
        console.error(error);
        enqueueSnackbar(error.response.data.message, {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
      },
    },
  );
}
