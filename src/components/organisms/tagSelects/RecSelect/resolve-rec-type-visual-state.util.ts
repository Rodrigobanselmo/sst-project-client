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
