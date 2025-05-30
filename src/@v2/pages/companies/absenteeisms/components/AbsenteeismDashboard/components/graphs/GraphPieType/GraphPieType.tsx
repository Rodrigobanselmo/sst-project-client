import { Box } from '@mui/material';
import { ResponsivePie } from '@nivo/pie';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { PieLegends } from '../components/PieLegends/PieLegends';
import { useFetchReadAbsenteeismTypeCount } from '@v2/services/absenteeism/dashboard/read-absenteeism-type-count/hooks/useFetchReadAbsenteeismTypeCount';

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
interface Props extends FilterTypesProps {
  companyId: string;
}

export const GraphPieType = ({ companyId, ...props }: Props) => {
  const { data, isLoading } = useFetchReadAbsenteeismTypeCount({
    companyId,
    ...props,
  });

  const dataWithColorsForLegend =
    data?.results.map((item, index) => ({
      ...item,
      color: customPieColors[index % customPieColors.length],
    })) || [];

  return (
    <Box width={'100%'}>
      <SPaper sx={{ p: 2 }}>
        <Box height={400} maxWidth={900} mx="auto">
          <ResponsivePie
            data={dataWithColorsForLegend}
            margin={{ top: 40, right: 100, bottom: 20, left: 100 }}
            innerRadius={0.5}
            padAngle={1}
            cornerRadius={10}
            activeOuterRadiusOffset={8}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#333333"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: 'color' }}
            colors={customPieColors}
            arcLabelsSkipAngle={10}
          />
        </Box>
        <PieLegends data={dataWithColorsForLegend} />
      </SPaper>
    </Box>
  );
};
