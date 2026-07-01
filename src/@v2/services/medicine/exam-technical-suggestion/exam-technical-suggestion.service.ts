import { ExamTechnicalSuggestionRoutes } from '@v2/constants/routes/exam-technical-suggestion.routes';
import { api } from 'core/services/apiClient';

export type ExamTechnicalSuggestionSource = 'NR_07' | 'ACGIH_BEI' | 'MIXED' | 'NONE';

export type IExamTechnicalSuggestion = {
  material?: string;
  analyses?: string;
  instruction?: string;
  source: ExamTechnicalSuggestionSource;
  shouldApply: {
    material: boolean;
    analyses: boolean;
    instruction: boolean;
  };
  notes: string[];
};

export async function fetchExamTechnicalSuggestion(params: {
  companyId: string;
  riskFactorId: string;
  examId: number;
}): Promise<IExamTechnicalSuggestion> {
  const response = await api.get<IExamTechnicalSuggestion>(
    ExamTechnicalSuggestionRoutes.SUGGEST,
    { params },
  );
  return response.data;
}
