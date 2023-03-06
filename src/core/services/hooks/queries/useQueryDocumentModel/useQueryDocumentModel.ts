import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IDocumentModel } from 'core/interfaces/api/IDocumentModel';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

export interface IQueryDocumentModel {
  companyId?: string;
}

export const queryDocumentModel = async (
  id: number,
  { companyId, ...query }: IQueryDocumentModel,
) => {
  if (!companyId) return;

  const queries = queryString.stringify(query);

  const response = await api.get<IDocumentModel>(
    `${ApiRoutesEnum.DOCUMENT_MODEL}/${id}`.replace(':companyId', companyId) +
      `?${queries}`,
  );

  return response.data;
};

export function useQueryDocumentModel(
  id: number,
  query: IQueryDocumentModel = {},
) {
  const { getCompanyId } = useGetCompanyId();
  const companyId = getCompanyId(query);

  query.companyId = companyId;

  const { data, ...rest } = useQuery(
    [QueryEnum.DOCUMENT_MODEL, id, query],
    () =>
      id && companyId
        ? queryDocumentModel(id, { ...query, companyId })
        : undefined,
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  return { ...rest, data };
}
