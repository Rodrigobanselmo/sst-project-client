import { RecTypeEnum } from 'project/enum/recType.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { resolveResidualProbabilityAfterRecChange } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/calculateSuggestedResidualProbability.util';
import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';

export type ResidualRecLike = {
  id?: string;
  recType?: RecTypeEnum | string | null;
  status?: StatusEnum | string | null;
  recName?: string | null;
};

export function withResidualProbabilityAfterRecChange(
  payload: Partial<IUpsertRiskData>,
  params: {
    realProbability?: number | null;
    currentResidual?: number | null;
    previousRecommendations: ResidualRecLike[];
    nextRecommendations: ResidualRecLike[];
  },
): Partial<IUpsertRiskData> {
  const probabilityAfter = resolveResidualProbabilityAfterRecChange({
    realProbability: params.realProbability,
    currentResidual: params.currentResidual,
    previousRecommendations: params.previousRecommendations,
    nextRecommendations: params.nextRecommendations,
  });
  if (probabilityAfter === undefined) return { ...payload };
  return { ...payload, probabilityAfter };
}

export function resolveRecsSelectedForAdd(
  options: unknown,
  alreadyLinkedIds: Array<string | number | null | undefined>,
): ResidualRecLike[] {
  const linked = new Set(
    alreadyLinkedIds
      .map((id) => (id == null ? '' : String(id)))
      .filter(Boolean),
  );

  const recs: ResidualRecLike[] = [];

  const pushIfNew = (rec: ResidualRecLike) => {
    const id = rec.id == null ? '' : String(rec.id);
    if (!id || linked.has(id)) return;
    if (recs.some((item) => item.id === id)) return;
    recs.push({ ...rec, id });
  };

  if (Array.isArray(options)) {
    for (const item of options) {
      if (typeof item === 'string' || typeof item === 'number') {
        pushIfNew({ id: String(item) });
        continue;
      }
      if (item && typeof item === 'object' && 'id' in item) {
        pushIfNew(item as ResidualRecLike);
      }
    }
    return recs;
  }

  if (options && typeof options === 'object' && 'id' in options) {
    pushIfNew(options as ResidualRecLike);
  }

  return recs;
}

export function buildRecsAttachPayload(params: {
  recsToAdd: ResidualRecLike[];
  currentRecs: ResidualRecLike[];
  realProbability?: number | null;
  currentResidual?: number | null;
}): Partial<IUpsertRiskData> {
  const recsToAdd = params.recsToAdd.filter((rec) => {
    const id = rec.id == null ? '' : String(rec.id);
    if (!id) return false;
    return !params.currentRecs.some((current) => String(current.id) === id);
  });

  if (!recsToAdd.length) return {};

  const payload: Partial<IUpsertRiskData> = {
    recs: recsToAdd.map((rec) => String(rec.id)),
  };

  return withResidualProbabilityAfterRecChange(payload, {
    realProbability: params.realProbability,
    currentResidual: params.currentResidual,
    previousRecommendations: params.currentRecs,
    nextRecommendations: [...params.currentRecs, ...recsToAdd],
  });
}

export function applyRecBulkResidual(params: {
  payload: Partial<IUpsertRiskData>;
  currentRecs: ResidualRecLike[];
  catalogMatches: ResidualRecLike[];
  namesToCreate: string[];
  recType?: RecTypeEnum | string | null;
  realProbability?: number | null;
  currentResidual?: number | null;
}): Partial<IUpsertRiskData> {
  const createdStubs: ResidualRecLike[] = params.namesToCreate.map(
    (recName) => ({
      recName,
      recType: params.recType || RecTypeEnum.ADM,
    }),
  );

  return withResidualProbabilityAfterRecChange(params.payload, {
    realProbability: params.realProbability,
    currentResidual: params.currentResidual,
    previousRecommendations: params.currentRecs,
    nextRecommendations: [
      ...params.currentRecs,
      ...params.catalogMatches,
      ...createdStubs,
    ],
  });
}
