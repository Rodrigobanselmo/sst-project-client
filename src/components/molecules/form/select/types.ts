import { Control, FieldValues } from 'react-hook-form';

import { BoxProps, SelectChangeEvent } from '@mui/material';
import { SSelectProps } from 'components/atoms/SSelect/types';

export type SelectFormProps = Partial<SSelectProps> & {
  name: string;
  control: Control<FieldValues, object>;
  label?: string;
  defaultValue?: string;
  unmountOnChangeDefault?: boolean;
  onChange?: (e: SelectChangeEvent<unknown>) => void;
  boxProps?: Partial<Omit<BoxProps, 'defaultValue'>>;
  setValue?: (name: string, value: string) => void;
};
