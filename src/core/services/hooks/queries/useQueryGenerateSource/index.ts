import { useQuery, UseQueryResult } from 'react-query';

import { IGenerateSource } from 'core/interfaces/GenerateSource';

import { QueryEnum } from '../../../../enums/query.enums';
import { simulateAwait } from '../../../../utils/helpers/simulateAwait';
import { mockedSource } from './mock';

export const queryGenerateSource = async (): Promise<IGenerateSource[]> => {
  await simulateAwait(500);
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
