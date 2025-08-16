import React, { forwardRef, useImperativeHandle } from 'react';
import { Box } from '@mui/material';

import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { STabs } from '../../STabs';
import { STabsProps } from '../../STabs.types';
import { TabSkeleton } from './components/TabSkeleton';

interface STabsQueryParamsProps<T>
  extends Omit<STabsProps<T>, 'value' | 'onChange'> {
  uniqueName: string;
  startValue?: T;
  isLoading?: boolean;
  onChangeTab?: (value: T) => void;
}

// Type for the imperative ref
export interface STabsQueryParamsRef<T> {
  getValue: () => T;
}

export const STabsQueryParams = forwardRef(function STabsQueryParams<T>(
  {
    tabsProps,
    uniqueName,
    startValue,
    isLoading,
    options,
    onChangeTab,
    containerProps,
    ...props
  }: STabsQueryParamsProps<T>,
  ref: React.Ref<STabsQueryParamsRef<T>>,
) {
  const { queryParams, setQueryParams } = useQueryParamsState<{
    tabs?: { name: string; value: T }[];
  }>();

  const tabUrl = queryParams.tabs?.find((tab) => tab.name === uniqueName);
  const value = tabUrl?.value || startValue || options[0]?.value;

  useImperativeHandle(
    ref,
    () => ({
      getValue: () => value,
    }),
    [value],
  );

  const onChange = (_: React.SyntheticEvent, value: T) => {
    const newTabs = [...(queryParams.tabs || [])];
    const tabIndex = newTabs.findIndex((tab) => tab.name === uniqueName);

    if (tabIndex > -1) {
      newTabs[tabIndex].value = value;
    } else {
      newTabs.push({ name: uniqueName, value });
    }

    setQueryParams({ tabs: newTabs });
    onChangeTab?.(value);
  };

  if (isLoading)
    return (
      <Box {...containerProps}>
        <TabSkeleton repeat={4} />
      </Box>
    );

  if (options.length === 1) return options[0].component;

  return (
    <STabs {...props} options={options} value={value} onChange={onChange} />
  );
});
