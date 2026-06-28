import { AcgihBeiComparisonRoutes } from '@v2/constants/routes/acgih-bei-comparison.routes';
import { refreshToken } from 'core/contexts/AuthContext';
import { api } from 'core/services/apiClient';
import { downloadFile } from 'core/utils/helpers/downloadFile';

import type { IBrowseAcgihBeiComparisonParams } from './acgih-bei-comparison.types';

/** Exporta a comparação (read-only) respeitando os filtros atuais da tela. */
export async function exportAcgihBeiComparison(
  params?: Pick<
    IBrowseAcgihBeiComparisonParams,
    | 'search'
    | 'comparisonStatus'
    | 'suggestedAction'
    | 'confidence'
    | 'reviewDecision'
    | 'hasReview'
  >,
) {
  const { token } = await refreshToken();
  const response = await api.get(AcgihBeiComparisonRoutes.EXPORT, {
    responseType: 'blob',
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  await downloadFile(response);
}
