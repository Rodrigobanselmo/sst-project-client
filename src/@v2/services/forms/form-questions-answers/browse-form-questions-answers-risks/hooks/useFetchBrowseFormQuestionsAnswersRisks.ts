import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import { browseFormQuestionsAnswersRisks } from '../service/browse-form-questions-answers-risks.service';
import { BrowseFormQuestionsAnswersRisksParams } from '../service/browse-form-questions-answers-risks.types';

export const getKeyBrowseFormQuestionsAnswersRisks = (
  params: BrowseFormQuestionsAnswersRisksParams,
) => {
  return [
    QueryKeyFormEnum.FORM_QUESTIONS_ANSWERS_RISKS,
    params.companyId,
    params,
  ];
};

export const useFetchBrowseFormQuestionsAnswersRisks = (
  params: BrowseFormQuestionsAnswersRisksParams,
) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return browseFormQuestionsAnswersRisks(params);
    },
    queryKey: getKeyBrowseFormQuestionsAnswersRisks(params),
  });

  return {
    ...response,
    formQuestionsAnswersRisks: data,
  };
};
