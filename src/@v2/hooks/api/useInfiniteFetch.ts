import { useInfiniteQuery } from '@tanstack/react-query';

export interface IUseFetchProps<T> {
  queryKey: any[];
  queryFn: () => Promise<T>;
  getNextPageParam: (lastPage: T) => number | null;
  refetchInterval?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  enabled?: boolean;
}

export const useInfiniteFetch = <T>(params: IUseFetchProps<T>) => {
  const query = useInfiniteQuery<T>({
    getNextPageParam: (lastPage) => params.getNextPageParam(lastPage),
    queryFn: params.queryFn,
    initialPageParam: 0,
    queryKey: params.queryKey,
    refetchInterval: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return query;
};
