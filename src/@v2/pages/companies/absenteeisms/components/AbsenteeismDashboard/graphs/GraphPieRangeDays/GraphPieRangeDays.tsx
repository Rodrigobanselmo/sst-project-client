import { Box } from '@mui/material';
import { ResponsivePie } from '@nivo/pie';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { PieLegends } from '../components/PieLegends/PieLegends';
import { GraphTitle } from '../components/GraphTitle/GraphTitle';

const data = [
  {
    id: '0-1',
    label: '0-1',
    value: 540,
  },
  {
    id: '1-4',
    label: '1-4',
    value: 239,
  },
  {
    id: '5-10',
    label: '5-10',
    value: 230,
  },
  {
    id: '11-15',
    label: '11-15',
    value: 57,
  },
  {
    id: '15+',
    label: '15+',
    value: 127,
  },
];

const color1 = '#7fc97f';
const color2 = '#beaed4';
const color3 = '#fdc086';
const color4 = '#ffff99';
const color5 = '#386cb0';
const color6 = '#f0027f';
const color7 = '#bf5b17';
const color8 = '#666666';

// Create an array of these colors
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

export const GraphPieRangeDays = ({ companyId }: { companyId: string }) => {
  const dataWithColorsForLegend = data.map((item, index) => ({
    ...item,
    color: customPieColors[index % customPieColors.length],
  }));

  return (
    <Box width={'100%'}>
      <SPaper sx={{ p: 10 }}>
        <GraphTitle title="Dias de afastamento" />
        <Box height={350} maxWidth={600}>
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
        </Box>
        <PieLegends data={dataWithColorsForLegend} />
      </SPaper>
    </Box>
  );
};
