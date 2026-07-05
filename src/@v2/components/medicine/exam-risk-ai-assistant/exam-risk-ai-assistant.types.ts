export type ExamRiskAiAssistantFormValues = {
  examSearch: string;
  examType: string;
  onlyESocial: boolean;
  limit: number;
  instructions: string;
  positiveExamples: string;
  negativeExamples: string;
  cautionRules: string;
  sessionInstruction: string;
  model: string;
};

export type ExamRiskAiAssistantOptionSwitch = {
  key: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export const createDefaultExamRiskAiAssistantFormValues =
  (): ExamRiskAiAssistantFormValues => ({
    examSearch: '',
    examType: '',
    onlyESocial: false,
    limit: 30,
    instructions: '',
    positiveExamples: '',
    negativeExamples: '',
    cautionRules: '',
    sessionInstruction: '',
    model: '',
  });

export const buildExamRiskAiAssistantPayload = (
  values: ExamRiskAiAssistantFormValues,
) => ({
  examFilters: {
    search: values.examSearch.trim() || undefined,
    examType: values.examType || undefined,
    onlyESocial: values.onlyESocial,
    limit: values.limit,
  },
  aiConfig: {
    instructions: values.instructions.trim() || undefined,
    positiveExamples: values.positiveExamples.trim() || undefined,
    negativeExamples: values.negativeExamples.trim() || undefined,
    cautionRules: values.cautionRules.trim() || undefined,
    sessionInstruction: values.sessionInstruction.trim() || undefined,
    model: values.model.trim() || undefined,
  },
});
