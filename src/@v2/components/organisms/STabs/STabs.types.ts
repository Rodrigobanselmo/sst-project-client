import { BoxProps, TabProps, TabsProps } from '@mui/material';
import { ReactNode } from 'react';

export interface STabOption<T> {
  tabProps?: TabProps;
  component?: ReactNode;
  label: string;
  value: T;
}

export interface STabsProps<T> {
  options: STabOption<T>[];
  onChange: (event: React.SyntheticEvent, value: T) => void;
  value: T;
  tabsProps?: TabsProps;
  componentProps?: BoxProps;
  containerProps?: BoxProps;
  height?: number;
  shadow?: boolean;
  loading?: boolean;
}
