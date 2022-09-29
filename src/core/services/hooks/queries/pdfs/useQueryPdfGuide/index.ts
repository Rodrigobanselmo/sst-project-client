import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IGuideData } from 'core/interfaces/api/IGuideData';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { emptyMapReturn } from 'core/utils/helpers/emptyFunc';

import { QueryEnum } from '../../../../../enums/query.enums';

export const queryGuide = async (employeeId: string, companyId: string) => {
  const response = await api.get<IGuideData>(
    ApiRoutesEnum.PDF_GUIDE + `/${employeeId}` + `/${companyId}`,
  );
  return response.data;
};

export function useQueryPdfGuide(employeeId?: string, companyIdProp?: string) {
  const { companyId } = useGetCompanyId();
  const companyIdSelected = companyIdProp || companyId;

  const { data, ...query } = useQuery(
    [QueryEnum.PDF_GUIDE, companyIdSelected, employeeId],
    () =>
      companyIdSelected && employeeId
        ? queryGuide(employeeId, companyIdSelected)
        : <Promise<IGuideData>>emptyMapReturn(),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  return { ...query, data: data };
}
