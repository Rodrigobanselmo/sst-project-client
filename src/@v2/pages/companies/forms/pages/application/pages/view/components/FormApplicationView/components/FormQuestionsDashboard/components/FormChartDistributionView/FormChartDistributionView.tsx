import { Box, Typography, useTheme } from '@mui/material';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';

import type { ChartDistributionRow } from '../../helpers/compute-pie-distribution-rows.util';
import type { FormChartType } from '../../helpers/form-chart-type.types';
import { PieLegends } from '../FormQuestionPieChart/components/PieLegends/PieLegends';

type FormChartDistributionViewProps = {
  rows: ChartDistributionRow[];
  totalAnswers: number;
  chartType: FormChartType;
  height?: number;
  barLabelFontSize?: number;
};

export const FormChartDistributionView = ({
  rows,
  totalAnswers,
  chartType,
  height = 200,
  barLabelFontSize = 11,
}: FormChartDistributionViewProps) => {
  const { palette } = useTheme();

  if (rows.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" textAlign="center">
        Nenhuma resposta encontrada
      </Typography>
    );
  }

  if (chartType === 'bar') {
    const barData = rows.map((row) => ({
      label: row.label,
      count: row.count,
      color: row.color,
    }));

    return (
      <Box>
        <Box height={Math.max(height, rows.length * 36)} sx={{ '& svg text[dominant-baseline="central"]': { fontSize: `${barLabelFontSize}px !important`, fontWeight: '700 !important' } }}>
          <ResponsiveBar
            data={barData}
            keys={['count']}
            indexBy="label"
            layout="horizontal"
            margin={{ top: 8, right: 48, bottom: 8, left: 120 }}
            padding={0.3}
            colors={({ data }) => data.color}
            borderRadius={2}
            enableGridY={false}
            theme={{
              labels: { text: { fontWeight: 700, fontSize: barLabelFontSize } },
              axis: { ticks: { text: { fill: palette.text.primary } } },
              grid: { line: { stroke: palette.divider } },
            }}
            axisBottom={null}
            axisLeft={{
              tickSize: 0,
              tickPadding: 8,
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor="#333333"
            valueFormat={(value) => `${value}`}
            tooltip={({ indexValue, value }) => {
              const row = rows.find((item) => item.label === indexValue);
              return (
                <Box
                  sx={{
                    backgroundColor: 'background.paper',
                    padding: '8px 12px',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '4px',
                    color: 'text.primary',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}
                >
                  <strong>{indexValue}</strong>
                  <br />
                  {value} respostas ({row?.percentage ?? 0}%)
                </Box>
              );
            }}
          />
        </Box>
        <PieLegends
          data={rows.map((row) => ({
            id: row.id,
            label: row.label,
            value: row.count,
            color: row.color,
          }))}
          total={totalAnswers}
        />
      </Box>
    );
  }

  const pieData = rows.map((row) => ({
    id: row.id,
    label: row.label,
    value: row.count,
    color: row.color,
  }));

  return (
    <Box sx={{ containerType: 'inline-size', width: '100%', minWidth: 0 }}>
      <Box sx={{
        display: 'grid', alignItems: 'center', gap: 6,
        gridTemplateColumns: 'minmax(0, 1fr)',
        '@container (min-width: 520px)': {
          gridTemplateColumns: `${Math.max(height, 240)}px minmax(0, 220px)`,
          justifyContent: 'center',
        },
      }}>
      <Box height={Math.max(height, 240)} minWidth={0}>
        <ResponsivePie
          data={pieData}
          margin={{ top: 16, right: 16, bottom: 16, left: 16 }}
          innerRadius={chartType === 'donut' ? 0.5 : 0}
          padAngle={1}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          arcLinkLabel={(data) => `${data.label}`}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor={palette.text.primary}
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: 'color' }}
          colors={{ datum: 'data.color' }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor="#333333"
          theme={{ labels: { text: { fontWeight: 700 } } }}
          enableArcLabels
          enableArcLinkLabels={false}
          valueFormat={(value) => {
            const percentage = (value / totalAnswers) * 100;
            return percentage < 1 ? '<1%' : `${Math.round(percentage)}%`;
          }}
          tooltip={({ datum }) => (
            <Box
              sx={{
                backgroundColor: 'background.paper',
                padding: '8px 12px',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '4px',
                width: '300px',
                color: 'text.primary',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              <strong>{datum.label}</strong>
              <br />
              {datum.value} respostas (
              {Math.round((datum.value / totalAnswers) * 100)}%)
            </Box>
          )}
        />
      </Box>
      <PieLegends data={pieData} total={totalAnswers} vertical />
      </Box>
    </Box>
  );
};
