import {
  classifyIndicatorPercentage,
  INDICATOR_QUALITY_BANDS,
  type IndicatorQualityBandId,
} from './form-indicator-quality.util';
import type { IndicatorRowPdf } from './buildIndicatorsPdfDataset';

export type ExecutiveIndicatorsDistributionRow = {
  bandId: IndicatorQualityBandId;
  name: string;
  rangeLabel: string;
  color: string;
  count: number;
  percentage: number;
};

export type ExecutiveIndicatorsDistribution = {
  rows: ExecutiveIndicatorsDistributionRow[];
  totalIndicators: number;
};

function shouldIncludeIndicatorRow(row: IndicatorRowPdf): boolean {
  return row.hasValidAnswers && !row.shouldHideData;
}

/**
 * Classifica cada indicador já calculado no recorte atual nas faixas de qualidade
 * e retorna contagem + percentual por faixa (sem média global nem score único).
 */
export function buildExecutiveIndicatorsDistribution(params: {
  formGroups: Array<{
    indicators: IndicatorRowPdf[];
    questions?: Array<{ indicators: IndicatorRowPdf[] }>;
  }>;
  showOnlyGroupIndicators: boolean;
}): ExecutiveIndicatorsDistribution {
  const counts = new Map<IndicatorQualityBandId, number>(
    INDICATOR_QUALITY_BANDS.map((band) => [band.id, 0]),
  );

  let totalIndicators = 0;

  const registerIndicator = (row: IndicatorRowPdf) => {
    if (!shouldIncludeIndicatorRow(row)) return;

    const band = classifyIndicatorPercentage(row.percentage);
    counts.set(band.id, (counts.get(band.id) ?? 0) + 1);
    totalIndicators += 1;
  };

  params.formGroups.forEach((formGroup) => {
    formGroup.indicators.forEach(registerIndicator);

    if (!params.showOnlyGroupIndicators && formGroup.questions) {
      formGroup.questions.forEach((question) => {
        question.indicators.forEach(registerIndicator);
      });
    }
  });

  const rows: ExecutiveIndicatorsDistributionRow[] =
    INDICATOR_QUALITY_BANDS.map((band) => {
      const count = counts.get(band.id) ?? 0;
      return {
        bandId: band.id,
        name: band.name,
        rangeLabel: band.rangeLabel,
        color: band.color,
        count,
        percentage:
          totalIndicators > 0
            ? Math.round((count / totalIndicators) * 100)
            : 0,
      };
    }).filter((row) => row.count > 0);

  return { rows, totalIndicators };
}
