import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IEmployee } from 'core/interfaces/api/IEmployee';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { emptyArrayReturn } from 'core/utils/helpers/emptyFunc';

import { QueryEnum } from '../../../../enums/query.enums';

export const queryEmployees = async () => {
  const response = await api.get<IEmployee[]>(`${ApiRoutesEnum.EMPLOYEES}`);

  return response.data;
};

export function useQueryEmployees(): IReactQuery<IEmployee[]> {
  const { companyId } = useGetCompanyId();

  const { data, ...query } = useQuery(
    [QueryEnum.EMPLOYEES, companyId],
    () =>
      companyId ? queryEmployees() : <Promise<IEmployee[]>>emptyArrayReturn(),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  return { ...query, data: data || [] };
}
