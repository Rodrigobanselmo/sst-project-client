import { ChemicalProductRoutes } from '@v2/constants/routes/chemical-product.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { refreshToken } from 'core/contexts/AuthContext';
import { api } from 'core/services/apiClient';
import { downloadFile } from 'core/utils/helpers/downloadFile';

import {
  ChemicalExcelImportPreview,
  ChemicalIngredientPayload,
  ChemicalPrepareAnalyzeResult,
  ChemicalPrepareColumnMapping,
  ChemicalPreparePreviewResult,
  ChemicalAiCurationDecision,
  ChemicalAiCurationSuggestResult,
  AiCurationSuggestion,
  ChemicalProductDetail,
  ChemicalProductListItem,
  ChemicalRiskOption,
  ChemicalValidatePreviewResult,
  ParseFispqResult,
} from './chemical-product.types';

type WorkspaceParams = { companyId: string; workspaceId: string };

export async function browseChemicalProducts(
  params: WorkspaceParams & { includeArchived?: boolean; search?: string },
) {
  const response = await api.get<ChemicalProductListItem[]>(
    bindUrlParams({
      path: ChemicalProductRoutes.LIST,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
      },
    }),
    {
      params: {
        includeArchived: params.includeArchived ? '1' : undefined,
        search: params.search || undefined,
      },
    },
  );
  return response.data;
}

export async function readChemicalProduct(
  params: WorkspaceParams & { productId: string },
) {
  const response = await api.get<ChemicalProductDetail>(
    bindUrlParams({
      path: ChemicalProductRoutes.BY_ID,
      pathParams: params,
    }),
  );
  return response.data;
}

export async function createManualChemicalProduct(
  params: WorkspaceParams & {
    tradeName: string;
    manufacturer?: string | null;
    isPureSubstance?: boolean;
    ingredients: ChemicalIngredientPayload[];
  },
) {
  const { companyId, workspaceId, ...body } = params;
  const response = await api.post(
    bindUrlParams({
      path: ChemicalProductRoutes.LIST,
      pathParams: { companyId, workspaceId },
    }),
    body,
  );
  return response.data;
}

export async function createPureChemicalProduct(
  params: WorkspaceParams & {
    riskFactorId: string;
    tradeName?: string | null;
    manufacturer?: string | null;
  },
) {
  const { companyId, workspaceId, ...body } = params;
  const response = await api.post(
    bindUrlParams({
      path: ChemicalProductRoutes.PURE_FROM_RISK,
      pathParams: { companyId, workspaceId },
    }),
    body,
  );
  return response.data;
}

export async function createFromFispqChemicalProduct(
  params: WorkspaceParams & {
    fileId: string;
    tradeName: string;
    manufacturer?: string | null;
    versionLabel?: string | null;
    issuedAt?: string | null;
    language?: string | null;
    ingredients: ChemicalIngredientPayload[];
  },
) {
  const { companyId, workspaceId, ...body } = params;
  const response = await api.post(
    bindUrlParams({
      path: ChemicalProductRoutes.FROM_FISPQ,
      pathParams: { companyId, workspaceId },
    }),
    body,
  );
  return response.data;
}

export async function updateChemicalProduct(
  params: WorkspaceParams & {
    productId: string;
    tradeName?: string;
    manufacturer?: string | null;
  },
) {
  const { companyId, workspaceId, productId, ...body } = params;
  const response = await api.patch(
    bindUrlParams({
      path: ChemicalProductRoutes.BY_ID,
      pathParams: { companyId, workspaceId, productId },
    }),
    body,
  );
  return response.data;
}

export async function archiveChemicalProduct(
  params: WorkspaceParams & { productId: string },
) {
  const response = await api.post(
    bindUrlParams({
      path: ChemicalProductRoutes.ARCHIVE,
      pathParams: params,
    }),
  );
  return response.data;
}

export async function restoreChemicalProduct(
  params: WorkspaceParams & { productId: string },
) {
  const response = await api.post(
    bindUrlParams({
      path: ChemicalProductRoutes.RESTORE,
      pathParams: params,
    }),
  );
  return response.data;
}

export async function hardDeleteChemicalProduct(
  params: WorkspaceParams & { productId: string },
) {
  const response = await api.delete(
    bindUrlParams({
      path: ChemicalProductRoutes.BY_ID,
      pathParams: params,
    }),
  );
  return response.data;
}

export async function getChemicalProductDeletionEligibility(
  params: WorkspaceParams & { productId: string },
) {
  const response = await api.get<{ canDelete: boolean; blockers: string[] }>(
    bindUrlParams({
      path: ChemicalProductRoutes.DELETION_ELIGIBILITY,
      pathParams: params,
    }),
  );
  return response.data;
}

