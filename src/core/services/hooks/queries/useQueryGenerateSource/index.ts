import { useQuery, UseQueryResult } from 'react-query';

import { IGenerateSource } from 'core/interfaces/api/IGenerateSource';

import { QueryEnum } from '../../../../enums/query.enums';
import { mockedSource } from './mock';

export const queryGenerateSource = async (): Promise<IGenerateSource[]> => {
  const response = {
    data: mockedSource,
  };

  return response.data;
};

export function useQueryGenerateSource(): UseQueryResult<IGenerateSource[]> {
  const data = useQuery(
    QueryEnum.GENERATE_SOURCE,
    () => queryGenerateSource(),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  return data;
}
