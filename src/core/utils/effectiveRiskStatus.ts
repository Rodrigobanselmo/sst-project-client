import { StatusEnum } from 'project/enum/status.enum';

/**
 * Estado operacional canônico do fator de risco.
 * deleted_at preenchido sempre implica Inativo (mesmo se status legado = ACTIVE).
 */
export function effectiveRiskStatus(risk: {
  status?: StatusEnum | string | null;
  deleted_at?: string | Date | null;
}): StatusEnum {
  if (risk.deleted_at != null && risk.deleted_at !== '') {
    return StatusEnum.INACTIVE;
  }
  if (risk.status === StatusEnum.INACTIVE || risk.status === 'INACTIVE') {
    return StatusEnum.INACTIVE;
  }
  return StatusEnum.ACTIVE;
}
