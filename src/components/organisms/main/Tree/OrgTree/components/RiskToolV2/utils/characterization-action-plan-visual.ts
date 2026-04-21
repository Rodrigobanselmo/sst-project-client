import { SxProps } from '@mui/material';

import { ActionPlanStatusTypeMap } from '@v2/components/organisms/STable/implementation/SActionPlanTable/maps/action-plan-status-type-map';
import { ActionPlanStatusEnum } from '@v2/models/security/enums/action-plan-status.enum';
import palette from 'configs/theme/palette';
import { IRiskData, IRiskDataRec } from 'core/interfaces/api/IRiskData';
import { StatusEnum } from 'project/enum/status.enum';

function dataRecsForWorkspace(
  dataRecs: IRiskDataRec[] | undefined,
  workspaceId?: string,
): IRiskDataRec[] {
  if (!dataRecs?.length) return [];
  if (!workspaceId) return dataRecs;
  const scoped = dataRecs.filter((r) => r.workspaceId === workspaceId);
  return scoped.length ? scoped : dataRecs;
}

export function getRecommendationPlanStatus(
  data: IRiskData | undefined,
  recMedId: string,
  workspaceId?: string,
): StatusEnum | undefined {
  return dataRecsForWorkspace(data?.dataRecs, workspaceId).find(
    (r) => r.recMedId === recMedId,
  )?.status;
}

/** Há registro de medida derivada ligada a esta recomendação (payload real; não inferir só por status DONE). */
export function recommendationHasDerivedMeasureLink(
  data: IRiskData | undefined,
  sourceRecMedId: string,
  workspaceId?: string,
): boolean {
  const links = data?.riskFactorDataRecDerivedMeasures;
  if (!links?.length) return false;
  const scoped = workspaceId
    ? links.filter((l) => l.workspaceId === workspaceId)
    : links;
  const pool = scoped.length ? scoped : links;
  return pool.some((l) => l.sourceRecMedId === sourceRecMedId);
}

/**
 * Status para o tooltip da recomendação: ausência de `dataRec`, `status` vazio
 * ou valor não mapeado no plano → trata como Pendente (estado padrão antes de ação no plano).
 */
/** Ausência de `dataRec` ou status explícito = equivalente a Pendente para exclusão. */
export function isRecMedRemovableFromActionPlanStatus(
  status?: StatusEnum | null,
): boolean {
  if (status === undefined || status === null) return true;
  return status === StatusEnum.PENDING;
}

export function isRecommendationDeletionAllowed(
  data: IRiskData | undefined,
  recMedId: string,
  workspaceId?: string,
): boolean {
  const rows = dataRecsForWorkspace(data?.dataRecs, workspaceId).filter(
    (r) => r.recMedId === recMedId,
  );
  if (!rows.length) return true;
  return rows.every((r) => isRecMedRemovableFromActionPlanStatus(r.status));
}

export function getRecommendationPlanTooltipStatus(
  data: IRiskData | undefined,
  recMedId: string,
  workspaceId?: string,
): StatusEnum {
  const row = dataRecsForWorkspace(data?.dataRecs, workspaceId).find(
    (r) => r.recMedId === recMedId,
  );
  const raw = row?.status;
  if (
    raw !== undefined &&
    raw !== null &&
    planStatusToActionPlanKey(raw as StatusEnum)
  ) {
    return raw as StatusEnum;
  }
  return StatusEnum.PENDING;
}

export function getDerivedMeasurePlanStatus(
  data: IRiskData | undefined,
  derivedRecMedId: string,
  workspaceId?: string,
): StatusEnum | undefined {
  const links = data?.riskFactorDataRecDerivedMeasures;
  if (!links?.length) return undefined;
  const scoped = workspaceId
    ? links.filter((l) => l.workspaceId === workspaceId)
    : links;
  const pool = scoped.length ? scoped : links;
  return pool.find((l) => l.derivedRecMedId === derivedRecMedId)
    ?.riskFactorDataRec?.status;
}

