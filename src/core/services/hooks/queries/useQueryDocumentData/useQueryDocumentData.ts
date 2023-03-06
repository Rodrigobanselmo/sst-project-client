import { useQuery } from 'react-query';

import { DocumentTypeEnum } from 'project/enum/document.enums';
import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';
import { IDocumentData } from '../../../../interfaces/api/IDocumentData';

export interface IQueryDocumentData {
  type?: DocumentTypeEnum;
  workspaceId: string;
  companyId: string;
}

export const queryGroupDocumentData = async ({
  companyId,
  ...query
}: IQueryDocumentData) => {
  const queries = queryString.stringify(query);

  const response = await api.get<IDocumentData>(
    `${ApiRoutesEnum.DOCUMENT_DATA}`.replace(':companyId', companyId) +
      `?${queries}`,
  );

  const data: IDocumentData = {
    ...response.data,
  };

  return data;
};

export function useQueryDocumentData(
  query: IQueryDocumentData,
): IReactQuery<IDocumentData | undefined> {
  const { getCompanyId } = useGetCompanyId();
  const companyId = getCompanyId(query);

  query.companyId = companyId;

  const { data, ...rest } = useQuery(
    [QueryEnum.DOCUMENT_DATA, query],
    () =>
      query.type && companyId
        ? queryGroupDocumentData({ ...query, companyId })
        : undefined,
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  return { ...rest, data };
}
