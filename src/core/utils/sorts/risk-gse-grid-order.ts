import { RiskEnum, RiskOrderEnum } from 'project/enum/risk.enums';

import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

/**
 * Ordem na grade GSE (Caracterização / RiskTool): alinha com a promoção visual
 * PSIC quando existe subtipo Psicossociais — mesmo critério do RiskBox.
 * Valores .5 ficam logo após o tipo base puro (ex.: ERG=4, PSIC ergonômico=4.5).
 */
export function effectiveRiskOrderForGSEGrid(
  risk: IRiskFactors | undefined,
): number {
  if (!risk) return 999;
  if (risk.representAll && risk.type === RiskEnum.OUTROS) {
    return RiskOrderEnum.OUTROS;
  }
  const isPsicossocial = risk.subTypes?.some(
    (s) => s.sub_type?.name === 'Psicossociais',
  );
  const base =
    RiskOrderEnum[risk.type as keyof typeof RiskOrderEnum] ?? 99;
  if (isPsicossocial) return base + 0.5;
  return base;
}
