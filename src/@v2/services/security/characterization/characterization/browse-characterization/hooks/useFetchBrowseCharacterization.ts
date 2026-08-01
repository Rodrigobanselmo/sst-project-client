import { useQuery } from '@tanstack/react-query';

import { QueryKeyCharacterizationEnum } from '@v2/constants/enums/characterization-query-key.enum';
import { browseCharacterization } from '../service/browse-characterization.service';
import { BrowseCharacterizationParams } from '../service/browse-characterization.types';

export const useFetchBrowseCharaterizations = (
  params: BrowseCharacterizationParams,
  options?: {
    enabled?: boolean;
  },
) => {
  const includeInactive = params.filters?.includeInactive === true;

  const { data, error, isError, ...response } = useQuery({
    queryFn: async ({ signal }) => {
      return browseCharacterization(params, { signal });
    },
    // includeInactive entra na chave de forma explícita para garantir
    // request distinta ao alternar o toggle (não reaproveitar cache do outro modo).
    queryKey: [
      QueryKeyCharacterizationEnum.CHARACTERIZATIONS,
      params.companyId,
      params.workspaceId,
      params.filters?.search,
      params.pagination?.page,
      params.pagination?.limit,
      params.orderBy,
      params.filters,
      includeInactive,
    ],
    enabled: options?.enabled ?? true,
    refetchOnMount: true,
    // Sem keepPreviousData: erro/resposta antiga não pode mascarar total (ex.: 738).
  });

  return {
    ...response,
    error,
    isError,
    // Em erro, não expor data stale como resultado válido da flag atual.
    characterizations: isError ? undefined : data,
  };
};
