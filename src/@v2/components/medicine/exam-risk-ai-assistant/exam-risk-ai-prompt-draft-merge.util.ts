import type { ExamRiskAiAssistantFormValues } from '@v2/components/medicine/exam-risk-ai-assistant/exam-risk-ai-assistant.types';
import type { IGenerateCompanyExamRiskAiPromptDraftResponse } from '@v2/services/medicine/company-exam-risk-ai-suggestions/company-exam-risk-ai-suggestions.types';

export type ExamRiskAiPromptDraftCurrentState = {
  presetName: string;
  presetDescription: string;
  formValues: ExamRiskAiAssistantFormValues;
};

export type ExamRiskAiPromptDraftMergeMode = 'empty-only' | 'replace-all';

const hasText = (value?: string | number | null) => {
  if (value == null) return false;
  return String(value).trim().length > 0;
};

export const hasAnyExamRiskAiPromptDraftFieldFilled = (
  state: ExamRiskAiPromptDraftCurrentState,
): boolean => {
  const { presetName, presetDescription, formValues } = state;

  return (
    hasText(presetName) ||
    hasText(presetDescription) ||
    hasText(formValues.examSearch) ||
    hasText(formValues.examType) ||
    hasText(formValues.instructions) ||
    hasText(formValues.positiveExamples) ||
    hasText(formValues.negativeExamples) ||
    hasText(formValues.cautionRules) ||
    hasText(formValues.sessionInstruction) ||
    (formValues.limit !== 30 && hasText(formValues.limit))
  );
};

const pickField = <T>(params: {
  current: T;
  draft: T;
  mode: ExamRiskAiPromptDraftMergeMode;
  isEmpty: (value: T) => boolean;
}) => {
  if (params.mode === 'replace-all') return params.draft;
  return params.isEmpty(params.current) ? params.draft : params.current;
};

export const applyExamRiskAiPromptDraft = (
  current: ExamRiskAiPromptDraftCurrentState,
  draft: IGenerateCompanyExamRiskAiPromptDraftResponse,
  mode: ExamRiskAiPromptDraftMergeMode,
): ExamRiskAiPromptDraftCurrentState => ({
  presetName: pickField({
    current: current.presetName,
    draft: draft.modelName,
    mode,
    isEmpty: (value) => !hasText(value),
  }),
  presetDescription: pickField({
    current: current.presetDescription,
    draft: draft.modelDescription,
    mode,
    isEmpty: (value) => !hasText(value),
  }),
  formValues: {
    ...current.formValues,
    examSearch: pickField({
      current: current.formValues.examSearch,
      draft: draft.examSearch,
      mode,
      isEmpty: (value) => !hasText(value),
    }),
    examType: pickField({
      current: current.formValues.examType,
      draft: draft.examType ?? '',
      mode,
      isEmpty: (value) => !hasText(value),
    }),
    limit: pickField({
      current: current.formValues.limit,
      draft: draft.suggestedCandidateLimit,
      mode,
      isEmpty: (value) => value === 30,
    }),
    instructions: pickField({
      current: current.formValues.instructions,
      draft: draft.instructions,
      mode,
      isEmpty: (value) => !hasText(value),
    }),
    positiveExamples: pickField({
      current: current.formValues.positiveExamples,
      draft: draft.positiveExamples,
      mode,
      isEmpty: (value) => !hasText(value),
    }),
    negativeExamples: pickField({
      current: current.formValues.negativeExamples,
      draft: draft.negativeExamples,
      mode,
      isEmpty: (value) => !hasText(value),
    }),
    cautionRules: pickField({
      current: current.formValues.cautionRules,
      draft: draft.cautions,
      mode,
      isEmpty: (value) => !hasText(value),
    }),
    sessionInstruction: pickField({
      current: current.formValues.sessionInstruction,
      draft: draft.sessionAdditionalInstruction,
      mode,
      isEmpty: (value) => !hasText(value),
    }),
  },
});
