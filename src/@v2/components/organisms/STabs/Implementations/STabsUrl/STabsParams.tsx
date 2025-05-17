import { Box } from '@mui/material';

import { useAppRouter } from '@v2/hooks/useAppRouter';
import { STabs } from '../../STabs';
import { STabsProps } from '../../STabs.types';
import { TabSkeleton } from './components/TabSkeleton';

interface STabsParamsProps
  extends Omit<STabsProps<string>, 'value' | 'onChange'> {
  paramName: string;
  startValue?: string;
  isLoading?: boolean;
  onChangeTab?: (value: string) => void;
}

export function STabsParams({
  tabsProps,
  paramName,
  startValue,
  isLoading,
  options,
  onChangeTab,
  containerProps,
  ...props
}: STabsParamsProps) {
  const { params, replaceParams } = useAppRouter();
  const value = params[paramName] || startValue || options[0]?.value;

  const onChange = (_: React.SyntheticEvent, value: string) => {
    replaceParams({ pathParams: { [paramName]: value } });
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
}
