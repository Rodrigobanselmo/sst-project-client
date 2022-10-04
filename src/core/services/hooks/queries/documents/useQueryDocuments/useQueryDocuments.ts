import { useQuery } from 'react-query';

import { DocumentTypeEnum } from 'project/enum/document.enums';
import { StatusEnum } from 'project/enum/status.enum';
import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IDocument } from 'core/interfaces/api/IDocument';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

interface IQueryContact {
  search?: string | null;
  companyId?: string;
  workspaceId?: string;
  type?: DocumentTypeEnum[];
  status?: StatusEnum[];
}

export const queryDocuments = async (
  { skip, take }: IPagination,
  companyId: string,
  query: IQueryContact,
) => {
  const queries = queryString.stringify(query);

  if ('search' in query && query.search === null) return { data: [], count: 0 };
  if (!companyId) return { data: [], count: 0 };

  const response = await api.get<IPaginationResult<IDocument[]>>(
    `${ApiRoutesEnum.DOCUMENT}?take=${take}&skip=${skip}&${queries}`.replace(
      ':companyId',
      companyId,
    ),
  );

  return response.data;
};

export function useQueryDocuments(
  page = 1,
  query = {} as IQueryContact,
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
    [QueryEnum.DOCUMENTS, _companyId, page, { ...query }],
    () => queryDocuments(pagination, _companyId || '', { ...query }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  const response = {
    data: data?.data || ([] as IDocument[]),
    count: data?.count || 0,
  };

  return { ...result, data: response.data, count: response.count };
}