export async function createCompositionVersion(
  params: WorkspaceParams & {
    productId: string;
    sourceType: 'MANUAL' | 'PURE' | 'FISPQ';
    sourceDocumentId?: string | null;
    ingredients: ChemicalIngredientPayload[];
  },
) {
  const { companyId, workspaceId, productId, ...body } = params;
  const response = await api.post(
    bindUrlParams({
      path: ChemicalProductRoutes.COMPOSITION,
      pathParams: { companyId, workspaceId, productId },
    }),
    body,
  );
  return response.data;
}

export async function searchChemicalRiskFactors(
  params: WorkspaceParams & { search?: string },
) {
  const response = await api.get<ChemicalRiskOption[]>(
    bindUrlParams({
      path: ChemicalProductRoutes.RISK_SEARCH,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
      },
    }),
    { params: { search: params.search || undefined, limit: 40 } },
  );
  return response.data;
}

export async function browseChemicalManufacturers(
  params: WorkspaceParams & { search?: string },
) {
  const response = await api.get<string[]>(
    bindUrlParams({
      path: ChemicalProductRoutes.MANUFACTURERS,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
      },
    }),
    { params: { search: params.search || undefined, limit: 40 } },
  );
  return response.data;
}

export async function parseChemicalFispqPdf(
  params: WorkspaceParams & { file: File },
) {
  const formData = new FormData();
  formData.append('file', params.file);
  const response = await api.post<ParseFispqResult>(
    bindUrlParams({
      path: ChemicalProductRoutes.PARSE_FISPQ,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
      },
    }),
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data;
}

export async function uploadChemicalFispqFile(
  params: WorkspaceParams & { file: File },
) {
  const formData = new FormData();
  formData.append('file', params.file);
  const response = await api.post<{
    fileId: string;
    name: string;
    url: string;
    size: number;
  }>(
    bindUrlParams({
      path: ChemicalProductRoutes.UPLOAD_FILE,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
      },
    }),
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data;
}

export async function createChemicalFispqDocument(
  params: WorkspaceParams & {
    productId: string;
    fileId: string;
    versionLabel?: string | null;
    issuedAt?: string | null;
    language?: string | null;
    activate?: boolean;
  },
) {
  const { companyId, workspaceId, productId, ...body } = params;
  const response = await api.post(
    bindUrlParams({
      path: ChemicalProductRoutes.CREATE_FISPQ,
      pathParams: { companyId, workspaceId, productId },
    }),
    body,
  );
  return response.data;
}

export async function setChemicalFispqEmployeeVisibility(
  params: WorkspaceParams & {
    productId: string;
    documentId: string;
    publishedForEmployees: boolean;
  },
) {
  const { companyId, workspaceId, productId, documentId, publishedForEmployees } =
    params;
  const response = await api.patch(
    bindUrlParams({
      path: ChemicalProductRoutes.PUBLISH_FISPQ,
      pathParams: { companyId, workspaceId, productId, documentId },
    }),
    { publishedForEmployees },
  );
  return response.data;
}

export async function activateChemicalFispqDocument(
  params: WorkspaceParams & { productId: string; documentId: string },
) {
  const response = await api.post(
    bindUrlParams({
      path: ChemicalProductRoutes.ACTIVATE_FISPQ,
      pathParams: params,
    }),
  );
  return response.data;
}

