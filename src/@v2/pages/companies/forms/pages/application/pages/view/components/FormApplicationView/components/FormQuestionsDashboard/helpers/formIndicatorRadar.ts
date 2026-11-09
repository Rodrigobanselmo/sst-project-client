import { alpha } from '@mui/material/styles';
import {
  Chart as ChartJS,
  Filler,
  LineElement,
  PointElement,
  RadarController,
  RadialLinearScale,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import type { FormIndicatorResult } from './calculate-form-indicator.util';
import { getIndicatorColorFromScore } from './form-indicator-quality.util';

ChartJS.register(
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
);

export type RadarPoint = FormIndicatorResult & { id: string; name: string };

export type RadarGroup = {
  id: string;
  name: string;
  protected: boolean;
  scales: Array<RadarPoint & { dimensions: RadarPoint[] }>;
};

export function getScalesForDimensionRadar(group?: RadarGroup) {
  return (
    group?.scales.filter((scale) =>
      scale.dimensions.some((dimension) => dimension.hasValidAnswers),
    ) ?? []
  );
}

export function getRadarValues(points: RadarPoint[]) {
  return points.map((point) =>
    point.hasValidAnswers ? point.percentage : null,
  );
}

export function canDrawIndicatorRadar(
  points: RadarPoint[],
  byDimension: boolean,
) {
  return (
    (byDimension
      ? points.filter((point) => point.hasValidAnswers).length
      : points.length) >= 3
  );
}

export function buildIndicatorRadarChart(
  points: RadarPoint[],
  {
    color,
    textColor,
    gridColor,
    paperColor,
  }: {
    color: string;
    textColor: string;
    gridColor: string;
    paperColor: string;
  },
): { data: ChartData<'radar'>; options: ChartOptions<'radar'> } {
  const values = getRadarValues(points);
  return {
    data: {
      labels: points.map(({ name }) => name),
      datasets: [
        {
          data: values,
          borderColor: color,
          backgroundColor: alpha(color, 0.14),
          pointBackgroundColor: points.map(({ score }) =>
            getIndicatorColorFromScore(score),
          ),
          pointBorderColor: textColor,
          pointBorderWidth: 2,
          pointRadius: ({ chart }) => (chart.width < 480 ? 5 : 8),
          pointHoverRadius: ({ chart }) => (chart.width < 480 ? 8 : 11),
          pointHitRadius: 8,
          borderWidth: 3,
          spanGaps: false,
          fill: values.every((value) => value !== null),
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      layout: { padding: { left: 12, right: 12 } },
      scales: {
        r: {
          min: 0,
          max: 100,
          angleLines: { color: gridColor },
          grid: { color: gridColor },
          ticks: {
            stepSize: 25,
            color: textColor,
            backdropColor: paperColor,
            font: ({ chart }) => ({
              size: chart.width < 480 ? 11 : 15,
              weight: '600',
            }),
          },
          pointLabels: {
            color: textColor,
            padding: ({ chart }) => (chart.width < 480 ? 8 : 18),
            font: ({ chart }) => ({
              size: chart.width < 480 ? 11 : chart.width < 800 ? 15 : 18,
              weight: '600',
            }),
            callback(this: RadialLinearScale, label) {
              const linePattern =
                this.chart.width < 480
                  ? /.{1,12}(?:\s|$)|\S+/g
                  : /.{1,19}(?:\s|$)|\S+/g;
              return (
                label
                  .replace(/-(?=\S)/g, '- ')
                  .match(linePattern)
                  ?.map((line) => line.trim().replace(/- /g, '-')) ?? label
              );
            },
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ({ raw }) => `${raw}%`,
          },
        },
      },
    },
  };
}
