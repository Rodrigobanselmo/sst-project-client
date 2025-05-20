import { Box, Typography, Paper } from '@mui/material';
import { ResponsiveBar } from '@nivo/bar';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { SText } from '@v2/components/atoms/SText/SText';
import { monthTranslation } from '@v2/models/.shared/translations/month.translation';
import { GraphTitle } from '../components/GraphTitle/GraphTitle';

const absenteeismData = [
  { month: 1, events: 10, days: 25 }, // Janeiro
  { month: 2, events: 12, days: 30 }, // Fevereiro
  { month: 3, events: 8, days: 18 }, // Março
  { month: 4, events: 15, days: 40 }, // Abril
  { month: 5, events: 7, days: 15 }, // Maio
  { month: 6, events: 11, days: 28 }, // Junho
  { month: 7, events: 9, days: 20 }, // Julho
  { month: 8, events: 13, days: 35 }, // Agosto
  { month: 9, events: 6, days: 12 }, // Setembro
  { month: 10, events: 10, days: 22 }, // Outubro
  { month: 11, events: 14, days: 38 }, // Novembro
  { month: 12, events: 8, days: 19 }, // Dezembro
];

const color1 = 'rgb(127, 201, 127)';
const color2 = 'rgb(190, 174, 212)';

export const GraphBarTotal = ({ companyId }: { companyId: string }) => {
  return (
    <Box width={'100%'}>
      <SPaper sx={{ p: 10 }}>
        <GraphTitle title="Total de Atestados / Dias Ausentes por Mês" />
        <Box height={408}>
          <ResponsiveBar
            data={absenteeismData}
            keys={['events', 'days']}
            indexBy="month"
            groupMode="grouped"
            margin={{ top: 50, right: 110, bottom: 10, left: 60 }}
            padding={0.25}
            innerPadding={3}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={({ id }) => (id === 'events' ? color1 : color2)}
            borderColor={{
              from: 'color',
              modifiers: [['darker', 1.6]],
            }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Mês',
              legendPosition: 'middle',
              legendOffset: 42,
              format: (value) => monthTranslation[value || 1].short,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Total',
              legendPosition: 'middle',
              legendOffset: -50,
            }}
            labelSkipWidth={16}
            labelSkipHeight={16}
            labelTextColor={{
              from: 'color',
              modifiers: [['darker', 1.8]],
            }}
            legends={[
              {
                dataFrom: 'keys',
                data: [
                  {
                    id: 'events',
                    label: 'Atestados',
                    fill: color1,
                  },
                  {
                    id: 'days',
                    label: 'Dias Perdidos',
                    fill: color2,
                  },
                ],
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 110,
                translateY: 0,
                itemsSpacing: 2,
                itemWidth: 100,
                itemHeight: 20,
                itemDirection: 'left-to-right',
                itemOpacity: 1,
                symbolSize: 18,
                symbolShape: 'circle',
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemOpacity: 0.8,
                    },
                  },
                ],
              },
            ]}
            tooltip={({ id, value, color, indexValue, data }) => {
              const monthName = monthTranslation[data.month]?.short;
              const seriesName =
                id === 'events' ? 'Nº de Atestados' : 'Dias Perdidos';
              let otherSeriesValue: number | undefined;
              let otherSeriesName = '';

              if (id === 'events') {
                otherSeriesValue = data.days as number;
                otherSeriesName = 'Dias Perdidos';
              } else if (id === 'days') {
                otherSeriesValue = data.events as number;
                otherSeriesName = 'Nº de Atestados';
              }

              return (
                <div
                  style={{
                    padding: '8px 12px',
                    background: 'white',
                    width: '250px',
                    border: '1px solid #ccc',
                    borderRadius: '3px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  }}
                >
                  <SText fontSize={10}>{monthName}</SText>
                  <strong
                    style={{ color, display: 'block', marginBottom: '4px' }}
                  >
                    {seriesName}: {value}
                  </strong>
                  {otherSeriesValue !== undefined && (
                    <div style={{ fontSize: '0.9em', color: '#555' }}>
                      {otherSeriesName}: {otherSeriesValue}
                    </div>
                  )}
                </div>
              );
            }}
            theme={{
              axis: {
                ticks: { text: { fontSize: 11 } },
                legend: { text: { fontSize: 13, fill: '#333' } },
              },
              legends: {
                text: { fontSize: 11, fill: '#333' },
              },
              tooltip: {
                container: {
                  // Nivo default is fine, no specific background needed here
                },
              },
            }}
            animate={true}
            motionConfig="wobbly"
          />
        </Box>
      </SPaper>
    </Box>
  );
};
