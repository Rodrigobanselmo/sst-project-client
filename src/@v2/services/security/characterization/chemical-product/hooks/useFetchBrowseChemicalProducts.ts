import { useFetch } from '@v2/hooks/api/useFetch';

import { browseChemicalProducts } from '../service/chemical-product.service';
import { chemicalProductQueryKeys } from './chemical-product.query-keys';

export const useFetchBrowseChemicalProducts = (
  params: {
    companyId: string;
    workspaceId: string;
    includeArchived?: boolean;
    search?: string;
  },
  enabled = true,
) => {
  return useFetch({
    queryKey: [...chemicalProductQueryKeys.browse(params)],
    queryFn: () => browseChemicalProducts(params),
    enabled: enabled && Boolean(params.companyId && params.workspaceId),
    refetchOnMount: true,
  });
};
