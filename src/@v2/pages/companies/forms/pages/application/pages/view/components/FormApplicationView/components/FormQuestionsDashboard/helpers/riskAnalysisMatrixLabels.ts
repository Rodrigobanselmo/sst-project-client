import { getMatrizRisk } from 'core/utils/helpers/matriz';

export const probabilityMap: Record<number, { label: string; color: string }> =
  {
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

const formatTwoDigits = (n: number) => String(n).padStart(2, '0');

const isValidMatrixValue = (n: unknown): n is number =>
  typeof n === 'number' && Number.isFinite(n) && n >= 1 && n <= 5;

export type SectorRiskClassificationPdf = {
  probabilityLabel: string;
  probabilityColor: string;
  severityLabel: string;
  severityColor: string;
  occupationalRiskLabel: string;
  occupationalRiskColor: string;
};

export function buildSectorRiskClassificationPdf(
  severity: number,
  probability: number,
): SectorRiskClassificationPdf {
  const hasValidSeverity = isValidMatrixValue(severity);
  const hasValidProbability = isValidMatrixValue(probability);

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

  const probabilityEntry = probabilityMap[hasValidProbability ? probability : 0];
  const severityEntry = severityMap[hasValidSeverity ? severity : 0];

  return {
    probabilityLabel: hasValidProbability
      ? `${formatTwoDigits(probability)} ${probabilityEntry.label}`
      : 'Não informado',
    probabilityColor: probabilityEntry.color,
    severityLabel: hasValidSeverity
      ? `${formatTwoDigits(severity)} ${severityEntry.label}`
      : 'Não informado',
    severityColor: severityEntry.color,
    occupationalRiskLabel,
    occupationalRiskColor:
      occupationalRiskColorMap[occupationalRiskLabel] ??
      occupationalRiskColorMap['Não informado'],
  };
}
