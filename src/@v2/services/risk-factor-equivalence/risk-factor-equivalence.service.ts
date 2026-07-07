import { RiskFactorEquivalenceRoutes } from '@v2/constants/routes/risk-factor-equivalence.routes';
import { api } from 'core/services/apiClient';

import type {
  BrowseRiskFactorEquivalencesParams,
  RiskFactorEquivalence,
  SearchSystemRisksParams,
  SystemRiskSearchItem,
} from './risk-factor-equivalence.types';

export async function browseRiskFactorEquivalences(
  params: BrowseRiskFactorEquivalencesParams,
): Promise<RiskFactorEquivalence[]> {
  const response = await api.get<RiskFactorEquivalence[]>(
    RiskFactorEquivalenceRoutes.BASE,
    { params },
  );
  return response.data;
}

export async function searchSystemRisks(
  params: SearchSystemRisksParams,
): Promise<SystemRiskSearchItem[]> {
  const response = await api.get<SystemRiskSearchItem[]>(
    RiskFactorEquivalenceRoutes.SEARCH_SYSTEM_RISKS,
    { params },
  );
  return response.data;
}
