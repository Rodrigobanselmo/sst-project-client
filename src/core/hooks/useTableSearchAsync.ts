import { useState } from 'react';

import { useDebouncedCallback } from 'use-debounce';

type Options = {
  initialSearch?: string;
  initialPage?: number;
};

export const useTableSearchAsync = (options?: Options) => {
  const [search, setSearch] = useState<string>(options?.initialSearch ?? '');
  const [page, setPage] = useState(options?.initialPage ?? 1);

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, 300);

  return { handleSearchChange, search, setSearch, setPage, page };
};
