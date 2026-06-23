import { getMatrizRisk } from 'core/utils/helpers/matriz';

export const probabilityMap: Record<number, { label: string; color: string }> = {
  1: { label: 'Desprezível', color: '#3cbe7d' },
  2: { label: 'Pequena', color: '#8fa728' },
  3: { label: 'Moderada', color: '#d9d10b' },
  4: { label: 'Significativa', color: '#d96c2f' },
  5: { label: 'Excessiva', color: '#F44336' },
  0: { label: 'não contabilizar', color: '#eeeeee' },
};

export const severityMap: Record<number, { label: string; color: string }> = {
  1: { label: 'Desprezível', color: '#3cbe7d' },
  2: { label: 'Pequena', color: '#8fa728' },
  3: { label: 'Moderada', color: '#d9d10b' },
  4: { label: 'Significante', color: '#d96c2f' },
  5: { label: 'Excessiva', color: '#F44336' },
  0: { label: 'Não informado', color: '#eeeeee' },
};

export const occupationalRiskColorMap: Record<string, string> = {
  'Muito Baixo': '#3cbe7d',
  Baixo: '#8fa728',
  Moderado: '#d9d10b',
  Alto: '#d96c2f',
  'Muito Alto': '#F44336',
  'Não informado': '#eeeeee',
};

export const formatTwoDigits = (n: number) => String(n).padStart(2, '0');

export const isValidMatrixValue = (n: unknown): n is number =>
  typeof n === 'number' && Number.isFinite(n) && n >= 1 && n <= 5;

const CLASSIFICATION_BADGE_WIDTH_SCALE = 0.76;
const SECTOR_ROW_WIDTH_REDUCTION = 0.83;
const SECTOR_ROW_WIDTH_ADJUSTMENT = 1.59;

const SECTOR_ROW_ELEMENT_LABELS = [
  'Adicionar risco a este setor',
  'Analisar IA do agrupamento',
  'Analisar IA novamente do agrupamento',
  'Analisando IA...',
  'Probabilidade: 04 Significativa',
  'Severidade: 05 Excessiva',
  'Risco Ocupacional: Não informado',
];

const buildSectorRowElementWidth = () => {
  const longestBadgeLabelLength = Math.max(
    'Probabilidade: 04 Significativa'.length,
    'Severidade: 05 Excessiva'.length,
    'Risco Ocupacional: Não informado'.length,
  );
  const currentMaxBadgeWidthCh = Math.ceil(
    longestBadgeLabelLength * CLASSIFICATION_BADGE_WIDTH_SCALE,
  );
  const reducedBadgeWidthCh = Math.ceil(
    currentMaxBadgeWidthCh * SECTOR_ROW_WIDTH_REDUCTION,
  );
  const longestLabelLength = Math.max(
    ...SECTOR_ROW_ELEMENT_LABELS.map((label) => label.length),
  );
  const widthForCompactControlsCh = Math.ceil(longestLabelLength * 0.62);
  const baseWidthCh = Math.max(reducedBadgeWidthCh, widthForCompactControlsCh);

  return `${Math.ceil(baseWidthCh * SECTOR_ROW_WIDTH_ADJUSTMENT)}ch`;
};

export const SECTOR_ROW_ELEMENT_WIDTH = buildSectorRowElementWidth();
export const SECTOR_ROW_ELEMENT_HEIGHT = 32;
export const SECTOR_ROW_STACK_GAP = 4;
export const SECTOR_ROW_OCCUPATIONAL_BADGE_HEIGHT =
  SECTOR_ROW_ELEMENT_HEIGHT * 2 + SECTOR_ROW_STACK_GAP;

export const sectorRowStackSx = {
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: `${SECTOR_ROW_STACK_GAP}px`,
};

export const sectorRowElementBaseSx = {
  boxSizing: 'border-box' as const,
  flexShrink: 0,
  width: SECTOR_ROW_ELEMENT_WIDTH,
  minWidth: SECTOR_ROW_ELEMENT_WIDTH,
  maxWidth: SECTOR_ROW_ELEMENT_WIDTH,
  minHeight: SECTOR_ROW_ELEMENT_HEIGHT,
  height: SECTOR_ROW_ELEMENT_HEIGHT,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center' as const,
  whiteSpace: 'nowrap' as const,
  px: 0.5,
  fontSize: '0.7rem',
  lineHeight: 1.2,
};

export const sectorActionButtonSx = {
  ...sectorRowElementBaseSx,
  py: 0,
  fontWeight: 600,
};

export const groupCollectiveRiskButtonSx = {
  ...sectorActionButtonSx,
  whiteSpace: 'pre-line' as const,
  height: 'auto',
  minHeight: SECTOR_ROW_ELEMENT_HEIGHT,
  py: 0.25,
  fontSize: '0.62rem',
  lineHeight: 1.15,
  wordBreak: 'break-word' as const,
};

export const groupAnalyzeButtonSx = {
  ...sectorActionButtonSx,
  fontSize: '0.65rem',
  lineHeight: 1.15,
  whiteSpace: 'normal' as const,
  height: 'auto',
  minHeight: SECTOR_ROW_ELEMENT_HEIGHT,
  py: 0.25,
};

export const badgeSx = (bg: string) => ({
  ...sectorRowElementBaseSx,
  backgroundColor: bg,
  borderRadius: 1,
  border: '1px solid',
  borderColor: 'grey.200',
});

export const occupationalRiskBadgeSx = (bg: string) => ({
  ...badgeSx(bg),
  position: 'relative' as const,
  height: SECTOR_ROW_OCCUPATIONAL_BADGE_HEIGHT,
  minHeight: SECTOR_ROW_OCCUPATIONAL_BADGE_HEIGHT,
  borderColor: 'grey.400',
});

export const sectorRowClassificationDotsSx = {
  position: 'absolute' as const,
  top: 4,
  left: 4,
  display: 'flex',
  gap: '3px',
  pointerEvents: 'none' as const,
};

export const sectorRowClassificationDotSx = (color: string) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: color,
  border: '1px solid #fff',
  flexShrink: 0,
});

export const sectorRowBadgeTextSx = {
  fontSize: '0.7rem',
  lineHeight: 1.2,
  textAlign: 'center',
  width: '100%',
};

export function resolveOccupationalRiskLabel(
  severity: number | undefined,
  probability: number,
): string {
  const hasValidSeverity = isValidMatrixValue(severity);
  const hasValidProbability = isValidMatrixValue(probability);

  if (!hasValidSeverity || !hasValidProbability) {
    return 'Não informado';
  }

  const matriz = getMatrizRisk(severity!, probability);

  if (!matriz || matriz.level === 0) return 'Não informado';
  if (matriz.level >= 5) return 'Muito Alto';
  return matriz.label;
}
