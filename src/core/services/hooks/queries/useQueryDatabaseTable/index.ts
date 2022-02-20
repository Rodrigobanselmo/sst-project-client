import { useQuery } from 'react-query';

import { IDatabaseTable } from 'core/interfaces/api/IDatabaseTable';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

export const queryDatabaseTable = async (): Promise<IDatabaseTable[]> => {
  const response = await api.get<IDatabaseTable[]>('/files/database-tables');

  return response.data;
};

export function useQueryDatabaseTable(): IReactQuery<IDatabaseTable[]> {
  const { data, ...query } = useQuery(
    QueryEnum.DATABASE_TABLE,
    () => queryDatabaseTable(),
    {
      staleTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  );

  return { ...query, data: data || [] };
}
