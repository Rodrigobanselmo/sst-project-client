import { Control, FieldValues } from 'react-hook-form';

import { SelectChangeEvent } from '@mui/material';
import { SSelectProps } from 'components/atoms/SSelect/types';

export type SelectFormProps = Partial<SSelectProps> & {
  name: string;
  control: Control<FieldValues, object>;
  label?: string;
  defaultValue?: string;
  onChange?: (e: SelectChangeEvent<unknown>) => void;
};
