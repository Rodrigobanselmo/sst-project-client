import { Control, FieldValues } from 'react-hook-form';

import { BoxProps, SelectChangeEvent } from '@mui/material';
import { SSelectProps } from 'components/atoms/SSelect/types';

export type SelectFormProps = Partial<SSelectProps> & {
  name: string;
  control: Control<any, object>;
  label?: string;
  defaultValue?: string | number;
  unmountOnChangeDefault?: boolean;
  onChange?: (e: SelectChangeEvent<unknown>) => void;
  boxProps?: Partial<Omit<BoxProps, 'defaultValue'>>;
  setValue: (name: any, value: any) => void;
};
