import { ReactNode } from 'react';

import { CircularProgressProps } from '@mui/material/CircularProgress';
import { TextFieldProps } from '@mui/material/TextField';

export type ISInputProps = TextFieldProps & {
  loading?: boolean;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  circularProps?: CircularProgressProps;
  labelPosition?: 'center' | 'top';
  success?: boolean;
  unstyled?: boolean;
  secondary?: boolean;
};
