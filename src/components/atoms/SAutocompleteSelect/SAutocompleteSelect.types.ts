/* eslint-disable @typescript-eslint/no-explicit-any */
import { AutocompleteProps } from '@mui/material';

import { TextFieldProps } from '../TextField/TextField.types';

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
  options: T[];
  inputProps?: TextFieldProps;
}
