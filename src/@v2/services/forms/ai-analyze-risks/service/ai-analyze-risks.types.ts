import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';
import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';

export interface AiAnalyzeFormQuestionsRisksParams {
  companyId: string;
  formApplicationId: string;
  customPrompt?: string;
  model?: string; // Optional AI model to use (e.g., 'gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo')
}

export type AiRiskAnalysisResponse = {
  frps: string; // Nome do FRPS
  fontesGeradoras: Array<{
    nome: string;
    justificativa: string;
    origem: 'sistema' | 'ia'; // 'sistema' for existing, 'ia' for AI suggestions
  }>;
  medidasEngenhariaRecomendadas: Array<{
    nome: string;
    justificativa: string;
    origem: 'sistema' | 'ia'; // modificações recomendadas no local/equipamento para isolar/remover perigo
  }>;
  medidasAdministrativasRecomendadas: Array<{
    nome: string;
    justificativa: string;
    origem: 'sistema' | 'ia'; // organização recomendada do trabalho para reduzir exposição
  }>;
};

export type HierarchyRiskAnalysis = {
  hierarchyId: string;
  hierarchyName: string;
  riskId: string;
  riskName: string;
  riskType: RiskTypeEnum;
  probability: number;
  analysis: AiRiskAnalysisResponse;
  confidence: number;
  questionsAnalyzed: number;
  metadata?: Record<string, any>;
};

export type Result = {
  analyses: HierarchyRiskAnalysis[];
  totalHierarchies: number;
  totalRisks: number;
  totalAnalyses: number;
  metadata: {
    companyId: string;
    formApplicationId: string;
    timestamp: string;
    model?: string;
    processingTimeMs: number;
    failedAnalyses?: number;
  };
};
