import { ReactNode } from 'react';
import { TabProps, TabsProps } from '@mui/material';

export interface STabOption extends TabProps {
  iconComponent?: React.ElementType<any>;
  label: string;
}

export interface STabsProps extends TabsProps {
  options: STabOption[];
  height?: number;
  shadow?: boolean;
  onUrl?: boolean;
  active?: number;
  renderChildren?: (step: number) => ReactNode;
  mt?: number;
  mb?: number;
  onChangeTab?: (value: number, cb: (stepIndex: number) => void) => void;
}
