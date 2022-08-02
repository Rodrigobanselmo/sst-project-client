/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { InputHTMLAttributes } from 'react';

import { GridProps } from '@mui/material/Grid';
import { TypographyProps } from '@mui/material/Typography';

export interface IStyledGrid {
  backgroundColorChecked?: string;
  colorChecked?: string;
  backgroundColorItem?: string;
  colorItem?: string;
  error?: number;
}

interface IOption extends Record<string, any> {
  content?: string | React.ReactNode;
  value?: string;
  tooltip?: string;
  gridSize?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export interface IInputCheckboxProps
  extends InputHTMLAttributes<HTMLInputElement> {
  reset?: () => void;
  option: string | IOption;
  inputProps?: (
    option: string | IOption | any,
  ) => InputHTMLAttributes<HTMLInputElement>;
  type?: 'radio' | 'checkbox';
  name?: string;
  inputValue?: any;
  gridItemsProps?: GridProps;
  itemProps?: TypographyProps;
  valueField: string;
  contentField: string;
  backgroundColor?: string;
  color?: string;
  defaultValue?: string;
  ball?: boolean;
}

export type SRadioCheckboxProps = GridProps & {
  options: Array<string | IOption | any>;
  inputProps?: (
    option: string | IOption | any,
  ) => InputHTMLAttributes<HTMLInputElement>;
  type?: 'radio' | 'checkbox';
  name?: string;
  reset?: () => void;
  itemProps?: TypographyProps;
  gridItemsProps?: GridProps;
  optionsFieldName?: { valueField?: string; contentField?: string };
  backgroundColorChecked?: string;
  colorChecked?: string;
  backgroundColorItem?: string;
  colorItem?: string;
  helperText?: string;
  error?: boolean;
  size?: number;
  disabled?: boolean;
  defaultValue?: string;
  ball?: boolean;
};
