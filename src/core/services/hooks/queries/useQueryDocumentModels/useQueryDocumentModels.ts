import { useQuery } from 'react-query';

import { DocumentTypeEnum } from 'project/enum/document.enums';
import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IDocumentModel } from 'core/interfaces/api/IDocumentModel';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

export interface IQueryDocumentModels {
  id?: number[];
  companyId?: string;
  search?: string;
  type?: DocumentTypeEnum;
  showInactive?: boolean;
  all?: boolean;
}

export const queryDocumentModels = async (
  { skip, take }: IPagination,
  companyId: string,
  query: IQueryDocumentModels,
) => {
  const queries = queryString.stringify(query);

  if ('search' in query && query.search === null) return { data: [], count: 0 };
  if (!companyId) return { data: [], count: 0 };

  const response = await api.get<IPaginationResult<IDocumentModel[]>>(
    `${ApiRoutesEnum.DOCUMENT_MODEL}?take=${take}&skip=${skip}&${queries}`.replace(
      ':companyId',
      companyId,
    ),
  );

  return response.data;
};

export function useQueryDocumentModels(
  page = 1,
  query = {} as IQueryDocumentModels,
  take = 20,
  companyID?: string,
) {
  const { companyId } = useGetCompanyId();
  const pagination: IPagination = {
    skip: (page - 1) * (take || 20),
    take: take || 20,
  };

  const _companyId = companyID || companyId;

  const { data, ...result } = useQuery(
    [QueryEnum.DOCUMENT_MODEL, _companyId, page, { ...query }],
    () => queryDocumentModels(pagination, _companyId || '', { ...query }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  const response = {
    data: data?.data || ([] as IDocumentModel[]),
    count: data?.count || 0,
  };

  return { ...result, data: response.data, count: response.count };
}
