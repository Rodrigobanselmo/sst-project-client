import { FC } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { STabsProps } from './types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

export const STabs: FC<STabsProps> = ({ options, ...props }) => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }} mt={-5} mb={10}>
      <Tabs
        variant="scrollable"
        scrollButtons="auto"
        aria-label="scrollable auto tabs example"
        {...props}
      >
        {options.map((options) => (
          <Tab key={options.label} label={options.label} />
        ))}
      </Tabs>
    </Box>
  );
};
