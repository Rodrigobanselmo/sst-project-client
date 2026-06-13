import { ConsolidatedViewEligibleApplicationModel } from './consolidated-view-eligibility.model';

export type ConsolidatedViewRiskAnalysisCapabilitiesModel = {
  readOnly: true;
  canRecalculateRisk: false;
  canGenerateSources: false;
  canGenerateRecommendations: false;
  canAddToInventory: false;
  canAddToPgr: false;
  canEdit: false;
  canCreateSector: false;
  canCreateGeneratingSource: false;
};

export type ConsolidatedViewRiskAnalysisItemOriginModel = {
  formApplicationId: string;
  companyId: string;
  riskAnalysisId: string | null;
};

export type ConsolidatedViewRiskAnalysisAiItemModel = {
  nome: string;
  justificativa: string;
};

export type ConsolidatedViewRiskAnalysisAiAnalysisModel = {
  frps: string | null;
  confidence: number | null;
  fontesGeradoras: ConsolidatedViewRiskAnalysisAiItemModel[];
  medidasEngenhariaRecomendadas: ConsolidatedViewRiskAnalysisAiItemModel[];
  medidasAdministrativasRecomendadas: ConsolidatedViewRiskAnalysisAiItemModel[];
};

export type ConsolidatedViewRiskAnalysisItemModel = {
  id: string;
  riskAnalysisId: string | null;
  formApplicationId: string;
  applicationName: string;
  companyId: string;
  companyName: string;
  establishmentId: string | null;
  establishmentName: string | null;
  sectorId: string;
  sectorName: string;
  hierarchyId: string;
  hierarchyName: string;
  hierarchyType: string;
  riskFactorId: string;
  riskFactor: string;
  riskCategory: string | null;
  riskType: string;
  probability: number | null;
  probabilityLabel: string;
  severity: number | null;
  severityLabel: string;
  riskLevel: number | null;
  occupationalRisk: string;
  generatingSources: string[];
  recommendations: string[];
  aiAnalysis: ConsolidatedViewRiskAnalysisAiAnalysisModel | null;
  status: string | null;
  inInventory: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  origin: ConsolidatedViewRiskAnalysisItemOriginModel;
};

export type ConsolidatedViewRiskAnalysisWarningModel = {
  formApplicationId: string;
  applicationName: string;
  companyId: string;
  companyName: string;
  message: string;
};

export type ConsolidatedViewRiskAnalysisModel = {
  mode: 'virtual_consolidated';
  businessGroupId: number;
  businessGroupName: string;
  applications: ConsolidatedViewEligibleApplicationModel[];
  summary: {
    totalApplications: number;
    totalCompanies: number;
    totalRiskAnalyses: number;
    totalRiskFactors: number;
    totalSectors: number;
    totalConsolidatedRecords: number;
    hasData: boolean;
  };
  items: ConsolidatedViewRiskAnalysisItemModel[];
  warnings: ConsolidatedViewRiskAnalysisWarningModel[];
  capabilities: ConsolidatedViewRiskAnalysisCapabilitiesModel;
};
