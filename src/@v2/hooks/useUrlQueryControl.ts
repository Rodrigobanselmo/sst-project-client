import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo } from 'react';

export function queryStringToObject(queryString: string) {
  const queryParams: Record<string, string | string[]> = {};
  const searchParams = new URLSearchParams(queryString);

  Array.from(searchParams.entries()).forEach(([key, value]) => {
    if (key in queryParams) {
      const existingValue = queryParams[key];
      queryParams[key] = Array.isArray(existingValue)
        ? [...existingValue, value]
        : [existingValue, value];
    } else {
      queryParams[key] = value;
    }
  });

  return queryParams;
}

interface Props<T> {
  queryName?: string;
  defaultValue?: T | null;
  startValue?: T | null;
  shallow?: boolean;
}

export function useUrlQueryControl<T = string>({
  queryName,
  startValue,
  defaultValue,
  shallow = true,
}: Props<T>) {
  const router = useRouter();
  const queryParam = useMemo(
    () => (queryName ? router.query[queryName] : '') as unknown as T,
    [queryName, router.query],
  );

  const setQueryParam = useCallback(
    (value: T | null, options?: { resetOnChange?: string[] }) => {
      const queryString = window.location.search;
      const queryObject = queryStringToObject(queryString);

      if (queryName) {
        if (value === null) delete queryObject[queryName];
        if (value instanceof Date) queryObject[queryName] = value.toISOString();
        options?.resetOnChange?.forEach(
          (queryName) => delete queryObject[queryName],
        );

        router.push(
          {
            pathname: window.location.pathname,
            query: {
              ...queryObject,
              ...(value !== null && { [queryName]: String(value) }),
            },
          },
          undefined,
          { shallow },
        );
      }
    },
    [queryName, router, shallow],
  );

  const setManyQueryParam = useCallback(
    (values: Record<string, any>) => {
      const queryString = window.location.search;
      const queryObject = queryStringToObject(queryString);

      Object.entries(values).forEach(([key, value]) => {
        if (value === null) delete queryObject[key];
        if (value instanceof Date) queryObject[key] = value.toISOString();
        else queryObject[key] = value;
      });

      router.push(
        {
          pathname: window.location.pathname,
          query: queryObject,
        },
        undefined,
        { shallow },
      );
    },
    [router, shallow],
  );

  const replaceQueryParam = useCallback(
    (
      value: T | null,
      options?: { resetOnChange?: string[]; queryName?: string },
    ) => {
      const queryString = window.location.search;
      const queryObject = queryStringToObject(queryString);
      const queryNameValue = options?.queryName || queryName;

      if (queryNameValue) {
        if (value === null) delete queryObject[queryNameValue];
        if (value instanceof Date)
          queryObject[queryNameValue] = value.toISOString();
        options?.resetOnChange?.forEach(
          (resetQueryName) => delete queryObject[resetQueryName],
        );

        router.replace(
          {
            pathname: window.location.pathname,
            query: {
              ...queryObject,
              ...(value !== null && { [queryNameValue]: String(value) }),
            },
          },
          undefined,
          { shallow },
        );
      }
    },
    [queryName, router, shallow],
  );

  const replaceManyQueryParam = useCallback(
    (values: Record<string, any>) => {
      const queryString = window.location.search;
      const queryObject = queryStringToObject(queryString);

      Object.entries(values).forEach(([key, value]) => {
        if (value === null) delete queryObject[key];
        if (value instanceof Date) queryObject[key] = value.toISOString();
        else queryObject[key] = value;
      });

      router.replace(
        {
          pathname: window.location.pathname,
          query: queryObject,
        },
        undefined,
        { shallow },
      );
    },
    [router, shallow],
  );

  useEffect(() => {
    if (defaultValue !== undefined && queryParam === undefined) {
      replaceQueryParam(defaultValue);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue]);

  useEffect(() => {
    if (startValue !== undefined) {
      replaceQueryParam(startValue);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startValue]);

  return {
    router,
    queryParam,
    setQueryParam,
    setManyQueryParam,
    replaceQueryParam,
    replaceManyQueryParam,
  };
}
