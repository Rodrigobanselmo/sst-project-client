import { useSearchAsync } from '@v2/hooks/useSearchAsync';
import { PopperSelectComponent } from './components/PopperSelectComponent';
import { PopperSelectProps } from './types';

interface PopperSelectSearchProps {
  onSearchFunc: (value: string) => void;
}

export type PopperSelectAsyncProps<Value> = PopperSelectProps<Value> &
  PopperSelectSearchProps;

export function PopperSelectAsync<T>({
  options,
  onSearchFunc,
  ...props
}: PopperSelectAsyncProps<T>) {
  const { onSearch, search } = useSearchAsync({
    onSearchFunc,
  });

  return (
    <PopperSelectComponent
      {...props}
      onSearch={onSearch}
      options={options.map((option) => ({
        label: props.getOptionLabel(option),
        option,
      }))}
      search={search}
    />
  );
}
