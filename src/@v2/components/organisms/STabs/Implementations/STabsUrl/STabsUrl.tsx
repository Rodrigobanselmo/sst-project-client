import { Box } from '@mui/material';

import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { STabs } from '../../STabs';
import { STabsProps } from '../../STabs.types';
import { TabSkeleton } from './components/TabSkeleton';

interface STabsUrlProps<T> extends Omit<STabsProps<T>, 'value' | 'onChange'> {
  uniqueName: string;
  startValue?: T;
  isLoading?: boolean;
  onChangeTab?: (value: T) => void;
}

export function STabsUrl<T>({
  tabsProps,
  uniqueName,
  startValue,
  isLoading,
  options,
  onChangeTab,
  containerProps,
  ...props
}: STabsUrlProps<T>) {
  const { queryParams, setQueryParams } = useQueryParamsState<{
    tabs?: { name: string; value: T }[];
  }>();

  const tabUrl = queryParams.tabs?.find((tab) => tab.name === uniqueName);
  const value = tabUrl?.value || startValue || options[0]?.value;

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

  return (
    <STabs {...props} options={options} value={value} onChange={onChange} />
  );
}
