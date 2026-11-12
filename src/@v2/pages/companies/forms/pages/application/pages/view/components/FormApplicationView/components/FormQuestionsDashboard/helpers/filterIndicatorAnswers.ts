import type { FormAnswerBrowseModel } from '@v2/models/form/models/form-questions-answers/form-answer-browse.model';

export const PARTIAL_RESULTS_MINIMUM = 3;

export function filterIndicatorAnswers(
  answers: FormAnswerBrowseModel[],
  participantIds?: Set<string> | null,
  validOptionIds?: Set<string>,
): FormAnswerBrowseModel[] {
  const selected = participantIds
    ? answers.filter((answer) => participantIds.has(answer.participantsAnswersId))
    : answers;
  if (!validOptionIds) return selected;

  const respondents = (items: FormAnswerBrowseModel[]) =>
    new Set(
      items
        .filter((answer) =>
          answer.selectedOptionsIds.some((id) => validOptionIds.has(id)),
        )
        .map((answer) => answer.participantsAnswersId),
    ).size;

  const count = respondents(selected);
  const outside = participantIds ? respondents(answers) - count : 0;
  return count >= PARTIAL_RESULTS_MINIMUM &&
    (outside === 0 || outside >= PARTIAL_RESULTS_MINIMUM)
    ? selected
    : [];
}
