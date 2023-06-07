import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { refreshToken } from 'core/contexts/AuthContext';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IImageGallery } from 'core/interfaces/api/IImageGallery';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';
import { ImagesTypeEnum } from 'project/enum/imageGallery.enum';

export interface ICreateImageGallery {
  file: File;
  types?: ImagesTypeEnum[];
  name: string;
  companyId?: string;
}

export async function createImageGallery(
  data: ICreateImageGallery,
  companyId: string,
) {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      return value.forEach((item) => {
        formData.append(`${key}[]`, item);
      });
    }

    formData.append(key, value);
  });

  const { token } = await refreshToken();

  const path = ApiRoutesEnum.IMAGE_GALLERY.replace(':companyId', companyId);

  const response = await api.post<IImageGallery>(path, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export function useMutCreateImageGallery() {
  const { enqueueSnackbar } = useSnackbar();
  const { getCompanyId } = useGetCompanyId();

  return useMutation(
    async ({ ...data }: ICreateImageGallery) =>
      createImageGallery(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp) queryClient.invalidateQueries([QueryEnum.IMAGE_GALLERY]);

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
