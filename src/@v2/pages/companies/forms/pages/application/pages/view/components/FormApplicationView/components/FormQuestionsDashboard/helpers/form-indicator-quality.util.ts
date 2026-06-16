export type IndicatorQualityBandId =
  | 'very_negative'
  | 'negative'
  | 'neutral'
  | 'positive'
  | 'very_positive';

export type IndicatorQualityBand = {
  id: IndicatorQualityBandId;
  rangeLabel: string;
  name: string;
  color: string;
  minPercentage: number;
  maxPercentage: number;
};

export const INDICATOR_QUALITY_BANDS: ReadonlyArray<IndicatorQualityBand> = [
  {
    id: 'very_negative',
    rangeLabel: '0–19%',
    name: 'Muito negativo',
    color: '#F44336',
    minPercentage: 0,
    maxPercentage: 19,
  },
  {
    id: 'negative',
    rangeLabel: '20–39%',
    name: 'Negativo',
    color: '#d96c2f',
    minPercentage: 20,
    maxPercentage: 39,
  },
  {
    id: 'neutral',
    rangeLabel: '40–59%',
    name: 'Neutro',
    color: '#d9d10b',
    minPercentage: 40,
    maxPercentage: 59,
  },
  {
    id: 'positive',
    rangeLabel: '60–79%',
    name: 'Positivo',
    color: '#8fa728',
    minPercentage: 60,
    maxPercentage: 79,
  },
  {
    id: 'very_positive',
    rangeLabel: '80–100%',
    name: 'Muito positivo',
    color: '#3cbe7d',
    minPercentage: 80,
    maxPercentage: 100,
  },
];

export const INDICATOR_QUALITY_LEGEND_ITEMS = INDICATOR_QUALITY_BANDS.map(
  ({ rangeLabel, name, color }) => ({
    rangeLabel,
    name,
    color,
  }),
);

export const INDICATOR_PERCENT_SCALE_MARKS = [0, 20, 40, 60, 80, 100] as const;

export function classifyIndicatorPercentage(
  percentage: number,
): IndicatorQualityBand {
  const normalized = Math.max(0, Math.min(100, Math.round(percentage)));

  return (
    INDICATOR_QUALITY_BANDS.find(
      (band) =>
        normalized >= band.minPercentage && normalized <= band.maxPercentage,
    ) ?? INDICATOR_QUALITY_BANDS[0]
  );
}

export function getIndicatorColorFromScore(score: number): string {
  return getIndicatorColorFromPercentage(Math.round(score * 100));
}

export function getIndicatorColorFromPercentage(percentage: number): string {
  return classifyIndicatorPercentage(percentage).color;
}
