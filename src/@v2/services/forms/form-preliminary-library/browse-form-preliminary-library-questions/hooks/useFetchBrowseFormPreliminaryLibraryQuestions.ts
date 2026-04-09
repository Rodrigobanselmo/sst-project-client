import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import { browseFormPreliminaryLibraryQuestions } from '../service/browse-form-preliminary-library-questions.service';
import { BrowseFormPreliminaryLibraryQuestionsParams } from '../service/browse-form-preliminary-library-questions.types';

export const getKeyBrowseFormPreliminaryLibraryQuestions = (
  params: BrowseFormPreliminaryLibraryQuestionsParams,
) => [QueryKeyFormEnum.FORM_PRELIMINARY_LIBRARY_QUESTIONS, params];

export const useFetchBrowseFormPreliminaryLibraryQuestions = (
  params: BrowseFormPreliminaryLibraryQuestionsParams & { enabled?: boolean },
) => {
  const { enabled = true, ...browseParams } = params;

  const { data, ...response } = useFetch({
    queryFn: async () => browseFormPreliminaryLibraryQuestions(browseParams),
    queryKey: getKeyBrowseFormPreliminaryLibraryQuestions(browseParams),
    enabled,
  });

  return {
    ...response,
    browseResult: data,
  };
};
