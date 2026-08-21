import type { IFormParticipantsAdherenceEvolutionModel } from '@v2/models/form/models/form-participants/form-participants-adherence-evolution.model';
import { getResponseRateBarColor } from '@v2/models/form/helpers/form-participants-response-rate-colors';
import {
  groupAdherenceEmailMarkersOnSeries,
} from '@v2/models/form/helpers/form-participants-adherence-evolution-reminder-markers';
import { Box } from '@mui/material';
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
  type TooltipItem,
} from 'chart.js';
import { useMemo } from 'react';
import { Chart } from 'react-chartjs-2';
import { createAdherenceReminderMarkersPlugin } from './form-participants-adherence-reminder-plugin';

ChartJS.register(
  BarController,
  LineController,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
);

type Props = {
  evolution: IFormParticipantsAdherenceEvolutionModel;
};

function formatCalendarDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
}

function formatCalendarTick(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}`;
}

function formatPercent(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
}

export const FormParticipantsAdherenceEvolutionChart = ({
  evolution,
}: Props) => {
  const series = evolution.series;
  const reminderGroups = useMemo(
    () =>
      groupAdherenceEmailMarkersOnSeries(
        series.map((point) => point.date),
        evolution.reminders,
        evolution.initialEmail,
      ),
    [evolution.initialEmail, evolution.reminders, series],
  );
  const reminderPlugin = useMemo(
    () =>
      createAdherenceReminderMarkersPlugin(
        series.map((point) => point.date),
        evolution.reminders,
        evolution.initialEmail,
      ),
    [evolution.initialEmail, evolution.reminders, series],
  );
  const lastPercent =
    series.length > 0 ? series[series.length - 1].cumulativePercent : 0;
  const lineColor = getResponseRateBarColor(lastPercent);
  const goal =
    evolution.participationGoal != null && evolution.participationGoal > 0
      ? evolution.participationGoal
      : null;

  const data = useMemo<ChartData<'bar' | 'line', number[], string>>(() => {
    const labels = series.map((point) => point.date);
    const datasets: ChartData<'bar' | 'line', number[], string>['datasets'] = [
      {
        type: 'bar',
        label: 'Novas respostas',
        data: series.map((point) => point.newResponses),
        yAxisID: 'yCount',
        backgroundColor: 'rgba(25, 118, 210, 0.42)',
        borderColor: 'rgba(25, 118, 210, 0.85)',
        borderWidth: 1,
        borderRadius: 3,
        maxBarThickness: 22,
        order: 2,
      },
      {
        type: 'line',
        label: 'Adesão acumulada',
        data: series.map((point) => point.cumulativePercent),
        yAxisID: 'yPercent',
        borderColor: lineColor,
        backgroundColor: lineColor,
        pointRadius: series.length <= 2 ? 4 : 0,
        pointHoverRadius: 4,
        tension: 0.25,
        borderWidth: 2.25,
        order: 1,
      },
    ];

    if (goal != null) {
      datasets.push({
        type: 'line',
        label: `Meta (${formatPercent(goal)}%)`,
        data: series.map(() => goal),
        yAxisID: 'yPercent',
        borderColor: '#546e7a',
        backgroundColor: '#546e7a',
        borderDash: [6, 4],
        pointRadius: 0,
        pointHoverRadius: 0,
        borderWidth: 1.5,
        order: 0,
      });
    }

    return { labels, datasets };
  }, [goal, lineColor, series]);

  const options = useMemo<ChartOptions<'bar' | 'line'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            boxHeight: 12,
            font: { size: 11 },
            padding: 12,
          },
        },
        tooltip: {
          displayColors: false,
          filter: (item: TooltipItem<'bar' | 'line'>) => item.datasetIndex === 0,
          callbacks: {
            title: (items: TooltipItem<'bar' | 'line'>[]) => {
              const label = items[0]?.label;
              return label ? formatCalendarDate(label) : '';
            },
            label: () => '',
            afterBody: (items: TooltipItem<'bar' | 'line'>[]) => {
              const index = items[0]?.dataIndex;
              if (index == null) return [];
              const point = series[index];
              if (!point) return [];
              const lines = [
                `Novas respostas: ${point.newResponses}`,
                `Respostas acumuladas: ${point.cumulativeResponses}`,
                `Adesão acumulada: ${formatPercent(point.cumulativePercent)}%`,
              ];
              if (goal != null) {
                lines.push(`Meta: ${formatPercent(goal)}%`);
              }
              const labels = reminderGroups.find(
                (group) => group.index === index,
              )?.labels;
              if (labels?.length) {
                labels.forEach((label) => lines.push(label));
              }
              return lines;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            autoSkip: true,
            maxTicksLimit: series.length > 60 ? 8 : series.length > 21 ? 10 : 12,
            maxRotation: 0,
            minRotation: 0,
            font: { size: 11 },
            callback: (_value, index) => {
              const isoDate = series[index]?.date;
              return isoDate ? formatCalendarTick(isoDate) : '';
            },
          },
          grid: { display: false },
        },
        yCount: {
          type: 'linear',
          position: 'left',
          beginAtZero: true,
          ticks: {
            precision: 0,
            font: { size: 11 },
          },
          title: {
            display: true,
            text: 'Novas respostas',
            font: { size: 11 },
          },
          grid: { color: 'rgba(0,0,0,0.06)' },
        },
        yPercent: {
          type: 'linear',
          position: 'right',
          min: 0,
          max: 100,
          ticks: {
            callback: (value) => `${value}%`,
            font: { size: 11 },
          },
          title: {
            display: true,
            text: 'Adesão acumulada',
            font: { size: 11 },
          },
          grid: { drawOnChartArea: false },
        },
      },
    }),
    [goal, reminderGroups, series],
  );

  const plugins = useMemo(() => [reminderPlugin], [reminderPlugin]);

  return (
    <Box height={{ xs: 260, md: 320 }} width="100%">
      <Chart type="bar" data={data} options={options} plugins={plugins} />
    </Box>
  );
};
