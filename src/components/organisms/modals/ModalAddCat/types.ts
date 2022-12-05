import { BoxProps } from '@mui/material';
import { DateUnitEnum } from 'project/enum/DataUnit.enum';

export interface SModalAbsenteeismProps extends Omit<BoxProps, 'title'> {}
export interface SModalSubmitAbsenteeismProps {
  timeUnit: DateUnitEnum;
}
