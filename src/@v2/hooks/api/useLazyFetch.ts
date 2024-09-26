import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export interface IUseLazyFetchProps<T> {
  queryKey: any[];
  queryFn: () => Promise<T>;
  onError?: (error: any) => void;
  onSuccess?: (data: T) => void;
}

export const useLazyFetch = <T>(params: IUseLazyFetchProps<T>) => {
  const { queryKey, queryFn, onError } = params;
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const fetch = async () => {
    setIsLoading(true);

    const data = await queryClient
      .fetchQuery({
        queryKey,
        queryFn,
        staleTime: 10000,
      })
      .then((response) => {
        if (response) {
          if (params.onSuccess) {
            params.onSuccess(response);
          }
        }
        return response;
      })
      .catch((error) => {
        if (onError) {
          onError(error);
          throw error;
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    return data;
  };

  return { fetch, isLoading };
};
