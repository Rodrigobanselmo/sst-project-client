import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { DocumentGenerationSnapshot } from 'core/interfaces/api/document-generation-snapshot.types';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IRegenerateDocumentVersion {
  documentVersionId: string;
  companyId?: string;
  name: string;
  description?: string;
  documentDate?: string;
  approvedBy?: string;
  elaboratedBy?: string;
  revisionBy?: string;
  coordinatorBy?: string;
  legalResponsibleBy?: string;
  modelId?: number;
  ghoIds?: string[];
  filterViewType?: string;
  selectedFilters?: Array<{ id: string; name?: string }>;
  json?: Record<string, unknown>;
  professionalSignatures?: Array<{
    professionalId: number;
    isSigner?: boolean;
    isElaborator?: boolean;
  }>;
}

export async function regenerateDocumentVersion(
  data: IRegenerateDocumentVersion,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.post(
    `${ApiRoutesEnum.DOC_VERSIONS.replace(':companyId', companyId)}/${data.documentVersionId}/regenerate`,
    data,
  );

  return response.data;
}

export function useMutRegenerateDocVersion() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IRegenerateDocumentVersion) =>
      regenerateDocumentVersion(data, getCompanyId(data)),
    {
      onSuccess: async () => {
        queryClient.invalidateQueries([QueryEnum.DOCUMENT_VERSION]);

        setTimeout(() => {
          queryClient.invalidateQueries([QueryEnum.DOCUMENT_VERSION]);
        }, 10000);

        enqueueSnackbar(
          'Revisão atualizada e enviada para reprocessamento com sucesso',
          { variant: 'success' },
        );
      },
      onError: (error: IErrorResp) => {
        if (error.response?.data) {
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
        }
      },
    },
  );
}

export type { DocumentGenerationSnapshot };
