import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { ResponsiveBar } from '@nivo/bar';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { SText } from '@v2/components/atoms/SText/SText';
import { monthTranslation } from '@v2/models/.shared/translations/month.translation';
import { GraphTitle } from '../components/GraphTitle/GraphTitle';
import { useFetchReadAbsenteeismTimelineTotal } from '@v2/services/absenteeism/dashboard/read-absenteeism-timeline-total/hooks/useFetchReadAbsenteeismTimelineTotal';
import { GraphEmpty } from '../components/GraphEmpty/GraphEmpty';
import { GraphLoading } from '../components/GraphLoading/GraphLoading';

const color1 = 'rgb(127, 201, 127)';
const color2 = 'rgb(190, 174, 212)';

interface Props {
  companyId: string;
  workspacesIds?: string[];
}

export const GraphBarTotal = ({ companyId, workspacesIds }: Props) => {
  const { data, isLoading } = useFetchReadAbsenteeismTimelineTotal({
    companyId,
    workspacesIds,
  });

  return (
    <Box width={'100%'}>
      <SPaper sx={{ p: 10 }}>
        <GraphTitle title="Total de Atestados / Dias Ausentes por Mês" />
        <Box height={408}>
          {data?.results && !isLoading && (
            <ResponsiveBar
              data={data?.results as any}
              keys={['documents', 'days']}
              indexBy="date"
              groupMode="grouped"
              margin={{ top: 50, right: 110, bottom: 48, left: 60 }}
              padding={0.25}
              innerPadding={3}
              valueScale={{ type: 'linear' }}
              indexScale={{ type: 'band', round: true }}
              colors={({ id }) => (id === 'documents' ? color1 : color2)}
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
                format: (value) =>
                  monthTranslation[(value?.getMonth() || 0) + 1 || 1].short +
                  ' ' +
                  value?.getFullYear(),
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
                      id: 'documents',
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
                  id === 'documents' ? 'Nº de Atestados' : 'Dias Perdidos';
                let otherSeriesValue: number | undefined;
                let otherSeriesName = '';

                if (id === 'documents') {
                  otherSeriesValue = data.days as number;
                  otherSeriesName = 'Dias Perdidos';
                } else if (id === 'days') {
                  otherSeriesValue = data.documents as number;
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
                    <SText fontSize={10}>
                      {monthName} {data.year}
                    </SText>
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
                  container: {},
                },
              }}
              animate={true}
              motionConfig="wobbly"
            />
          )}
          {!data?.results && !isLoading && <GraphEmpty />}
          {isLoading && <GraphLoading />}
        </Box>
      </SPaper>
    </Box>
  );
};
