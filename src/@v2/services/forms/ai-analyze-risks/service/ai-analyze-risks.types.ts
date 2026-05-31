import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';

export enum AiAnalyzeFormQuestionsRisksModeEnum {
  FULL = 'FULL',
  FULL_INCREMENTAL = 'FULL_INCREMENTAL',
  TARGET = 'TARGET',
}

export interface AiAnalyzeFormQuestionsRisksParams {
  companyId: string;
  formApplicationId: string;
  mode?: AiAnalyzeFormQuestionsRisksModeEnum;
  riskId?: string;
  hierarchyId?: string;
  customPrompt?: string;
  model?: string;
}

export type AiRiskAnalysisResponse = {
  frps: string;
  fontesGeradoras: Array<{
    nome: string;
    justificativa: string;
    origem: 'sistema' | 'ia';
  }>;
  medidasEngenhariaRecomendadas: Array<{
    nome: string;
    justificativa: string;
    origem: 'sistema' | 'ia';
  }>;
  medidasAdministrativasRecomendadas: Array<{
    nome: string;
    justificativa: string;
    origem: 'sistema' | 'ia';
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
    analysesQueued?: number;
    analysesSkipped?: number;
    analysesComplemented?: number;
    mode?: AiAnalyzeFormQuestionsRisksModeEnum;
    targetRiskId?: string;
    targetHierarchyId?: string;
  };
};
