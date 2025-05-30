import { Box } from '@mui/material';
import { ResponsivePie } from '@nivo/pie';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { PieLegends } from '../../components/PieLegends/PieLegends';
import { GraphTitle } from '../../components/GraphTitle/GraphTitle';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';

const color1 = '#7fc97f';
const color2 = '#beaed4';
const color3 = '#fdc086';
const color4 = '#ffff99';
const color5 = '#386cb0';
const color6 = '#f0027f';
const color7 = '#bf5b17';
const color8 = '#666666';

const customPieColors = [
  color3,
  color5,
  color4,
  color6,
  color7,
  color1,
  color2,
  color8,
];

interface DataItem {
  value: number;
  label: string;
}

interface Props {
  title: string;
  data: DataItem[];
}

function uniquifyLabels(data: DataItem[]): DataItem[] {
  const labelCounts: Record<string, number> = {};
  const resultArray: DataItem[] = [];

  for (const item of data) {
    const originalLabel = item.label;
    let newLabel = originalLabel;

    if (labelCounts[originalLabel] !== undefined) {
      labelCounts[originalLabel]++;
      newLabel = `${labelCounts[originalLabel]} - ${originalLabel}`;
    } else {
      labelCounts[originalLabel] = 0;
    }

    resultArray.push({
      value: item.value,
      label: newLabel,
    });
  }

  return resultArray;
}

export const Graph = ({ data, title }: Props) => {
  const dataWithColorsForLegend = uniquifyLabels(data || []).map(
    (item, index) => ({
      id: item.label,
      label: item.label,
      value: item.value,
      color: customPieColors[index % customPieColors.length],
    }),
  );

  return (
    <Box width={'100%'}>
      <SPaper sx={{ p: 2 }}>
        <GraphTitle
          title={title}
          textProps={{
            mt: 6,
            ml: 8,
          }}
        />
        <Box height={300} maxWidth={900} mx="auto">
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
