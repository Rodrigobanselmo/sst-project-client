import { useQuery } from 'react-query';

import { useAuth } from 'core/contexts/AuthContext';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
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
  const { user } = useAuth();
  const company = user?.companyId;

  const { data, ...query } = useQuery(
    [QueryEnum.EMPLOYEES, company],
    () =>
      company ? queryEmployees() : <Promise<IEmployee[]>>emptyArrayReturn(),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  return { ...query, data: data || [] };
}
