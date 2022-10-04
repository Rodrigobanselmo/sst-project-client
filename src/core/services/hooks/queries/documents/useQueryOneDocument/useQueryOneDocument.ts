import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IDocument } from 'core/interfaces/api/IDocument';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';
import { emptyMapReturn } from 'core/utils/helpers/emptyFunc';

export const queryOneDocument = async (id: number, companyId: string) => {
  const response = await api.get<IDocument>(
    `${ApiRoutesEnum.DOCUMENT}/${id}`.replace(':companyId', companyId),
  );
  return response.data;
};

export function useQueryOneDocument({
  id,
  getCompanyId,
}: {
  id: number | undefined;
  getCompanyId?: string | null;
}): IReactQuery<IDocument> {
  const { companyId } = useGetCompanyId();
  const companyID = getCompanyId || companyId;

  const { data, ...query } = useQuery(
    [QueryEnum.DOCUMENTS, companyID, id],
    () =>
      companyID && id
        ? queryOneDocument(id, companyID)
        : <Promise<IDocument>>emptyMapReturn(),
    {
      staleTime: 1000 * 60 * 60, // 60 minute
    },
  );

  return { ...query, data: data || ({} as unknown as IDocument) };
}
