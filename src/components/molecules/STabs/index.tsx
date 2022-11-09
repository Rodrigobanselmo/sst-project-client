import { FC } from 'react';

import { Divider } from '@mui/material';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';

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

export const STabs: FC<STabsProps> = ({
  options,
  mb = 10,
  mt = -5,
  shadow,
  ...props
}) => {
  return (
    <Box
      sx={{
        borderBottom: shadow ? 1 : 0,
        borderColor: 'divider',
        // backgroundColor: 'sidebar.background',
        // borderTopLeftRadius: 10,
        // borderTopRightRadius: 10,
      }}
      mt={mt}
      mb={mb}
      {...(!!props.height && {
        height: props.height,
      })}
    >
      <Tabs
        variant="scrollable"
        scrollButtons="auto"
        aria-label="scrollable auto tabs example"
        {...props}
        {...(!!props.height && {
          sx: {
            '& .MuiTabs-scroller': { maxHeight: props.height },
            svg: { fontSize: 22, pr: 3 },
            ...props.sx,
          },
        })}
      >
        {options.map((options) => (
          <Tab key={options.label} {...options} />
        ))}
      </Tabs>
      {shadow && (
        <Divider
          sx={{
            mt: -1,
            boxShadow: '1px 1px 3px 1px rgba(0, 0, 0, 0.2)',
          }}
        />
      )}
    </Box>
  );
};
