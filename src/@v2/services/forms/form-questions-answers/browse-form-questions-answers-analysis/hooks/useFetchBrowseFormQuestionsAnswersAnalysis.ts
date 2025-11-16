import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import { browseFormQuestionsAnswersAnalysis } from '../service/browse-form-questions-answers-analysis.service';
import { BrowseFormQuestionsAnswersAnalysisParams } from '../service/browse-form-questions-answers-analysis.types';

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
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return browseFormQuestionsAnswersAnalysis(params);
    },
    queryKey: getKeyBrowseFormQuestionsAnswersAnalysis(params),
    enabled: !!params.companyId && !!params.applicationId,
  });

  return {
    ...response,
    formQuestionsAnswersAnalysis: data,
  };
};
