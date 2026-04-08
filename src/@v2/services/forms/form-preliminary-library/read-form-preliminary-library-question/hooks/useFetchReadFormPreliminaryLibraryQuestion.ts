import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import {
  readFormPreliminaryLibraryQuestion,
  ReadFormPreliminaryLibraryQuestionParams,
} from '../service/read-form-preliminary-library-question.service';

export const useFetchReadFormPreliminaryLibraryQuestion = (
  params: ReadFormPreliminaryLibraryQuestionParams & { enabled?: boolean },
) => {
  const { enabled = true, ...readParams } = params;

  const { data, ...response } = useFetch({
    queryFn: async () => readFormPreliminaryLibraryQuestion(readParams),
    queryKey: [
      QueryKeyFormEnum.FORM_PRELIMINARY_LIBRARY_QUESTIONS,
      'read',
      readParams.companyId,
      readParams.questionId,
    ],
    enabled: enabled && !!readParams.companyId && !!readParams.questionId,
  });

  return {
    ...response,
    question: data,
  };
};
