import { useMutation } from 'react-query';

import { generateCompanyExamRiskAiPromptDraft } from '../company-exam-risk-ai-suggestions.service';
import type { IGenerateCompanyExamRiskAiPromptDraftParams } from '../company-exam-risk-ai-suggestions.types';

export const useGenerateCompanyExamRiskAiPromptDraft = () =>
  useMutation((params: IGenerateCompanyExamRiskAiPromptDraftParams) =>
    generateCompanyExamRiskAiPromptDraft(params),
  );
