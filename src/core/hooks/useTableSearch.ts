/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from 'react';

import Fuse from 'fuse.js';
import { useDebouncedCallback } from 'use-debounce';

interface IUseTableSearch {
  data: any[];
  keys: Fuse.FuseOptionKey[];
  sort?: (a: any, b: any) => number;
}

export const useTableSearch = ({ data, keys, sort }: IUseTableSearch) => {
  const [search, setSearch] = useState<string>('');

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 300);

  const fuse = useMemo(() => {
    return new Fuse(data, { keys, ignoreLocation: true });
  }, [data, keys]);

  const results = useMemo(() => {
    const fuseResults = fuse.search(search, { limit: 20 });
    return search
      ? fuseResults.map((result) => result.item)
      : sort
      ? data.sort(sort)
      : data;
  }, [data, fuse, search, sort]);

  return { results, handleSearchChange, fuse, search };
};
