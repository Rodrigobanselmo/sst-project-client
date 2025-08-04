import { useSearchAsync } from '@v2/hooks/useSearchAsync';
import { PopperSelectComponent } from './components/PopperSelectComponent';
import { PopperSelectProps } from './types';

interface PopperSelectSearchProps {
  onSearchFunc: (value: string) => void;
  hideSearchInput?: boolean;
}

export type PopperSelectAsyncProps<Value> = PopperSelectProps<Value> &
  PopperSelectSearchProps;

export function PopperSelectAsync<T>({
  options,
  onSearchFunc,
  hideSearchInput,
  ...props
}: PopperSelectAsyncProps<T>) {
  const { onSearch, search } = useSearchAsync({
    onSearchFunc,
  });

  return (
    <PopperSelectComponent
      {...props}
      hideSearchInput={hideSearchInput}
      onSearch={onSearch}
      options={options.map((option) => ({
        label: props.getOptionLabel(option),
        option,
      }))}
      search={search}
    />
  );
}
