import { useSearch } from '@v2/hooks/useSearch';
import { PopperSelectComponent } from './components/PopperSelectComponent';
import { PopperSelectProps } from './types';

export type PopperSelectMemorizedProps<Value> = PopperSelectProps<Value> & {
  hideSearchInput?: boolean;
};

export function PopperSelectMemorized<T>({
  options,
  hideSearchInput,
  ...props
}: PopperSelectMemorizedProps<T>) {
  const { results, onSearch, search } = useSearch({
    data: options.map((option) => ({
      label: props.getOptionLabel(option),
      option,
    })),
    keys: ['label'],
    threshold: 0,
  });

  return (
    <PopperSelectComponent
      {...props}
      hideSearchInput={hideSearchInput}
      onSearch={onSearch}
      options={results}
      search={search}
    />
  );
}
