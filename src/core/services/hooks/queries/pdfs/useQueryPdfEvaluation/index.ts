import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IPdfGuideData } from 'core/interfaces/api/IPdfGuideData';
import { IPdfProntuarioData } from 'core/interfaces/api/IPdfProntuarioData';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { emptyMapReturn } from 'core/utils/helpers/emptyFunc';

import { QueryEnum } from '../../../../../enums/query.enums';

export const queryEvaluation = async (
  employeeId: string,
  companyId: string,
) => {
  const response = await api.get<IPdfProntuarioData>(
    ApiRoutesEnum.PDF_EVALUATION + `/${employeeId}` + `/${companyId}`,
  );
  return response.data;
};

export function useQueryPdfEvaluation(
  employeeId?: string,
  companyIdProp?: string,
) {
  const { companyId } = useGetCompanyId();
  const companyIdSelected = companyIdProp || companyId;

  const { data, ...query } = useQuery(
    [QueryEnum.PDF_PRONTUARIO_EVALUATION, companyIdSelected, employeeId],
    () =>
      companyIdSelected && employeeId
        ? queryEvaluation(employeeId, companyIdSelected)
        : <Promise<IPdfProntuarioData>>emptyMapReturn(),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  return { ...query, data: data };
}