async function downloadChemicalXlsx(
  path: string,
  pathParams: WorkspaceParams,
) {
  const { token } = await refreshToken();
  const response = await api.get(
    bindUrlParams({ path, pathParams }),
    {
      responseType: 'blob',
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  await downloadFile(response);
}

export async function downloadChemicalExcelTemplate(params: WorkspaceParams) {
  await downloadChemicalXlsx(ChemicalProductRoutes.EXCEL_TEMPLATE, params);
}

export async function exportChemicalExcel(params: WorkspaceParams) {
  await downloadChemicalXlsx(ChemicalProductRoutes.EXCEL_EXPORT, params);
}

export async function previewChemicalExcelImport(
  params: WorkspaceParams & { file: File },
) {
  const formData = new FormData();
  formData.append('file', params.file);
  const response = await api.post<ChemicalExcelImportPreview>(
    bindUrlParams({
      path: ChemicalProductRoutes.EXCEL_IMPORT_PREVIEW,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
      },
    }),
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data;
}

export async function commitChemicalExcelImport(
  params: WorkspaceParams & {
    file: File;
    confirmCommit?: boolean;
    decisions?: Array<{
      groupKey: string;
      sourceRow: number;
      riskFactorId: string | null;
      decision: 'AUTO' | 'MANUAL_LINK' | 'LEAVE_UNLINKED';
    }>;
  },
) {
  const formData = new FormData();
  formData.append('file', params.file);
  formData.append('confirmCommit', params.confirmCommit === false ? 'false' : 'true');
  if (params.decisions?.length) {
    formData.append('decisions', JSON.stringify(params.decisions));
  }
  const response = await api.post(
    bindUrlParams({
      path: ChemicalProductRoutes.EXCEL_IMPORT_COMMIT,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
      },
    }),
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data;
}

export async function analyzeChemicalExcelPrepare(
  params: WorkspaceParams & { file: File; sheetName?: string | null },
) {
  const formData = new FormData();
  formData.append('file', params.file);
  if (params.sheetName) formData.append('sheetName', params.sheetName);
  const response = await api.post<ChemicalPrepareAnalyzeResult>(
    bindUrlParams({
      path: ChemicalProductRoutes.EXCEL_PREPARE_ANALYZE,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
      },
    }),
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data;
}

export async function previewChemicalExcelPrepare(
  params: WorkspaceParams & {
    file: File;
    sheetName: string;
    mapping: ChemicalPrepareColumnMapping;
  },
) {
  const formData = new FormData();
  formData.append('file', params.file);
  formData.append('sheetName', params.sheetName);
  formData.append('mapping', JSON.stringify(params.mapping));
  formData.append('previewOnly', 'true');
  const response = await api.post<ChemicalPreparePreviewResult>(
    bindUrlParams({
      path: ChemicalProductRoutes.EXCEL_PREPARE_EXPORT,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
      },
    }),
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data;
}

export async function downloadChemicalExcelPrepare(
  params: WorkspaceParams & {
    file: File;
    sheetName: string;
    mapping: ChemicalPrepareColumnMapping;
  },
) {
  const formData = new FormData();
  formData.append('file', params.file);
  formData.append('sheetName', params.sheetName);
  formData.append('mapping', JSON.stringify(params.mapping));
  formData.append('previewOnly', 'false');
  const { token } = await refreshToken();
  const response = await api.post(
    bindUrlParams({
      path: ChemicalProductRoutes.EXCEL_PREPARE_EXPORT,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
      },
    }),
    formData,
    {
      responseType: 'blob',
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    },
  );
  await downloadFile(response);
}

export async function suggestChemicalExcelAiCuration(
  params: WorkspaceParams & {
    file: File;
    sheetName: string;
    mapping: ChemicalPrepareColumnMapping;
    sourceRowIds?: string[] | null;
  },
) {
  const formData = new FormData();
  formData.append('file', params.file);
  formData.append('sheetName', params.sheetName);
  formData.append('mapping', JSON.stringify(params.mapping));
  if (params.sourceRowIds?.length) {
    formData.append('sourceRowIds', JSON.stringify(params.sourceRowIds));
  }
  const response = await api.post<ChemicalAiCurationSuggestResult>(
    bindUrlParams({
      path: ChemicalProductRoutes.EXCEL_AI_CURATION_SUGGEST,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
      },
    }),
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data;
}

export async function downloadChemicalExcelAiCuration(
  params: WorkspaceParams & {
    file: File;
    sheetName: string;
    mapping: ChemicalPrepareColumnMapping;
    decisions: ChemicalAiCurationDecision[];
    suggestions?: AiCurationSuggestion[] | null;
  },
) {
  const formData = new FormData();
  formData.append('file', params.file);
  formData.append('sheetName', params.sheetName);
  formData.append('mapping', JSON.stringify(params.mapping));
  formData.append('decisions', JSON.stringify(params.decisions));
  if (params.suggestions?.length) {
    formData.append('suggestions', JSON.stringify(params.suggestions));
  }
  const { token } = await refreshToken();
  const response = await api.post(
    bindUrlParams({
      path: ChemicalProductRoutes.EXCEL_AI_CURATION_EXPORT,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
      },
    }),
    formData,
    {
      responseType: 'blob',
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    },
  );
  await downloadFile(response);
}

export async function previewChemicalExcelValidate(
  params: WorkspaceParams & { file: File },
) {
  const formData = new FormData();
  formData.append('file', params.file);
  const response = await api.post<ChemicalValidatePreviewResult>(
    bindUrlParams({
      path: ChemicalProductRoutes.EXCEL_VALIDATE_PREVIEW,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
      },
    }),
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data;
}
