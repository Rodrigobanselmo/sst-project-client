import { Box } from '@mui/material';
import { ResponsivePie } from '@nivo/pie';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { useCompareState } from '../../../store/compare.store';
import { PieLegends } from '../components/PieLegends/PieLegends';
import { Graph } from './components/Graph';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { useEffect, useState } from 'react';

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
interface Props extends FilterTypesProps {
  companyId: string;
}

// export const GraphPieCompare = ({ companyId, ...props }: Props) => {
export const GraphPieCompare = () => {
  const [key, setKey] = useState(0);

  const data1 = useCompareState((state) => state.graph1);
  const data2 = useCompareState((state) => state.graph2);
  const data3 = useCompareState((state) => state.graph3);

  useEffect(() => {
    setKey((prevKey) => prevKey + 1);
  }, [data1, data2, data3]);

  if (!data1.length && !data2.length && !data3.length) {
    return null;
  }

  return (
    <SFlex
      gap={6}
      pb={8}
      display="grid"
      gridTemplateColumns="1fr 1fr 1fr"
      key={key}
    >
      <Graph data={data1} title="Relação Taxa Dia" />
      <Graph data={data2} title="Total de Dias Perdidos" />
      <Graph data={data3} title="Total de Atestados" />
    </SFlex>
  );
};
