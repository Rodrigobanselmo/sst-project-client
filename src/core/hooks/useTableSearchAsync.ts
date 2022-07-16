import { useState } from 'react';

import { useDebouncedCallback } from 'use-debounce';

// interface IUseTableSearch {}

export const useTableSearchAsync = () => {
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState(1);

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, 300);

  return { handleSearchChange, search, setPage, page };
};
