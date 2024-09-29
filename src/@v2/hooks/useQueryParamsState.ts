import {
  IObjectToQueryParamsProps,
  objectToQueryParams,
} from '@v2/utils/object-to-query-params';
import { queryParamsToObject } from '@v2/utils/query-params-to-object';
import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';

export function useQueryParamsState<T = IObjectToQueryParamsProps>() {
  const router = useRouter();
  const queryParams = useMemo(
    () => queryParamsToObject(window.location.search) as unknown as T,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.query],
  );

  const setQueryParams = useCallback(
    (values: T) => {
      const queryString = window.location.search;
      const queryObject = queryParamsToObject(queryString);

      Object.entries(values as any).forEach(([key, value]) => {
        if (value === null) delete queryObject[key];
        if (value instanceof Date) queryObject[key] = value.toISOString();
        else (queryObject as any)[key] = value;
      });

      const pathname = `${window.location.pathname}?${objectToQueryParams(
        queryObject,
      )}`;

      router.replace(pathname, undefined, { shallow: true });
    },
    [router],
  );

  return {
    queryParams,
    setQueryParams,
  };
}
