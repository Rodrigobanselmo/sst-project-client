import { QueryKey, useInfiniteQuery } from '@tanstack/react-query';

export interface IUseFetchProps<T> {
  queryKey: any[];
  queryFn: (data: { page: number }) => Promise<T>;
  getNextPageParam: (lastPage: T) => number | null;
  refetchInterval?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  enabled?: boolean;
}

export const useInfiniteFetch = <T>(params: IUseFetchProps<T>) => {
  const query = useInfiniteQuery<T>({
    getNextPageParam: (lastPage) => params.getNextPageParam(lastPage),
    queryFn: (data) => {
      return params.queryFn({ page: Number(data.pageParam) || 1 });
    },
    initialPageParam: 0,
    queryKey: params.queryKey,
    refetchInterval: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return query;
};
