import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';
import { IPrgDocData } from '../../../../interfaces/api/IRiskData';

export const queryPrgDocs = async (
  id: string,
  companyId: string,
): Promise<IPrgDocData> => {
  const response = await api.get<IPrgDocData>(
    ApiRoutesEnum.DOC_VERSIONS.replace(':companyId', companyId) + '/' + id,
  );

  return response.data;
};

export function useQueryDocumentVersion(id: string): IReactQuery<IPrgDocData> {
  const { companyId } = useGetCompanyId();

  const { data, ...query } = useQuery(
    [QueryEnum.DOCUMENT_VERSION, companyId, id],
    () => (companyId && id ? queryPrgDocs(id, companyId) : ({} as IPrgDocData)),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  return { ...query, data: data || ({} as IPrgDocData) };
}
