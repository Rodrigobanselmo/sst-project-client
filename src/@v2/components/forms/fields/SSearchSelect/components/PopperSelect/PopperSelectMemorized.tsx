import { removeAccents } from '@v2/utils/remove-accesnts';
import { useMemo, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { PopperSelectComponent } from './components/PopperSelectComponent';
import { PopperSelectProps } from './types';

export type PopperSelectMemorizedProps<Value> = PopperSelectProps<Value> & {
  hideSearchInput?: boolean;
};

function normalizeSearchText(value: string): string {
  return removeAccents(value).toLowerCase().trim();
}

export function PopperSelectMemorized<T>({
  options,
  hideSearchInput,
  ...props
}: PopperSelectMemorizedProps<T>) {
  const [search, setSearch] = useState('');

  const onSearch = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 300);

  const mappedOptions = useMemo(
    () =>
      options.map((option) => ({
        label: props.getOptionLabel(option),
        option,
      })),
    [options, props.getOptionLabel],
  );

  const results = useMemo(() => {
    const term = normalizeSearchText(search);
    if (!term) {
      return mappedOptions;
    }

    return mappedOptions.filter(({ label }) =>
      normalizeSearchText(String(label)).includes(term),
    );
  }, [mappedOptions, search]);

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
