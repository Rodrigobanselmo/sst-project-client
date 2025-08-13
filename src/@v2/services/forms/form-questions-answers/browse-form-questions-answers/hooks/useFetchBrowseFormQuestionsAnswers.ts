import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import { browseFormQuestionsAnswers } from '../service/browse-form-questions-answers.service';
import { BrowseFormQuestionsAnswersParams } from '../service/browse-form-questions-answers.types';

export const getKeyBrowseFormQuestionsAnswers = (
  params: BrowseFormQuestionsAnswersParams,
) => {
  return [QueryKeyFormEnum.FORM_QUESTIONS_ANSWERS, params.companyId, params];
};

export const useFetchBrowseFormQuestionsAnswers = (
  params: BrowseFormQuestionsAnswersParams,
) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return browseFormQuestionsAnswers(params);
    },
    queryKey: getKeyBrowseFormQuestionsAnswers(params),
  });

  return {
    ...response,
    formQuestionsAnswers: data,
  };
};
