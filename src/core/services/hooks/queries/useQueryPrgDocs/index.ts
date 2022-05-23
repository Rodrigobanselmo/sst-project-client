import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { emptyArrayReturn } from 'core/utils/helpers/emptyFunc';
import { sortData } from 'core/utils/sorts/data.sort';

import { QueryEnum } from '../../../../enums/query.enums';
import { IPrgDocData } from '../../../../interfaces/api/IRiskData';

export const queryPrgDocs = async (
  riskGroupId: string,
  companyId: string,
): Promise<IPrgDocData[]> => {
  const response = await api.get<IPrgDocData[]>(
    `${ApiRoutesEnum.RISK_GROUP_DOCS}/${riskGroupId}/${companyId}`,
  );

  return response.data
    ? response.data.sort((a, b) => sortData(b, a, 'created_at'))
    : [];
};

export function useQueryPrgDocs(
  riskGroupId: string,
): IReactQuery<IPrgDocData[]> {
  const { companyId } = useGetCompanyId();

  const { data, ...query } = useQuery(
    [QueryEnum.RISK_GROUP_DOCS, companyId, riskGroupId],
    () =>
      companyId
        ? queryPrgDocs(riskGroupId, companyId)
        : <Promise<IPrgDocData[]>>emptyArrayReturn(),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  return { ...query, data: data || [] };
}
