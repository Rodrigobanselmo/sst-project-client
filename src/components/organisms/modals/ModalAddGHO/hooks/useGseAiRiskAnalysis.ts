import { useMemo } from 'react';

import { IGho } from 'core/interfaces/api/IGho';
import { useQueryRiskGroupData } from 'core/services/hooks/queries/useQueryRiskGroupData';

import { useCharacterizationAiRiskAnalysisState } from '../../ModalAddCharacterization/hooks/useCharacterizationAiRiskAnalysisState';
import { getCurrentRiskGroupId } from '../../ModalAddCharacterization/utils/get-current-risk-group-id.util';
import { getGseLinkedWorkspaceIds } from '../get-gse-linked-workspace-ids.util';
import { initialAddGhoState } from './useAddGho';

/** Instância única da análise IA do GSE: geral, por risco, por campo e colunas. */
export function useGseAiRiskAnalysis(params: {
  companyId: string;
  ghoData: typeof initialAddGhoState;
  ghoQuery: IGho;
}) {
  const workspaceIds = getGseLinkedWorkspaceIds(params.ghoData, params.ghoQuery);
  const sessionWorkspaceKey = workspaceIds.slice().sort().join(',') || 'gse';
  const { data: riskGroupData } = useQueryRiskGroupData(
    params.companyId || undefined,
  );
  const riskGroupId = useMemo(
    () => getCurrentRiskGroupId(riskGroupData),
    [riskGroupData],
  );

  const analysis = useCharacterizationAiRiskAnalysisState({
    gseId: params.ghoData.id,
    riskGroupId,
    companyId: params.companyId,
    workspaceId: sessionWorkspaceKey,
  });

  return { analysis, riskGroupId };
}
