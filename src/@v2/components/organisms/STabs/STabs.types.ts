import { BoxProps, TabProps, TabsProps } from '@mui/material';

export interface STabOption<T> {
  tabProps?: TabProps;
  label: string;
  value: T;
}

export interface STabsProps<T> {
  options: STabOption<T>[];
  onChange: (event: React.SyntheticEvent, value: T) => void;
  value: T;
  tabsProps?: TabsProps;
  boxProps?: BoxProps;
  height?: number;
  shadow?: boolean;
  loading?: boolean;
}
