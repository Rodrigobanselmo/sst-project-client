import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IImageGallery } from 'core/interfaces/api/IImageGallery';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IDeleteImageGallery {
  id: number;
}

export async function deleteImageGallery(id: number, companyId: string) {
  const path =
    ApiRoutesEnum.IMAGE_GALLERY.replace(':companyId', companyId) + `/${id}`;

  const response = await api.delete<IImageGallery>(path);

  return response.data;
}

export function useMutDeleteImageGallery() {
  const { enqueueSnackbar } = useSnackbar();
  const { companyId, workspaceId } = useGetCompanyId();

  return useMutation(
    async ({ id }: IDeleteImageGallery) =>
      deleteImageGallery(id, companyId || ''),
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
