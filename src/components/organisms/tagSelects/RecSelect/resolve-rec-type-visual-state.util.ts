import { RecTypeEnum } from 'project/enum/recType.enum';

import {
  isRecommendationRecTypeMissing,
  MISSING_REC_TYPE_TOOLTIP,
} from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/isRecommendationRecTypeMissing.util';

export const REC_TYPE_VISUAL_LABEL: Record<RecTypeEnum, string> = {
  [RecTypeEnum.ADM]: 'Administrativa',
  [RecTypeEnum.ENG]: 'Engenharia',
  [RecTypeEnum.EPI]: 'EPI',
};

export type RecTypeVisualState =
  | {
      kind: 'missing';
      recType: null;
      label: 'Sem classificação';
      tooltip: string;
    }
  | {
      kind: 'classified';
      recType: RecTypeEnum;
      label: string;
      tooltip: string;
    };

export function resolveRecTypeVisualState(
  recType?: RecTypeEnum | string | null,
): RecTypeVisualState {
  if (isRecommendationRecTypeMissing(recType)) {
    return {
      kind: 'missing',
      recType: null,
      label: 'Sem classificação',
      tooltip: MISSING_REC_TYPE_TOOLTIP,
    };
  }

  const type = String(recType).trim() as RecTypeEnum;
  const label = REC_TYPE_VISUAL_LABEL[type];
  return {
    kind: 'classified',
    recType: type,
    label,
    tooltip: label,
  };
}

export function stopRecSelectAdornmentEvent(event: {
  stopPropagation: () => void;
  preventDefault: () => void;
}): void {
  event.stopPropagation();
  event.preventDefault();
}

export function shouldSelectRecOnListClick(source: 'adornment' | 'item'): boolean {
  return source === 'item';
}

export type RecTypeListFilter = 'all' | RecTypeEnum;

export const REC_TYPE_LIST_FILTERS: RecTypeListFilter[] = [
  'all',
  RecTypeEnum.ADM,
  RecTypeEnum.ENG,
  RecTypeEnum.EPI,
];

/** Hierarquia de controle na lista vinculada: Engenharia → Administrativa → EPI. */
export const REC_TYPE_HIERARCHY_ORDER: Record<RecTypeEnum, number> = {
  [RecTypeEnum.ENG]: 0,
  [RecTypeEnum.ADM]: 1,
  [RecTypeEnum.EPI]: 2,
};

const UNCLASSIFIED_HIERARCHY_RANK = 3;

export function getRecTypeHierarchyRank(
  recType?: RecTypeEnum | string | null,
): number {
  const visual = resolveRecTypeVisualState(recType);
  if (visual.kind !== 'classified') return UNCLASSIFIED_HIERARCHY_RANK;
  return REC_TYPE_HIERARCHY_ORDER[visual.recType];
}

/** Ordena por hierarquia sem mutar o array original; preserva a ordem relativa na mesma categoria. */
export function sortRecsByTypeHierarchy<
  T extends { recType?: RecTypeEnum | string | null },
>(recs: T[]): T[] {
  return recs
    .map((rec, index) => ({ rec, index }))
    .sort((a, b) => {
      const rankDiff =
        getRecTypeHierarchyRank(a.rec.recType) -
        getRecTypeHierarchyRank(b.rec.recType);
      if (rankDiff !== 0) return rankDiff;
      return a.index - b.index;
    })
    .map(({ rec }) => rec);
}

export function matchesRecTypeListFilter(
  recType: RecTypeEnum | string | null | undefined,
  filter: RecTypeListFilter,
): boolean {
  if (filter === 'all') return true;
  const visual = resolveRecTypeVisualState(recType);
  return visual.kind === 'classified' && visual.recType === filter;
}

export function filterRecsByType<
  T extends { recType?: RecTypeEnum | string | null },
>(recs: T[], filter: RecTypeListFilter): T[] {
  if (filter === 'all') return recs;
  return recs.filter((rec) => matchesRecTypeListFilter(rec.recType, filter));
}

export function intersectRecTypeAndTextFilter<
  T extends { recType?: RecTypeEnum | string | null; recName?: string },
>(recs: T[], filter: RecTypeListFilter, search: string): T[] {
  const byType = filterRecsByType(recs, filter);
  const query = search.trim().toLowerCase();
  if (!query) return byType;
  return byType.filter((rec) =>
    String(rec.recName || '')
      .toLowerCase()
      .includes(query),
  );
}

export function buildRecMedQuickClassifyPayload(params: {
  rec: { id?: string; riskId?: string; companyId?: string };
  recType: RecTypeEnum;
  fallbackRiskId?: string;
}): {
  id: string;
  riskId: string;
  recType: RecTypeEnum;
  companyId?: string;
} | null {
  if (!params.rec.id) return null;
  const riskId = params.rec.riskId || params.fallbackRiskId;
  if (!riskId) return null;

  return {
    id: params.rec.id,
    riskId,
    recType: params.recType,
    ...(params.rec.companyId ? { companyId: params.rec.companyId } : {}),
  };
}
