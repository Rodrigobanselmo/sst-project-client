import { useQuery } from '@tanstack/react-query';

import { readConsolidatedViewQuestionsAnswers } from '../service/read-consolidated-view-questions-answers.service';

export const useFetchConsolidatedViewQuestionsAnswers = (
  params: {
    companyGroupId: number;
    applicationIds?: string[];
  },
  options?: { enabled?: boolean },
) => {
  const query = useQuery({
    queryKey: [
      'consolidated-view-questions-answers',
      params.companyGroupId,
      params.applicationIds,
    ],
    queryFn: () => readConsolidatedViewQuestionsAnswers(params),
    enabled: options?.enabled ?? true,
  });

  return {
    questionsAnswersData: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
