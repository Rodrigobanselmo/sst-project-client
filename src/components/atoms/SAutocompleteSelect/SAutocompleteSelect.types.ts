/* eslint-disable @typescript-eslint/no-explicit-any */
import { AutocompleteProps } from '@mui/material';

import { SInputProps } from '../SInput/types';

export interface AutocompleteSelectProps<T = any>
  extends Partial<
    AutocompleteProps<
      T,
      boolean | undefined,
      boolean | undefined,
      boolean | undefined,
      'div'
    >
  > {
  label: string;
  name: string;
  freeSolo?: boolean;
  options: T[];
  inputProps?: SInputProps;
  pagination?: boolean;
}
