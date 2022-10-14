import { BoxProps } from '@mui/material';
import { ChartData } from 'chart.js';

export type UnmountBoxProps = Partial<Omit<BoxProps, 'defaultValue'>> & {
  data: ChartData<'doughnut', number[], string>;
  dataset?: {
    data: number;
    label: string;
    color: string;
    borderColor: string;
  }[];
};
