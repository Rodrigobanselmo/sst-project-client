import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { normalizeFormQuestionsAnswersBrowsePayload } from '@v2/models/form/helpers/normalize-form-questions-answers-browse-payload';
import { FormQuestionsAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-questions-answers-browse.model';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { BrowseFormQuestionsAnswersParams } from './browse-form-questions-answers.types';

export async function browseFormQuestionsAnswers({
  companyId,
  formApplicationId,
  search,
}: BrowseFormQuestionsAnswersParams) {
  const response = await api.get(
    bindUrlParams({
      path: FormRoutes.FORM_QUESTIONS_ANSWERS.PATH,
      pathParams: { companyId },
      queryParams: { formApplicationId, search },
    }),
  );

  const normalized = normalizeFormQuestionsAnswersBrowsePayload(response.data);

  if (process.env.NODE_ENV !== 'production') {
    const raw = response.data as Record<string, unknown>;
    console.debug('[browseFormQuestionsAnswers] participantStructures', {
      rawHasField:
        'participantStructures' in raw || 'participant_structures' in raw,
      rawLength: Array.isArray(raw.participantStructures)
        ? raw.participantStructures.length
        : Array.isArray(raw.participant_structures)
          ? raw.participant_structures.length
          : 0,
      normalizedLength: normalized.participantStructures?.length ?? 0,
    });
  }

  return new FormQuestionsAnswersBrowseModel(normalized);
}
