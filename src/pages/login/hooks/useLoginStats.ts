import { useQuery } from '@tanstack/react-query';

import { fetchLoginStats } from '../services/fetch-login-stats';

export const LOGIN_STATS_QUERY_KEY = ['public', 'login-stats'] as const;

export function useLoginStats() {
  return useQuery({
    queryKey: LOGIN_STATS_QUERY_KEY,
    queryFn: fetchLoginStats,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 12 * 60 * 60 * 1000,
  });
}
