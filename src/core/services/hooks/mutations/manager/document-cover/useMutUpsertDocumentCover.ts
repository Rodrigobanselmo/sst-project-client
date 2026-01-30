import { useMutation } from 'react-query';
import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';
import { IErrorResp } from 'core/services/errors/types';

export interface IDocumentCoverJson {
  coverProps: {
    logoProps?: {
      maxLogoHeight?: number;
      maxLogoWidth?: number;
      x?: number;
      y?: number;
    };
    titleProps?: {
      x?: number;
      y?: number;
      boxX?: number;
      boxY?: number;
      size?: number;
      color?: string;
    };
    versionProps?: {
      x?: number;
      y?: number;
      boxX?: number;
      boxY?: number;
      size?: number;
      color?: string;
    };
    companyProps?: {
      x?: number;
      y?: number;
      boxX?: number;
      boxY?: number;
      size?: number;
      color?: string;
    };
    backgroundImagePath?: string;
  };
}

export interface IDocumentCover {
  id: number;
  name?: string;
  acceptType?: string[];
  json?: IDocumentCoverJson;
  companyId: string;
}

export interface IUpsertDocumentCover {
  id?: number;
  name?: string;
  acceptType?: string[];
  json?: IDocumentCoverJson;
  file?: File;
  companyId?: string;
}

export async function upsertDocumentCover(
  data: IUpsertDocumentCover,
  companyId?: string,
): Promise<IDocumentCover> {
  const formData = new FormData();

  if (data.id) formData.append('id', String(data.id));
  if (data.name) formData.append('name', data.name);
  if (data.acceptType)
    formData.append('acceptType', JSON.stringify(data.acceptType));
  if (data.json) formData.append('json', JSON.stringify(data.json));
  if (data.file) formData.append('file', data.file);

  const path = ApiRoutesEnum.DOCUMENT_COVER.replace(
    ':companyId',
    companyId || '',
  );

  const response = await api.post<IDocumentCover>(path, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

export function useMutUpsertDocumentCover() {
  const { enqueueSnackbar } = useSnackbar();
  const { getCompanyId } = useGetCompanyId();

  return useMutation(
    async (data: IUpsertDocumentCover) =>
      upsertDocumentCover(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp) {
          queryClient.invalidateQueries([
            QueryEnum.DOCUMENT_COVER,
            resp.companyId,
          ]);
          queryClient.invalidateQueries([QueryEnum.COMPANY, resp.companyId]);
        }

        enqueueSnackbar('Capa do documento salva com sucesso', {
          variant: 'success',
        });
        return resp;
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(
          error.response?.data?.message || 'Erro ao salvar capa',
          {
            variant: 'error',
          },
        );
      },
    },
  );
}
