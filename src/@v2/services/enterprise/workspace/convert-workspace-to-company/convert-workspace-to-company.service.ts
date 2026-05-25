import { api } from 'core/services/apiClient';
import { CompanyRoutes } from '@v2/constants/routes/company.routes';

export type WorkspaceConvertPreviewApi = {
  workspace: {
    id: string;
    name: string;
    cnpj: string | null;
    isOwner: boolean;
    abbreviation: string | null;
  };
  proposedCompany: {
    name: string;
    cnpj: string | null;
    fantasy: string | null;
    initials: string | null;
  };
  companyGroup: {
    id: number;
    name: string;
  };
  counts: {
    employees: number;
    hierarchies: number;
    homogeneousGroups: number;
    characterizations: number;
    environments: number;
    riskFactorData: number;
    riskFactorDataRec: number;
    derivedMeasures: number;
    actionPlanRules: number;
    documentData: number;
    riskFactorDocuments: number;
    documents: number;
    formApplications: number;
  };
  affectedFormApplications: {
    id: string;
    name: string;
    scopeType: string;
  }[];
  blocks: string[];
  warnings: string[];
};

export type WorkspaceConvertOperationalSummaryApi = {
  homogeneousGroups: number;
  characterizations: number;
  environments: number;
  riskFactorGroupData: number;
  riskFactorData: number;
  recMed: number;
  generateSources: number;
  riskFactorDataRec: number;
  derivedMeasures: number;
  actionPlanRules: number;
  documentData: number;
  riskFactorDocuments: number;
  documents: number;
  characterizationPhotoRecommendations: number;
};

export type WorkspaceConvertResultApi = {
  newCompanyId: string;
  newWorkspaceId: string;
  migratedEmployeesCount: number;
  migratedHierarchiesCount: number;
  copiedRiskDataCount: number;
  convertedFormApplicationsCount: number;
  operational: WorkspaceConvertOperationalSummaryApi;
  warnings: string[];
};

export type WorkspaceConvertCompanyGroupApi = {
  id: number;
  name: string;
  description: string | null;
};

const buildPath = (
  template: string,
  companyId: string,
  workspaceId: string,
) =>
  template
    .replace(':companyId', companyId)
    .replace(':workspaceId', workspaceId);

export async function listConvertWorkspaceCompanyGroups(params: {
  companyId: string;
  workspaceId: string;
}) {
  const path = buildPath(
    CompanyRoutes.WORKSPACE.CONVERT_TO_COMPANY.COMPANY_GROUPS,
    params.companyId,
    params.workspaceId,
  );
  const response = await api.get<WorkspaceConvertCompanyGroupApi[]>(path);
  return response.data;
}

export async function previewConvertWorkspaceToCompany(params: {
  companyId: string;
  workspaceId: string;
  companyGroupId: number;
}) {
  const path = buildPath(
    CompanyRoutes.WORKSPACE.CONVERT_TO_COMPANY.PREVIEW,
    params.companyId,
    params.workspaceId,
  );
  const response = await api.get<WorkspaceConvertPreviewApi>(path, {
    params: { companyGroupId: params.companyGroupId },
  });
  return response.data;
}

export async function convertWorkspaceToCompany(params: {
  companyId: string;
  workspaceId: string;
  companyGroupId: number;
  confirmationText: string;
}) {
  const path = buildPath(
    CompanyRoutes.WORKSPACE.CONVERT_TO_COMPANY.CONVERT,
    params.companyId,
    params.workspaceId,
  );
  const response = await api.post<WorkspaceConvertResultApi>(path, {
    companyGroupId: params.companyGroupId,
    confirmationText: params.confirmationText,
  });
  return response.data;
}
