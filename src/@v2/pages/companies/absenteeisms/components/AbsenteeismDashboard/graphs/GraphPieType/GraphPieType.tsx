import { Box } from '@mui/material';
import { ResponsivePie } from '@nivo/pie';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { PieLegends } from '../components/PieLegends/PieLegends';

const data = [
  {
    id: 'make',
    label: 'make make',
    value: 540,
  },
  {
    id: 'ruby',
    label: 'ruby',
    value: 239,
  },
  {
    id: 'eli5xir',
    label: 'elixir',
    value: 174,
  },
  {
    id: 'ph4p',
    label: 'php',
    value: 230,
  },
  {
    id: 'mak3e',
    label: 'make make',
    value: 540,
  },
  {
    id: 'rub1ty',
    label: 'ruby',
    value: 239,
  },
  {
    id: 'rub1ry',
    label: 'ruby',
    value: 239,
  },
  {
    id: 'rub1yy',
    label: 'ruby',
    value: 239,
  },
];

// Define your custom colors
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

export const GraphPieType = ({ companyId }: { companyId: string }) => {
  const dataWithColorsForLegend = data.map((item, index) => ({
    ...item,
    color: customPieColors[index % customPieColors.length],
  }));

  return (
    <Box width={'100%'}>
      <SPaper sx={{ p: 2 }}>
        <Box height={400} maxWidth={900} mx="auto">
          <ResponsivePie
            data={dataWithColorsForLegend}
            margin={{ top: 40, right: 80, bottom: 20, left: 80 }}
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
