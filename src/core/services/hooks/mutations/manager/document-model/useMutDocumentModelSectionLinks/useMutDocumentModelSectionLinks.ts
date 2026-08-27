import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { SectionLinkGroupResponse } from 'components/organisms/documentModel/section-propagation/section-propagation.types';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';

import { IErrorResp } from '../../../../../errors/types';

function documentModelPath(companyId: string) {
  return ApiRoutesEnum.DOCUMENT_MODEL.replace(':companyId', companyId);
}

export function useMutGetDocumentModelSectionLinks() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: { id: number; headingId: string; companyId?: string }) => {
      const companyId = getCompanyId(data);
      if (!companyId) return null;
      const response = await api.get<SectionLinkGroupResponse>(
        `${documentModelPath(companyId)}/${data.id}/section-links`,
        { params: { headingId: data.headingId, companyId } },
      );
      return response.data;
    },
    {
      onError: (error: IErrorResp) => {
        if (error.response?.data)
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}

export function useMutCreateDocumentModelSectionLink() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: {
      id: number;
      headingId: string;
      memberModelIds: number[];
      companyId?: string;
    }) => {
      const companyId = getCompanyId(data);
      if (!companyId) return null;
      const response = await api.post<SectionLinkGroupResponse>(
        `${documentModelPath(companyId)}/${data.id}/section-links`,
        {
          headingId: data.headingId,
          memberModelIds: data.memberModelIds,
          companyId,
        },
      );
      return response.data;
    },
    {
      onError: (error: IErrorResp) => {
        if (error.response?.data)
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}

export function useMutAddDocumentModelSectionLinkMember() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: { groupId: string; documentModelId: number; relativeToModelId?: number; companyId?: string }) => {
      const companyId = getCompanyId(data);
      if (!companyId) return null;
      const response = await api.post<SectionLinkGroupResponse>(
        `${documentModelPath(companyId)}/section-links/${data.groupId}/members`,
        {
          documentModelId: data.documentModelId,
          relativeToModelId: data.relativeToModelId,
          companyId,
        },
      );
      return response.data;
    },
    {
      onError: (error: IErrorResp) => {
        if (error.response?.data)
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}

export function useMutRemoveDocumentModelSectionLinkMember() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: { groupId: string; modelId: number; relativeToModelId?: number; companyId?: string }) => {
      const companyId = getCompanyId(data);
      if (!companyId) return null;
      const response = await api.delete<SectionLinkGroupResponse>(
        `${documentModelPath(companyId)}/section-links/${data.groupId}/members/${data.modelId}`,
        { params: { companyId, relativeToModelId: data.relativeToModelId ?? data.modelId } },
      );
      return response.data;
    },
    {
      onError: (error: IErrorResp) => {
        if (error.response?.data)
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
