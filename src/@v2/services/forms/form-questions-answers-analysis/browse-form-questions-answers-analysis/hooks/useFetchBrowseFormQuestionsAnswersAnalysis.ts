import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import { FormAiAnalysisStatusEnum } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';
import { useEffect } from 'react';
import { browseFormQuestionsAnswersAnalysis } from '../service/browse-form-questions-answers-analysis.service';
import { BrowseFormQuestionsAnswersAnalysisParams } from '../service/browse-form-questions-answers-analysis.types';

// Window used to consider a PROCESSING record as "still in flight". Extended to 60
// minutes to accommodate long AI batches running in background on the API side. Beyond
// this window a record is considered stale (likely the background runner died before
// resolving it) and polling stops so the user can retry.
const PROCESSING_FRESHNESS_MS = 60 * 60 * 1000;

export const hasRecentProcessingAnalyses = (
  analyses: any[] | undefined,
): boolean => {
  if (!analyses) return false;

  const freshnessThreshold = new Date(Date.now() - PROCESSING_FRESHNESS_MS);
  return analyses.some((analysis) => {
    if (analysis.status !== FormAiAnalysisStatusEnum.PROCESSING) return false;
    const referenceDate = new Date(analysis.updatedAt ?? analysis.createdAt);
    return referenceDate > freshnessThreshold;
  });
};

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

  // Implement polling when there are analyses with PROCESSING status (created within last 10 minutes)
  useEffect(() => {
    // Check if there are any analyses with PROCESSING status created within last 10 minutes
    const hasProcessingAnalyses = hasRecentProcessingAnalyses(data?.results);

    if (hasProcessingAnalyses) {
      // Set up polling every 10 seconds
      const interval = setInterval(() => {
        // Check if any input or textarea is currently focused
        const activeElement = document.activeElement;
        const isInputFocused =
          activeElement &&
          (activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA');

        // Only refetch if no input is focused
        if (!isInputFocused) {
          refetch();
        }
      }, 10000);

      // Cleanup interval on unmount or when no longer processing
      return () => clearInterval(interval);
    }
  }, [data, refetch]);

  return {
    ...response,
    refetch,
    formQuestionsAnswersAnalysis: data,
  };
};
