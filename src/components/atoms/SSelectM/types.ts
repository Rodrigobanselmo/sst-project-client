/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { ReactNode } from 'react';

import { CircularProgressProps } from '@mui/material/CircularProgress';
import { FormControlProps } from '@mui/material/FormControl';
import { FormHelperTextProps } from '@mui/material/FormHelperText';
import { InputLabelProps } from '@mui/material/InputLabel';
import { MenuItemProps } from '@mui/material/MenuItem';
import { PaperProps } from '@mui/material/Paper';
import { SelectProps } from '@mui/material/Select';
import { CSSProperties } from '@mui/material/styles/createTypography';

export interface IOption extends Record<string, any> {
  content?: string | number;
  value?: string | number;
}

export type SSelectProps = SelectProps & {
  iconColor?: string;
  inputRef?: React.Ref<any>;
  options?: Array<string | number | IOption>;
  optionsFieldName?: { valueField?: string; contentField?: string };
  helperText?: string | ReactNode;
  emptyItem?: string | ReactNode;
  placeholder?: string | ReactNode;
  width?: string | number;
  beforeItem?: string;
  formControlProps?: FormControlProps;
  dropDownProps?: PaperProps;
  formHelperTextProps?: FormHelperTextProps;
  inputLabelProps?: InputLabelProps;
  loading?: boolean;
  menuItemProps?: MenuItemProps;
  menuEmptyItemProps?: MenuItemProps;
  circularProps?: CircularProgressProps;
  beforeItemStyles?: CSSProperties;
  renderMenuItemChildren?: (
    option: IOption | string | number,
    index: number,
  ) => ReactNode;
  renderEmptyItemChildren?: (emptyItem: ReactNode | string) => ReactNode;
};
