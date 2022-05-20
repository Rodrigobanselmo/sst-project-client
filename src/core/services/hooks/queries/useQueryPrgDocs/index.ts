import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { emptyArrayReturn } from 'core/utils/helpers/emptyFunc';

import { QueryEnum } from '../../../../enums/query.enums';
import { IPrgDocData } from '../../../../interfaces/api/IRiskData';

export const queryPrgDocs = async (
  companyId: string,
): Promise<IPrgDocData[]> => {
  const response = await api.get<IPrgDocData[]>(
    `${ApiRoutesEnum.RISK_GROUP_DATA}/${companyId}`,
  );

  return response.data;
};

export function useQueryPrgDocs(): IReactQuery<IPrgDocData[]> {
  const { companyId } = useGetCompanyId();

  const { data, ...query } = useQuery(
    [QueryEnum.RISK_GROUP_DATA, companyId],
    () =>
      companyId
        ? queryPrgDocs(companyId)
        : <Promise<IPrgDocData[]>>emptyArrayReturn(),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  return { ...query, data: data || [] };
}
