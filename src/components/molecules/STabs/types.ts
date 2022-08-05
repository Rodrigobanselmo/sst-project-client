import { TabProps, TabsProps } from '@mui/material';

export interface STabOption extends TabProps {
  label: string;
}

export interface STabsProps extends TabsProps {
  options: STabOption[];
}
