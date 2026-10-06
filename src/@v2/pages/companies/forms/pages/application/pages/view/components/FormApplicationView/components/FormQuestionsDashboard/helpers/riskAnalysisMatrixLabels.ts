import {
  acceptSystemRiskMatrixPresentation,
  resolveSystemAxisLevelChipColors,
  resolveSystemOccupationalChipColors,
  type AcceptedSystemRiskMatrixPresentation,
} from '@v2/services/security/risk-matrix/presentation/system-risk-matrix-presentation.util';
import palette from 'configs/theme/palette';
import { lightSurfaceTokens } from 'configs/theme/semantic-surfaces';
import { getMatrizRisk } from 'core/utils/helpers/matriz';

const probabilityLabels: Record<number, string> = {
  1: 'Desprezível',
  2: 'Pequena',
  3: 'Moderada',
  4: 'Significativa',
  5: 'Excessiva',
};

const severityLabels: Record<number, string> = {
  1: 'Desprezível',
  2: 'Pequena',
  3: 'Moderada',
  4: 'Significante',
  5: 'Excessiva',
};

/**
 * Tokens que o fallback oficial (`getSimpleSstScaleChipColors`) devolve.
 * O PDF não consome token de tema: materializa o mesmo palette da tela clara.
 */
const PDF_THEME_COLOR: Record<string, string> = {
  'scale.low': palette.scale.low,
  'scale.mediumLow': palette.scale.mediumLow,
  'scale.medium': palette.scale.medium,
  'scale.mediumHigh': palette.scale.mediumHigh,
  'scale.high': palette.scale.high,
  'scale.veryHigh': palette.scale.veryHigh,
  'common.white': '#FFFFFF',
  'common.black': '#000000',
  'text.dark': palette.text.dark,
  'text.secondary': lightSurfaceTokens.text.secondary,
  'grey.300': palette.grey[300],
};

const CONCRETE_COLOR = /^(?:#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|rgba?\()/;

const formatTwoDigits = (n: number) => String(n).padStart(2, '0');

const isValidMatrixValue = (n: unknown): n is number =>
  typeof n === 'number' && Number.isFinite(n) && n >= 1 && n <= 5;

export type SectorRiskClassificationPdf = {
  probabilityLabel: string;
  probabilityColor: string;
  probabilityTextColor: string;
  severityLabel: string;
  severityColor: string;
  severityTextColor: string;
  occupationalRiskLabel: string;
  occupationalRiskColor: string;
  occupationalRiskTextColor: string;
};

function materializePdfColor(value: string): string {
  if (CONCRETE_COLOR.test(value)) return value;
  return PDF_THEME_COLOR[value] ?? palette.grey[300];
}

function materializePdfChip(colors: { bgcolor: string; color: string }) {
  return {
    backgroundColor: materializePdfColor(colors.bgcolor),
    textColor: materializePdfColor(colors.color),
  };
}

export async function loadSystemRiskMatrixPresentationForPdf(
  companyId: string | null | undefined,
): Promise<AcceptedSystemRiskMatrixPresentation | null> {
  if (!companyId) return null;

  try {
    const { readSystemRiskMatrixPresentation } = await import(
      '@v2/services/security/risk-matrix/service/risk-matrix.service'
    );
    return acceptSystemRiskMatrixPresentation(
      await readSystemRiskMatrixPresentation(companyId),
    );
  } catch {
    return null;
  }
}

export function buildSectorRiskClassificationPdf(
  severity: number,
  probability: number,
  presentation?: AcceptedSystemRiskMatrixPresentation | null,
): SectorRiskClassificationPdf {
  const hasValidSeverity = isValidMatrixValue(severity);
  const hasValidProbability = isValidMatrixValue(probability);
  const acceptedPresentation = presentation ?? null;

  const matriz =
    hasValidSeverity && hasValidProbability
      ? getMatrizRisk(severity, probability)
      : null;

  const occupationalRiskLabel =
    !matriz || matriz.level === 0
      ? 'Não informado'
      : matriz.level >= 5
        ? 'Muito Alto'
        : matriz.label;

  const occupationalLevel =
    !matriz || matriz.level === 0 ? null : matriz.level;

  const probabilityChip = materializePdfChip(
    resolveSystemAxisLevelChipColors(
      hasValidProbability ? probability : null,
      acceptedPresentation,
    ),
  );
  const severityChip = materializePdfChip(
    resolveSystemAxisLevelChipColors(
      hasValidSeverity ? severity : null,
      acceptedPresentation,
    ),
  );
  const occupationalChip = materializePdfChip(
    resolveSystemOccupationalChipColors(occupationalLevel, acceptedPresentation),
  );

  return {
    probabilityLabel: hasValidProbability
      ? `${formatTwoDigits(probability)} ${probabilityLabels[probability]}`
      : 'Não informado',
    probabilityColor: probabilityChip.backgroundColor,
    probabilityTextColor: probabilityChip.textColor,
    severityLabel: hasValidSeverity
      ? `${formatTwoDigits(severity)} ${severityLabels[severity]}`
      : 'Não informado',
    severityColor: severityChip.backgroundColor,
    severityTextColor: severityChip.textColor,
    occupationalRiskLabel,
    occupationalRiskColor: occupationalChip.backgroundColor,
    occupationalRiskTextColor: occupationalChip.textColor,
  };
}
