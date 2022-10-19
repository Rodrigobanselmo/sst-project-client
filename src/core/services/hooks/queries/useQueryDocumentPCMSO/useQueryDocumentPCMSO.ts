import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';
import { IDocumentPCMSO } from '../../../../interfaces/api/IDocumentPCMSO';

export const queryGroupDocumentPCMSO = async (
  companyId: string,
): Promise<IDocumentPCMSO> => {
  const response = await api.get<IDocumentPCMSO>(
    `${ApiRoutesEnum.DOCUMENT_PCMSO}/${companyId}`,
  );

  const data: IDocumentPCMSO = {
    ...response.data,
  };

  return data;
};

export function useQueryDocumentPCMSO(): IReactQuery<
  IDocumentPCMSO | undefined
> {
  const { companyId } = useGetCompanyId();

  const { data, ...query } = useQuery(
    [QueryEnum.DOCUMENT_PCMSO, companyId],
    () => (companyId ? queryGroupDocumentPCMSO(companyId) : undefined),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  return { ...query, data };
}
