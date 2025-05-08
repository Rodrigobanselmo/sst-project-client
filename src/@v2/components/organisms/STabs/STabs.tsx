import { FC } from 'react';

import { Divider, Skeleton } from '@mui/material';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { STabsProps } from './STabs.types';

export function STabs<T>({
  options,
  shadow,
  value,
  onChange,
  loading,
  containerProps,
  componentProps,
  height,
  tabsProps,
}: STabsProps<T>) {
  if (!loading && !options.length) return null;

  const component = options.find((option) => option.value === value)?.component;

  return (
    <>
      <Box
        {...containerProps}
        sx={{
          borderBottom: shadow ? 0 : 1,
          borderColor: 'divider',
          ...containerProps?.sx,
          ...(!!height && {
            height: height,
          }),
        }}
      >
        <Tabs
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable auto tabs example"
          onChange={onChange}
          value={value}
          {...tabsProps}
          {...(!!height && {
            sx: {
              '& .MuiTabs-scroller': { maxHeight: height },
              svg: { fontSize: 22, pr: 3 },
              ...tabsProps?.sx,
            },
          })}
        >
          {!loading &&
            options.map((options) => (
              <Tab
                sx={{ fontSize: [10, 10, 14], textTransform: 'none' }}
                value={options.value}
                label={options.label}
                key={options.label}
                {...options?.tabProps}
              />
            ))}

          {loading && (
            <>
              <Skeleton
                variant="text"
                sx={{ fontSize: 36, width: 100, mr: 5 }}
              />
              <Skeleton variant="text" sx={{ fontSize: 36, width: 100 }} />
            </>
          )}
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

      {!!component && (
        <Box pt={6} {...componentProps}>
          {component}
        </Box>
      )}
    </>
  );
}
