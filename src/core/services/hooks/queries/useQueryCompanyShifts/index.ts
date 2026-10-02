import { useQuery } from 'react-query';
import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';

export type CompanyShift = {
  id: number;
  name: string;
  description?: string | null;
  durationMinutes?: number | null;
};

export const queryCompanyShifts = async (companyId: string) => {
  if (!companyId) return { data: [] as CompanyShift[], count: 0 };
  const response = await api.get<{ data: CompanyShift[]; count: number }>(
    `${ApiRoutesEnum.COMPANY_SHIFTS}?take=200&skip=0`.replace(':companyId', companyId),
  );
  return response.data;
};

export function useQueryCompanyShifts() {
  const { companyId } = useGetCompanyId();
  const { data, ...result } = useQuery(
    [QueryEnum.COMPANY_SHIFTS, companyId],
    () => queryCompanyShifts(companyId || ''),
    { enabled: !!companyId, staleTime: 1000 * 60 },
  );

  return {
    ...result,
    data: data?.data || ([] as CompanyShift[]),
    count: data?.count || 0,
  };
}
