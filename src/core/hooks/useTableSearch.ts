/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from 'react';

import Fuse from 'fuse.js';
import { useDebouncedCallback } from 'use-debounce';

interface IUseTableSearch {
  data: any[];
  keys: Fuse.FuseOptionKey[];
  rowsPerPage?: number;
  minLengthSearch?: number;
  threshold?: number;
  limit?: number;
  shouldSort?: boolean;
  sort?: (a: any, b: any) => number;
  transformSearchTextBefore?: (search: string) => string;
}

export const useTableSearch = ({
  data,
  keys,
  sort,
  rowsPerPage = 10,
  shouldSort = true,
  limit = 20,
  threshold,
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
    return new Fuse(data, {
      keys,
      ignoreLocation: true,
      threshold,
      shouldSort,
    });
  }, [data, keys, threshold, shouldSort]);

  const results = useMemo(() => {
    let searchValue =
      minLengthSearch && minLengthSearch > 0 && search.length < minLengthSearch
        ? ''
        : search;

    if (transformSearchTextBefore) {
      searchValue = transformSearchTextBefore(searchValue);
    }

    const fuseResults = fuse.search(searchValue, { limit });
    const resultSearch = searchValue
      ? fuseResults.map((result) => result.item)
      : sort
      ? Array.isArray(data)
        ? data.sort(sort)
        : []
      : data;

    if (rowsPerPage)
      return resultSearch.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    return resultSearch;
  }, [
    data,
    fuse,
    limit,
    minLengthSearch,
    page,
    rowsPerPage,
    search,
    sort,
    transformSearchTextBefore,
  ]);

  return { results, handleSearchChange, fuse, search, page, setPage };
};
