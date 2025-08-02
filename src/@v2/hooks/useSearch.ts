/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from 'react';

import Fuse from 'fuse.js';
import { useDebouncedCallback } from 'use-debounce';
import { removeAccents } from '@v2/utils/remove-accesnts';

interface IUseTableSearch<T> {
  data: T[];
  keys: Fuse.FuseOptionKey<T>[];
  threshold?: number;
  limit?: number;
  sort?: (a: T, b: T) => number;
}

export function useSearch<T>({
  data,
  keys,
  sort,
  limit,
  threshold,
}: IUseTableSearch<T>) {
  const [search, setSearch] = useState<string>('');

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 300);

  const fuse = useMemo(() => {
    const normalizedData = data.map((item) => {
      const normalizedItem = { ...item };

      keys.forEach((key) => {
        const keyString = key as string;
        normalizedItem[keyString] = removeAccents(item[keyString] as string);
      });

      return normalizedItem;
    });

    return new Fuse(normalizedData, {
      keys,
      ignoreLocation: true,
      threshold,
    });
  }, [data, keys, threshold]);

  const results = useMemo(() => {
    const searchValue = search;

    const fuseResults = fuse.search(searchValue, limit ? { limit } : undefined);
    const resultSearch = searchValue
      ? fuseResults.map((result) => result.item)
      : sort
        ? Array.isArray(data)
          ? data.sort(sort)
          : []
        : data;

    return resultSearch;
  }, [data, fuse, limit, search, sort]);

  return { results, onSearch: handleSearchChange, fuse, search };
}
