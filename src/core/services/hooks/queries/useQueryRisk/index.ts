import { useQuery, UseQueryResult } from 'react-query';

import { QueryEnum } from '../../../../enums/query.enums';
import { IRiskFactors } from '../../../../interfaces/IRiskFactors';
import { simulateAwait } from '../../../../utils/helpers/simulateAwait';
import { mockedRisks } from './mock';

export const queryRisk = async (): Promise<IRiskFactors[]> => {
  // const response = await api.get<IRiskFactors[]>(`${url}/car/${carId}`);
  await simulateAwait(500);
  const response = {
    data: mockedRisks,
  };

  return response.data;
};

export function useQueryRisk(): UseQueryResult<IRiskFactors[]> {
  const data = useQuery(QueryEnum.RISK, () => queryRisk(), {
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  return data;
}
