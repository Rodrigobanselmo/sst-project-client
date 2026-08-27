import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';

import { IErrorResp } from '../../../../../errors/types';
import { SectionPropagationAnalyzeResponse } from 'components/organisms/documentModel/section-propagation/section-propagation.types';

export async function analyzeSectionPropagation(
  data: { id: number; headingId: string; companyId?: string },
  companyId?: string,
) {
  if (!companyId) return null;
  const response = await api.post<SectionPropagationAnalyzeResponse>(
    `${ApiRoutesEnum.DOCUMENT_MODEL.replace(':companyId', companyId)}/${
      data.id
    }/section-propagation/analyze`,
    { headingId: data.headingId, companyId },
  );
  return response.data;
}

export function useMutAnalyzeSectionPropagation() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: { id: number; headingId: string; companyId?: string }) =>
      analyzeSectionPropagation(data, getCompanyId(data)),
    {
      onError: (error: IErrorResp) => {
        if (error.response?.data)
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
