import { useQuery, UseQueryResult } from 'react-query';

import { IRecMed } from 'core/interfaces/api/IRecMed';

import { QueryEnum } from '../../../../enums/query.enums';
import { simulateAwait } from '../../../../utils/helpers/simulateAwait';
import { mockedRecMed } from './mock';

export const queryRisk = async (): Promise<IRecMed[]> => {
  // const response = await api.get<IRiskFactors[]>(`${url}/car/${carId}`);
  await simulateAwait(500);
  const response = {
    data: mockedRecMed,
  };

  return response.data;
};

export function useQueryRecMed(): UseQueryResult<IRecMed[]> {
  const data = useQuery(QueryEnum.REC_MED, () => queryRisk(), {
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  return data;
}
