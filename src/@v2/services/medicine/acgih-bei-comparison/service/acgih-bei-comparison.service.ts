import { AcgihBeiComparisonRoutes } from '@v2/constants/routes/acgih-bei-comparison.routes';
import { api } from 'core/services/apiClient';

import type {
  IBrowseAcgihBeiComparisonParams,
  IBrowseAcgihBeiComparisonResponse,
} from './acgih-bei-comparison.types';

export async function browseAcgihBeiComparison(
  params: IBrowseAcgihBeiComparisonParams,
): Promise<IBrowseAcgihBeiComparisonResponse> {
  const response = await api.get<IBrowseAcgihBeiComparisonResponse>(
    AcgihBeiComparisonRoutes.BASE,
    { params },
  );
  return response.data;
}
