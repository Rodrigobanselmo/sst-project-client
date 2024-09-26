import { QueryKey, useQueryClient } from '@tanstack/react-query';

export const useInvalidateQuery = () => {
  const queryClient = useQueryClient();

  function invalidateQueryKey(invalidateQueryKey: QueryKey) {
    queryClient.invalidateQueries({
      queryKey: invalidateQueryKey,
      refetchType: 'all',
    });
  }
  return { invalidateQueryKey };
};
