import { Box, BoxProps, TabsProps } from '@mui/material';

import { STabs } from '../../STabs';
import { STabsProps } from '../../STabs.types';
import { TabSkeleton } from './components/TabSkeleton';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { IActionPlanFilterProps } from '@v2/components/organisms/STable/implementation/SActionPlanTable/SActionPlanTable.types';
import { TabsNameEnum } from './enums/tabs.enum';

interface CTabsProps {
  // options: STabOption[];
  tabsProps: STabsProps<any>;
  name: TabsNameEnum;
  boxProps?: BoxProps;
  containerProps?: BoxProps;

  startIndex?: number;
  tabsWrapperProps?: TabsProps;
  tabsBody: React.ReactNode[];
  isLoading?: boolean;
  onChangeTab?: (index: number) => void;
}

//! need work a lot
export const CTabs = ({
  tabsProps,
  name,
  startIndex,
  tabsBody,
  boxProps,
  isLoading,
  containerProps,
  onChangeTab,
}: CTabsProps) => {
  const { queryParams, setQueryParams } = useQueryParamsState<{
    tabs?: { name: string; value: number }[];
  }>();

  const tabFromUrl = queryParams.tabs?.find((tab) => tab.name === name);

  if (isLoading) return <TabSkeleton repeat={4} />;

  return (
    <Box {...boxProps}>
      <STabs {...tabsProps} />
      <Box pt={1} {...containerProps}>
        {tabsBody[tabFromUrl?.value || startIndex || 0]}
      </Box>
    </Box>
  );
};
