import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IDashboard } from 'core/interfaces/api/IDashboard';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { emptyMapReturn } from 'core/utils/helpers/emptyFunc';

import { QueryEnum } from '../../../../enums/query.enums';

export const queryDashboard = async (companyId: string) => {
  const response = await api.get<IDashboard>(
    ApiRoutesEnum.COMPANY_DASHBOARD.replace(':companyId', companyId),
  );
  return response.data;
};

export function useQueryDashboard(companyIdProp?: string) {
  const { companyId } = useGetCompanyId();
  const companyIdSelected = companyIdProp || companyId;

  const { data, ...query } = useQuery(
    [QueryEnum.DASHBOARD_COMPANY, companyIdSelected],
    () =>
      companyIdSelected
        ? queryDashboard(companyIdSelected)
        : <Promise<IDashboard>>emptyMapReturn(),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  return { ...query, data: data };
}
