import { TabProps, TabsProps } from '@mui/material';

export interface STabOption extends TabProps {
  label: string;
}

export interface STabsProps extends TabsProps {
  options: STabOption[];
  height?: number;
  mt?: number;
  mb?: number;
  onChangeTab?: (value: number, cb: (stepIndex: number) => void) => void;
}
