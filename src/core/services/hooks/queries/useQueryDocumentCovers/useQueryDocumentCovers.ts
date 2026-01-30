import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { api } from 'core/services/apiClient';
import { IDocumentCover } from '../../mutations/manager/document-cover/useMutUpsertDocumentCover';

export async function fetchDocumentCovers(
  companyId?: string,
): Promise<IDocumentCover[]> {
  if (!companyId) return [];

  const path = ApiRoutesEnum.DOCUMENT_COVER.replace(':companyId', companyId);
  const response = await api.get<IDocumentCover[]>(path);

  return response.data;
}

export function useQueryDocumentCovers(companyId?: string) {
  return useQuery(
    [QueryEnum.DOCUMENT_COVER, companyId],
    () => fetchDocumentCovers(companyId),
    {
      enabled: !!companyId,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  );
}
