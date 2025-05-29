import { Box } from '@mui/material';
import { ResponsivePie } from '@nivo/pie';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { useFetchReadAbsenteeismDaysCount } from '@v2/services/absenteeism/dashboard/read-absenteeism-days-count/hooks/useFetchReadAbsenteeismDaysCount';
import { GraphTitle } from '../components/GraphTitle/GraphTitle';
import { PieLegends } from '../components/PieLegends/PieLegends';
import { GraphLoading } from '../components/GraphLoading/GraphLoading';
import { GraphEmpty } from '../components/GraphEmpty/GraphEmpty';

const color1 = '#7fc97f';
const color2 = '#beaed4';
const color3 = '#fdc086';
const color4 = '#ffff99';
const color5 = '#386cb0';
const color6 = '#f0027f';
const color7 = '#bf5b17';
const color8 = '#666666';

const customPieColors = [
  color1,
  color2,
  color3,
  color4,
  color5,
  color6,
  color7,
  color8,
];
interface Props {
  companyId: string;
  workspacesIds?: string[];
}

export const GraphPieRangeDays = ({ companyId, workspacesIds }: Props) => {
  const { data, isLoading } = useFetchReadAbsenteeismDaysCount({
    companyId,
    workspacesIds,
  });

  const dataWithColorsForLegend =
    data?.results.map((item, index) => ({
      ...item,
      color: customPieColors[index % customPieColors.length],
    })) || [];

  return (
    <Box width={'100%'}>
      <SPaper sx={{ p: 10 }}>
        <GraphTitle title="Dias de afastamento" />
        <Box height={350} maxWidth={600}>
          {data?.results && !isLoading && (
            <ResponsivePie
              data={dataWithColorsForLegend}
              margin={{ top: 40, right: 80, bottom: 20, left: 80 }}
              activeOuterRadiusOffset={8}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#333333"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: 'color' }}
              colors={customPieColors}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
            />
          )}
          {!data?.results && !isLoading && <GraphEmpty />}
          {isLoading && <GraphLoading />}
        </Box>
        <PieLegends data={dataWithColorsForLegend} />
      </SPaper>
    </Box>
  );
};
