import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import { useEffect } from 'react';
import { browseFormQuestionsAnswersAnalysis } from '../service/browse-form-questions-answers-analysis.service';
import { BrowseFormQuestionsAnswersAnalysisParams } from '../service/browse-form-questions-answers-analysis.types';
import { hasRecentProcessingAnalyses } from '../../shared/form-ai-analysis-processing.utils';

export { hasRecentProcessingAnalyses } from '../../shared/form-ai-analysis-processing.utils';

export const getKeyBrowseFormQuestionsAnswersAnalysis = (
  params: BrowseFormQuestionsAnswersAnalysisParams,
) => {
  return [
    QueryKeyFormEnum.FORM_QUESTIONS_ANSWERS_ANALYSIS,
    params.companyId,
    params.applicationId,
  ];
};

export const useFetchBrowseFormQuestionsAnswersAnalysis = (
  params: BrowseFormQuestionsAnswersAnalysisParams,
) => {
  const { data, refetch, ...response } = useFetch({
    queryFn: async () => {
      return browseFormQuestionsAnswersAnalysis(params);
    },
    queryKey: getKeyBrowseFormQuestionsAnswersAnalysis(params),
    enabled: !!params.companyId && !!params.applicationId,
  });

  useEffect(() => {
    const hasProcessingAnalyses = hasRecentProcessingAnalyses(data?.results);

    if (hasProcessingAnalyses) {
      const interval = setInterval(() => {
        const activeElement = document.activeElement;
        const isInputFocused =
          activeElement &&
          (activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA');

        if (!isInputFocused) {
          refetch();
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [data, refetch]);

  return {
    ...response,
    refetch,
    formQuestionsAnswersAnalysis: data,
  };
};
