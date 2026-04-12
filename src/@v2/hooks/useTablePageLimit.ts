import { useCallback, useMemo } from 'react';

import {
  DEFAULT_TABLE_PAGE_LIMIT,
  isAllowedTablePageLimit,
  TABLE_PAGE_SIZE_OPTIONS,
} from '@v2/constants/table-pagination.constants';

import { persistKeys, usePersistedState } from './usePersistState';

export function useTablePageLimit(
  urlLimit: number | undefined,
  storageKey: persistKeys,
) {
  const [persistedLimit, setPersistedLimit] = usePersistedState<number>(
    storageKey,
    DEFAULT_TABLE_PAGE_LIMIT,
  );

  const pageLimit = useMemo(() => {
    if (urlLimit != null && isAllowedTablePageLimit(urlLimit)) {
      return urlLimit;
    }
    return isAllowedTablePageLimit(persistedLimit)
      ? persistedLimit
      : DEFAULT_TABLE_PAGE_LIMIT;
  }, [urlLimit, persistedLimit]);

  const resetPersistedLimit = useCallback(() => {
    setPersistedLimit(DEFAULT_TABLE_PAGE_LIMIT);
  }, [setPersistedLimit]);

  const createPageSizeChangeHandler = useCallback(
    (onFilterData: (patch: { limit?: number; page?: number }) => void) =>
      (size: number) => {
        if (!isAllowedTablePageLimit(size)) return;
        setPersistedLimit(size);
        onFilterData({ limit: size, page: 1 });
      },
    [setPersistedLimit],
  );

  return {
    pageLimit,
    pageSizeOptions: [...TABLE_PAGE_SIZE_OPTIONS],
    resetPersistedLimit,
    createPageSizeChangeHandler,
    defaultLimit: DEFAULT_TABLE_PAGE_LIMIT,
  };
}
