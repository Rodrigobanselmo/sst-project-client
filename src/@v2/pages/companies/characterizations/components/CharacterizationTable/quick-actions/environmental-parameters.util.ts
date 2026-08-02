/**
 * Catálogo configurável dos Parâmetros Ambientais.
 * Adicionar novos itens aqui — célula e modal renderizam a lista.
 *
 * Campos reais em CompanyCharacterization (não existe “velocidade do ar”):
 * temperature, moisturePercentage, noiseValue (Ruído), luminosity.
 */
export type EnvironmentalParameterKey =
  | 'temperature'
  | 'moisturePercentage'
  | 'noiseValue'
  | 'luminosity';

export type EnvironmentalParameterDefinition = {
  key: EnvironmentalParameterKey;
  label: string;
  /** Prefixo compacto na coluna (ex.: T, U, R, L). */
  shortLabel: string;
  /** Unidade no modal / tooltip. */
  unit: string;
  /** Sufixo compacto na coluna. */
  unitCompact: string;
  placeholder?: string;
  /** Casas decimais sugeridas no input (apenas UX). */
  decimalPlaces?: number;
  allowNegative?: boolean;
};

export const ENVIRONMENTAL_PARAMETERS: EnvironmentalParameterDefinition[] = [
  {
    key: 'temperature',
    label: 'Temperatura',
    shortLabel: 'T',
    unit: '°C',
    unitCompact: '°',
    placeholder: 'temperatura',
    decimalPlaces: 2,
    allowNegative: true,
  },
  {
    key: 'moisturePercentage',
    label: 'Umidade',
    shortLabel: 'U',
    unit: '%',
    unitCompact: '%',
    placeholder: 'Umidade do ar',
    decimalPlaces: 2,
  },
  {
    key: 'noiseValue',
    label: 'Ruído',
    shortLabel: 'R',
    unit: 'dB(A)',
    unitCompact: 'dB',
    placeholder: 'ruído',
    decimalPlaces: 2,
  },
  {
    key: 'luminosity',
    label: 'Iluminância',
    shortLabel: 'L',
    unit: 'lux',
    unitCompact: 'lx',
    placeholder: 'iluminância',
    decimalPlaces: 0,
  },
];

export type EnvironmentalParameterValues = Partial<
  Record<EnvironmentalParameterKey, string | null | undefined>
>;

export function isEnvironmentalParameterFilled(
  value: string | null | undefined,
): boolean {
  // "0" é valor válido (não vazio).
  return String(value ?? '').trim().length > 0;
}

export function countEnvironmentalParametersFilled(
  values: EnvironmentalParameterValues,
  catalog: EnvironmentalParameterDefinition[] = ENVIRONMENTAL_PARAMETERS,
): { filled: number; total: number } {
  const total = catalog.length;
  const filled = catalog.filter((param) =>
    isEnvironmentalParameterFilled(values[param.key]),
  ).length;
  return { filled, total };
}

export type EnvironmentalFillStatus = 'empty' | 'partial' | 'complete';

export function resolveEnvironmentalFillStatus(
  filled: number,
  total: number,
): EnvironmentalFillStatus {
  if (filled <= 0) return 'empty';
  if (filled >= total) return 'complete';
  return 'partial';
}

/** Linha compacta da coluna: `T 24° · U 58% · R 65dB · L 650lx` */
export function formatEnvironmentalParametersCompact(
  values: EnvironmentalParameterValues,
  catalog: EnvironmentalParameterDefinition[] = ENVIRONMENTAL_PARAMETERS,
): string {
  const parts = catalog
    .filter((param) => isEnvironmentalParameterFilled(values[param.key]))
    .map((param) => {
      const raw = String(values[param.key]).trim();
      return `${param.shortLabel} ${raw}${param.unitCompact}`;
    });
  return parts.join(' · ');
}

/** Texto do tooltip (labels completas). */
export function formatEnvironmentalParametersTooltip(
  values: EnvironmentalParameterValues,
  catalog: EnvironmentalParameterDefinition[] = ENVIRONMENTAL_PARAMETERS,
): string {
  return catalog
    .map((param) => {
      const raw = String(values[param.key] || '').trim();
      const display = raw ? `${raw} ${param.unit}` : 'Não informado';
      return `${param.label}:\n${display}`;
    })
    .join('\n\n');
}

export function emptyEnvironmentalParameterValues(
  catalog: EnvironmentalParameterDefinition[] = ENVIRONMENTAL_PARAMETERS,
): Record<EnvironmentalParameterKey, string> {
  return catalog.reduce(
    (acc, param) => {
      acc[param.key] = '';
      return acc;
    },
    {} as Record<EnvironmentalParameterKey, string>,
  );
}
