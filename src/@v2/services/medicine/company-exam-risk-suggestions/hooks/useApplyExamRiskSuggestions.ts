import { useMutation } from 'react-query';

import { applyExamRiskSuggestions } from '../company-exam-risk-suggestions.service';
import type { IApplyExamRiskSuggestionsParams } from '../company-exam-risk-suggestions.types';

export const useApplyExamRiskSuggestions = () =>
  useMutation((params: IApplyExamRiskSuggestionsParams) =>
    applyExamRiskSuggestions(params),
  );

/** Always refresh after an uncertain confirmation outcome; never assume a failed HTTP response means no write occurred. */
export async function confirmPreviewedExamRiskSuggestions(
  apply: (
    params: IApplyExamRiskSuggestionsParams,
  ) => Promise<
    import('../company-exam-risk-suggestions.types').IApplyExamRiskSuggestionsResponse
  >,
  params: IApplyExamRiskSuggestionsParams,
  onChanged: () => void,
) {
  if (!params.expectedPreviewFingerprint)
    throw new Error('Refaça a prévia antes de confirmar.');
  let response: import('../company-exam-risk-suggestions.types').IApplyExamRiskSuggestionsResponse;
  try {
    response = await apply(params);
  } catch (error) {
    onChanged();
    throw error;
  }
  onChanged();
  return response;
}
