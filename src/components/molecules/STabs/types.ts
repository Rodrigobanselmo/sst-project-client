import { TabProps, TabsProps } from '@mui/material';

export interface STabOption extends TabProps {
  iconComponent?: React.ElementType<any>;
  label: string;
}

export interface STabsProps extends TabsProps {
  options: STabOption[];
  height?: number;
  shadow?: boolean;
  mt?: number;
  mb?: number;
  onChangeTab?: (value: number, cb: (stepIndex: number) => void) => void;
}