/**
 * Status para tooltip de medida derivada: só aplica quando existe vínculo de derivação;
 * status ausente ou não mapeável no plano → Pendente.
 */
export function getDerivedMeasureTooltipPlanStatus(
  data: IRiskData | undefined,
  derivedRecMedId: string,
  workspaceId?: string,
): StatusEnum | undefined {
  const links = data?.riskFactorDataRecDerivedMeasures;
  if (!links?.length) return undefined;
  const scoped = workspaceId
    ? links.filter((l) => l.workspaceId === workspaceId)
    : links;
  const pool = scoped.length ? scoped : links;
  const link = pool.find((l) => l.derivedRecMedId === derivedRecMedId);
  if (!link) return undefined;
  const raw = link.riskFactorDataRec?.status as StatusEnum | undefined;
  if (
    raw !== undefined &&
    raw !== null &&
    planStatusToActionPlanKey(raw)
  ) {
    return raw;
  }
  return StatusEnum.PENDING;
}

export function getCharacterizationPlanItemTintSx(
  status?: StatusEnum,
): SxProps | undefined {
  if (!status) return undefined;
  if (!(status in ActionPlanStatusTypeMap)) return undefined;
  const { backgroundColor, borderColor } =
    ActionPlanStatusTypeMap[status as unknown as ActionPlanStatusEnum].schema;
  return {
    backgroundColor,
    /** Plano de ação: borda contínua mais visível (não pontilhada como levantamento prévio). */
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor,
  };
}

export type CharacterizationPlanStatusTooltipDetails = {
  statusLabel: string;
  /** Chip otimizado para fundo escuro do tooltip (contraste). */
  chipBackgroundColor: string;
  chipTextColor: string;
  showTransformedNote: boolean;
};

function planStatusToActionPlanKey(
  status: StatusEnum,
): ActionPlanStatusEnum | undefined {
  const asPlan = status as unknown as ActionPlanStatusEnum;
  if (ActionPlanStatusTypeMap[asPlan]) return asPlan;
  return undefined;
}

/** Cores do badge de status no tooltip (painel escuro + texto claro no chip). */
function getTooltipStatusChipColors(planKey: ActionPlanStatusEnum): {
  chipBackgroundColor: string;
  chipTextColor: string;
} {
  switch (planKey) {
    case ActionPlanStatusEnum.PENDING:
      return {
        chipBackgroundColor: palette.grey[700],
        chipTextColor: palette.grey[50],
      };
    case ActionPlanStatusEnum.PROGRESS:
      return {
        chipBackgroundColor: palette.schema.blue,
        chipTextColor: '#ffffff',
      };
    case ActionPlanStatusEnum.DONE:
      return {
        chipBackgroundColor: palette.success.main,
        chipTextColor: '#ffffff',
      };
    case ActionPlanStatusEnum.CANCELED:
    case ActionPlanStatusEnum.REJECTED:
      return {
        chipBackgroundColor: palette.schema.red,
        chipTextColor: '#ffffff',
      };
    default:
      return {
        chipBackgroundColor: palette.grey[700],
        chipTextColor: palette.grey[50],
      };
  }
}

/** Dados para rótulo de status no tooltip (rótulo alinhado ao mapa do Plano de Ação). */
export function getPlanStatusTooltipDetails(
  status?: StatusEnum,
): CharacterizationPlanStatusTooltipDetails | undefined {
  if (!status) return undefined;
  const planKey = planStatusToActionPlanKey(status);
  if (!planKey) return undefined;
  const entry = ActionPlanStatusTypeMap[planKey];
  const { chipBackgroundColor, chipTextColor } =
    getTooltipStatusChipColors(planKey);
  return {
    statusLabel: entry.label,
    chipBackgroundColor,
    chipTextColor,
    showTransformedNote: status === StatusEnum.DONE,
  };
}
