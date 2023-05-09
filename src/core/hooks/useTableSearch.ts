/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from 'react';

import Fuse from 'fuse.js';
import { useDebouncedCallback } from 'use-debounce';

interface IUseTableSearch {
  data: any[];
  keys: Fuse.FuseOptionKey[];
  rowsPerPage?: number;
  minLengthSearch?: number;
  sort?: (a: any, b: any) => number;
  transformSearchTextBefore?: (search: string) => string;
}

export const useTableSearch = ({
  data,
  keys,
  sort,
  rowsPerPage = 10,
  minLengthSearch,
  transformSearchTextBefore,
}: IUseTableSearch) => {
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState(1);

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, 300);

  const fuse = useMemo(() => {
    return new Fuse(data, { keys, ignoreLocation: true });
  }, [data, keys]);

  const results = useMemo(() => {
    let searchValue =
      minLengthSearch && minLengthSearch > 0 && search.length < minLengthSearch
        ? ''
        : search;

    if (transformSearchTextBefore) {
      searchValue = transformSearchTextBefore(searchValue);
    }

    const fuseResults = fuse.search(searchValue, { limit: 20 });
    const resultSearch = searchValue
      ? fuseResults.map((result) => result.item)
      : sort
      ? Array.isArray(data)
        ? data.sort(sort)
        : []
      : data;

    return resultSearch.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  }, [data, fuse, minLengthSearch, page, rowsPerPage, search, sort]);

  return { results, handleSearchChange, fuse, search, page, setPage };
};
