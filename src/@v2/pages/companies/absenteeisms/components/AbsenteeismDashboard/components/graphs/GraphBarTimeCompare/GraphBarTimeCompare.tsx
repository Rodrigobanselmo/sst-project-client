import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { ResponsiveBar } from '@nivo/bar';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { SText } from '@v2/components/atoms/SText/SText';
import { monthTranslation } from '@v2/models/.shared/translations/month.translation';
import { GraphTitle } from '../components/GraphTitle/GraphTitle';
import { useFetchReadAbsenteeismTimelineTotal } from '@v2/services/absenteeism/dashboard/read-absenteeism-timeline-total/hooks/useFetchReadAbsenteeismTimelineTotal';
import { GraphEmpty } from '../components/GraphEmpty/GraphEmpty';
import { GraphLoading } from '../components/GraphLoading/GraphLoading';
import { useFetchBrowseAbsenteeismHierarchyTotal } from '@v2/services/absenteeism/dashboard/browse-absenteeism-hierarchy/hooks/useFetchBrowseAbsenteeismHierarchy';
import {
  AbsenteeismHierarchyTotalOrderByEnum,
  AbsenteeismHierarchyTypeEnum,
} from '@v2/services/absenteeism/dashboard/browse-absenteeism-hierarchy/service/browse-absenteeism-hierarchy.service';
import { useCompareState } from '../../../store/compare.store';
import { useFetchReadAbsenteeismHierarchyTimeCompare } from '@v2/services/absenteeism/dashboard/read-absenteeism-time-compare/hooks/useFetchBrowseAbsenteeismTimeCompare';
import { TimeCountRangeEnum } from '@v2/services/absenteeism/dashboard/read-absenteeism-time-compare/service/read-absenteeism-time-compare.service';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SButtonGroup } from '@v2/components/atoms/SButtonGroup/SButtonGroup';
import { useState } from 'react';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SReloadIcon } from 'assets/icons/SReloadIcon';

const color1 = '#7fc97f';
const color2 = '#beaed4';
const color3 = '#fdc086';
const color4 = '#ffff99';
const color5 = '#386cb0';
const color6 = '#f0027f';
const color7 = '#bf5b17';
const color8 = '#666666';

interface Props {
  companyId: string;
}

export const GraphBarTimeCompare = ({ companyId }: Props) => {
  const compareData = useCompareState((state) => state.compareData);
  const clearCompare = useCompareState((state) => state.clearCompare);
  const [type, setType] = useState(
    AbsenteeismHierarchyTotalOrderByEnum.AVERAGE_DAYS,
  );
  const [range, setRange] = useState(TimeCountRangeEnum.YEAR);

  const { data, isLoading } = useFetchReadAbsenteeismHierarchyTimeCompare({
    companyId,
    filters: {
      items: compareData || [],
      range: range,
    },
  });
  const graphDate = data?.graphData(type);

  if (!compareData.length) return null;

  return (
    <Box width={'100%'} mb={10}>
      <SPaper sx={{ p: 10 }}>
        <SFlex justify="space-between" align={'center'}>
          <SFlex gap={10} align={'center'}>
            <GraphTitle title="Histórico Absenteísmo" />
            <SButton
              text="Resetar"
              onClick={clearCompare}
              icon={<SReloadIcon sx={{ fontSize: 15 }} />}
            />
            <SButtonGroup
              onChange={(option) => setRange(option.value)}
              value={range}
              buttonProps={{
                sx: { minWidth: 100 },
              }}
              options={[
                {
                  label: 'Anual',
                  value: TimeCountRangeEnum.YEAR,
                },
                {
                  label: 'Semestral',
                  value: TimeCountRangeEnum.SEMESTER,
                },
              ]}
            />
          </SFlex>
          <SButtonGroup
            onChange={(option) => setType(option.value)}
            value={type}
            buttonProps={{
              sx: { minWidth: 160 },
            }}
            options={[
              {
                label: 'Taxa de Absenteísmo',
                value: AbsenteeismHierarchyTotalOrderByEnum.AVERAGE_DAYS,
              },
              {
                label: 'Dias Perdidos',
                value: AbsenteeismHierarchyTotalOrderByEnum.TOTAL_DAYS,
              },
              {
                label: 'Total de Atestados',
                value: AbsenteeismHierarchyTotalOrderByEnum.TOTAL,
              },
            ]}
          />
        </SFlex>
        <Box height={408}>
          {data?.results && !isLoading && (
            <ResponsiveBar
              data={graphDate?.results || []}
              keys={graphDate?.keys || []}
              indexBy="date"
              groupMode="grouped"
              margin={{ top: 50, right: 180, bottom: 48, left: 60 }}
              padding={0.25}
              innerPadding={3}
              valueScale={{ type: 'linear' }}
              indexScale={{ type: 'band', round: true }}
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
                legend: 'Período',
                legendPosition: 'middle',
                legendOffset: 42,
                format: (value) => value,
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
              // tooltip={({ id, value, color, indexValue, data }) => {
              //   const monthName = monthTranslation[data.month]?.short;
              //   const seriesName =
              //     id === 'documents' ? 'Nº de Atestados' : 'Dias Perdidos';
              //   let otherSeriesValue: number | undefined;
              //   let otherSeriesName = '';

              //   if (id === 'documents') {
              //     otherSeriesValue = data.days as number;
              //     otherSeriesName = 'Dias Perdidos';
              //   } else if (id === 'days') {
              //     otherSeriesValue = data.documents as number;
              //     otherSeriesName = 'Nº de Atestados';
              //   }

              //   return (
              //     <div
              //       style={{
              //         padding: '8px 12px',
              //         background: 'white',
              //         width: '250px',
              //         border: '1px solid #ccc',
              //         borderRadius: '3px',
              //         boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              //       }}
              //     >
              //       <SText fontSize={10}>
              //         {monthName} {data.year}
              //       </SText>
              //       <strong
              //         style={{ color, display: 'block', marginBottom: '4px' }}
              //       >
              //         {seriesName}: {value}
              //       </strong>
              //       {otherSeriesValue !== undefined && (
              //         <div style={{ fontSize: '0.9em', color: '#555' }}>
              //           {otherSeriesName}: {otherSeriesValue}
              //         </div>
              //       )}
              //     </div>
              //   );
              // }}
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
