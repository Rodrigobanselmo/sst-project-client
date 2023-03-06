import { ReactNode } from 'react';

import { CircularProgressProps } from '@mui/material/CircularProgress';
import { TextFieldProps } from '@mui/material/TextField';

export type SInputProps = TextFieldProps & {
  loading?: boolean;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  circularProps?: CircularProgressProps;
  labelPosition?: 'center' | 'top' | 'left';
  success?: boolean;
  unstyled?: boolean;
  secondary?: boolean;
  smallPlaceholder?: boolean;
  subVariant?: 'search' | 'standard' | 'search_v2';
  backgroundColor?: string;
  helpText?: string;
  firstLetterCapitalize?: boolean;
  noEffect?: boolean;
  superSmall?: boolean;
};
