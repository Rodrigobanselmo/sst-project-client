import {
  resolveResidualProbabilityAfterRecChange,
  withResidualOnlyWhenResolved,
} from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/calculateSuggestedResidualProbability.util';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRecMed } from 'core/interfaces/api/IRiskFactors';
import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';

import { isExistingControlCorrespondence } from '../utils/existing-control-correspondence.util';

export type RecAttachResidualOptions = {
  /** Mesma base do Adicionar da coluna (`residualRecs`): sem correspondências EXISTING_CONTROL. */
  excludeExistingControl?: boolean;
};

export const validRiskDataRecs = (
  riskData?: IRiskData | null,
  options?: RecAttachResidualOptions,
): IRecMed[] =>
  (riskData?.recs ?? []).filter(
    (r): r is IRecMed =>
      !!r &&
      typeof r.id === 'string' &&
      !!r.id &&
      !(options?.excludeExistingControl && isExistingControlCorrespondence(r)),
  );

/** Residual só é enviado quando a linha já traz a avaliação do estabelecimento do cabeçalho. */
export function withRecAttachResidual(params: {
  payload: Partial<IUpsertRiskData>;
  riskData?: IRiskData | null;
  nextRecommendations: IRecMed[];
  headerWorkspaceId?: string | null;
  options?: RecAttachResidualOptions;
}): Partial<IUpsertRiskData> {
  const probabilityAfter = resolveResidualProbabilityAfterRecChange({
    realProbability: params.riskData?.probability,
    currentResidual: params.riskData?.probabilityAfter,
    previousRecommendations: validRiskDataRecs(params.riskData, params.options),
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
  options?: RecAttachResidualOptions,
): Partial<IUpsertRiskData> {
  return withRecAttachResidual({
    payload: { recs: [rec.id] },
    riskData,
    nextRecommendations: [...validRiskDataRecs(riskData, options), rec],
    headerWorkspaceId,
    options,
  });
}
