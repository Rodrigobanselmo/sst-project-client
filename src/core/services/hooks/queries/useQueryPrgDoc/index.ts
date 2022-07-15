import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';
import { IPrgDocData } from '../../../../interfaces/api/IRiskData';

export const queryPrgDocs = async (
  id: string,
  riskGroupId: string,
  companyId: string,
): Promise<IPrgDocData> => {
  const response = await api.get<IPrgDocData>(
    ApiRoutesEnum.RISK_GROUP_DOCS.replace(':riskGroupId', riskGroupId).replace(
      ':companyId',
      companyId,
    ) +
      '/' +
      id,
  );

  return response.data;
};

export function useQueryPrgDoc(
  id: string,
  riskGroupId: string,
): IReactQuery<IPrgDocData> {
  const { companyId } = useGetCompanyId();

  const { data, ...query } = useQuery(
    [QueryEnum.RISK_GROUP_DOC, companyId, riskGroupId, id],
    () =>
      companyId && riskGroupId && id
        ? queryPrgDocs(id, riskGroupId, companyId)
        : ({} as IPrgDocData),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  return { ...query, data: data || ({} as IPrgDocData) };
}
