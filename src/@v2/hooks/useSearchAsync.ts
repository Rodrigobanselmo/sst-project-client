/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface IUseTableSearch<T> {
  onSearchFunc: (serach: string) => void;
}

export function useSearchAsync<T>({ onSearchFunc }: IUseTableSearch<T>) {
  const [search, setSearch] = useState<string>('');

  const onSearch = useDebouncedCallback((value: string) => {
    onSearchFunc(value);
    setSearch(value);
  }, 600);

  return { onSearch, search };
}
