import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';
import { SectionPropagationApplyResponse } from 'components/organisms/documentModel/section-propagation/section-propagation.types';

export async function applySectionPropagation(
  data: {
    id: number;
    headingId: string;
    companyId?: string;
    expectedSourceUpdatedAt: string;
    expectedSourceHash: string;
    targets: Array<{ id: number; expectedUpdatedAt: string }>;
  },
  companyId?: string,
) {
  if (!companyId) return null;
  const response = await api.post<SectionPropagationApplyResponse>(
    `${ApiRoutesEnum.DOCUMENT_MODEL.replace(':companyId', companyId)}/${
      data.id
    }/section-propagation/apply`,
    {
      headingId: data.headingId,
      expectedSourceUpdatedAt: data.expectedSourceUpdatedAt,
      expectedSourceHash: data.expectedSourceHash,
      targets: data.targets,
      companyId,
    },
  );
  return response.data;
}

export function useMutApplySectionPropagation() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: {
      id: number;
      headingId: string;
      companyId?: string;
      expectedSourceUpdatedAt: string;
      expectedSourceHash: string;
      targets: Array<{ id: number; expectedUpdatedAt: string }>;
    }) => applySectionPropagation(data, getCompanyId(data)),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryEnum.DOCUMENT_MODEL]);
      },
      onError: (error: IErrorResp) => {
        if (error.response?.data)
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
