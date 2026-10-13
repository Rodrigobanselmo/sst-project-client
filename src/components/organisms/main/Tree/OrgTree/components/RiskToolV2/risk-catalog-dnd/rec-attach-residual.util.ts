import {
  resolveResidualProbabilityAfterRecChange,
  withResidualOnlyWhenResolved,
} from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/calculateSuggestedResidualProbability.util';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRecMed } from 'core/interfaces/api/IRiskFactors';
import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';

export const validRiskDataRecs = (riskData?: IRiskData | null): IRecMed[] =>
  (riskData?.recs ?? []).filter(
    (r): r is IRecMed => !!r && typeof r.id === 'string' && !!r.id,
  );

/** Residual só é enviado quando a linha já traz a avaliação do estabelecimento do cabeçalho. */
export function withRecAttachResidual(params: {
  payload: Partial<IUpsertRiskData>;
  riskData?: IRiskData | null;
  nextRecommendations: IRecMed[];
  headerWorkspaceId?: string | null;
}): Partial<IUpsertRiskData> {
  const probabilityAfter = resolveResidualProbabilityAfterRecChange({
    realProbability: params.riskData?.probability,
    currentResidual: params.riskData?.probabilityAfter,
    previousRecommendations: validRiskDataRecs(params.riskData),
    nextRecommendations: params.nextRecommendations,
  });

  const payload: Partial<IUpsertRiskData> = { ...params.payload };
  if (probabilityAfter !== undefined) {
    payload.probabilityAfter = probabilityAfter;
  }
  return withResidualOnlyWhenResolved(payload, {
    headerWorkspaceId: params.headerWorkspaceId,
    riskData: params.riskData,
  });
}

export function buildRecAttachPayload(
  rec: IRecMed,
  riskData?: IRiskData | null,
  headerWorkspaceId?: string | null,
): Partial<IUpsertRiskData> {
  return withRecAttachResidual({
    payload: { recs: [rec.id] },
    riskData,
    nextRecommendations: [...validRiskDataRecs(riskData), rec],
    headerWorkspaceId,
  });
}
