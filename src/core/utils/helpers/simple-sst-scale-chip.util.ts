/**
 * Cores default SimpleSST da escala ocupacional 1–5
 * (P, S e RO em pills/tags). Nível 6 = extraordinário.
 *
 * Ausência de customização por empresa = este padrão.
 * Customização futura deve substituir a origem destes tokens,
 * não espalhar hex novo nos consumidores.
 *
 * Nível 3 usa o amarelo `scale.medium` com texto `text.dark` (#000).
 */

export type SimpleSstScaleChipColors = {
  bgcolor: string;
  color: string;
};

export type SimpleSstScaleFactorKind = 'P' | 'S';

export function getSimpleSstScaleChipColors(
  level?: number | null,
): SimpleSstScaleChipColors {
  switch (level) {
    case 1:
      return { bgcolor: 'scale.low', color: 'common.white' };
    case 2:
      return { bgcolor: 'scale.mediumLow', color: 'common.white' };
    case 3:
      return { bgcolor: 'scale.medium', color: 'text.dark' };
    case 4:
      return { bgcolor: 'scale.mediumHigh', color: 'common.white' };
    case 5:
      return { bgcolor: 'scale.high', color: 'common.white' };
    case 6:
      return { bgcolor: 'common.black', color: 'common.white' };
    default:
      return { bgcolor: 'grey.300', color: 'text.secondary' };
  }
}

export function formatSimpleSstScaleFactorLabel(
  kind: SimpleSstScaleFactorKind,
  value?: number | null,
): string {
  if (typeof value === 'number' && value > 0) return `${kind}${value}`;
  return `${kind}--`;
}

export function isSimpleSstScaleAction(
  action?: string | null,
): action is '1' | '2' | '3' | '4' | '5' | '6' {
  return (
    action === '1' ||
    action === '2' ||
    action === '3' ||
    action === '4' ||
    action === '5' ||
    action === '6'
  );
}
