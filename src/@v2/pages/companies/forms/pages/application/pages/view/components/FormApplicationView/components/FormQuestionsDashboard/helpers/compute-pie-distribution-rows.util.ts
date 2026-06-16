import {
  getAnswerOptionColorByValue,
  getIdentifierChartColor,
} from './form-chart-colors.util';

export type ChartDistributionRow = {
  id: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
  optionValue?: number;
};

type OptionForDistribution = {
  id: string;
  text: string;
  value?: number;
};

type AnswerForDistribution = {
  selectedOptionsIds: string[];
};

/**
 * Espelha FormQuestionPieChart / PDF: contagens por opção, só fatias com count > 0,
 * total = soma das fatias exibidas, percentual = Math.round(count/total*100).
 */
export function computePieDistributionRows(params: {
  options: OptionForDistribution[];
  answers: AnswerForDistribution[];
  colorScheme: 'identifier' | 'general';
}): { rows: ChartDistributionRow[]; totalAnswers: number } {
  const { options, answers, colorScheme } = params;

  const optionCounts = options.reduce(
    (acc, option) => {
      acc[option.id] = {
        id: option.id,
        label: option.text,
        value: 0,
        optionValue: option.value,
      };
      return acc;
    },
    {} as Record<
      string,
      { id: string; label: string; value: number; optionValue?: number }
    >,
  );

  answers.forEach((answer) => {
    answer.selectedOptionsIds.forEach((optionId) => {
      if (optionCounts[optionId]) {
        optionCounts[optionId].value += 1;
      }
    });
  });

  const pieData = Object.values(optionCounts).filter((item) => item.value > 0);
  const totalAnswers = pieData.reduce((sum, item) => sum + item.value, 0);

  const rows: ChartDistributionRow[] = pieData.map((item, index) => ({
    id: item.id,
    label: item.label,
    count: item.value,
    percentage:
      totalAnswers > 0 ? Math.round((item.value / totalAnswers) * 100) : 0,
    optionValue: item.optionValue,
    color:
      colorScheme === 'identifier'
        ? getIdentifierChartColor(index)
        : getAnswerOptionColorByValue(item.optionValue),
  }));

  return { rows, totalAnswers };
}
