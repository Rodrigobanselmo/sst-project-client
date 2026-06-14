import { HoMethodRoutes } from '@v2/constants/routes/ho-method.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

import type {
  BrowseHoMethodsParams,
  BrowseHoMethodsResponse,
  HoExtractionSolventRecord,
  HoLaboratoryRecord,
  HoMethodFileUploadResponse,
  HoMethodRecord,
  HoMethodRiskFactorSnapshot,
  HoMethodWritePayload,
  HoSamplerRecord,
} from './ho-method.types';

function buildBrowseQueryParams(params: BrowseHoMethodsParams) {
  const query: Record<string, string | number | boolean> = {};

  if (params.page) query.page = params.page;
  if (params.limit) query.limit = params.limit;
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.agentName?.trim()) query.agentName = params.agentName.trim();
  if (params.cas?.trim()) query.cas = params.cas.trim();
  if (params.institution) query.institution = params.institution;
  if (params.methodCode?.trim()) query.methodCode = params.methodCode.trim();
  if (params.analyticalMethod?.trim()) {
    query.analyticalMethod = params.analyticalMethod.trim();
  }
  if (params.evaluationType) query.evaluationType = params.evaluationType;
  if (params.status) query.status = params.status;
  if (typeof params.prioritized === 'boolean') {
    query.prioritized = params.prioritized;
  }

  return query;
}

export async function searchHoMethodRiskFactors(params: {
  companyId: string;
  search?: string;
}): Promise<HoMethodRiskFactorSnapshot[]> {
  const response = await api.get<HoMethodRiskFactorSnapshot[]>(
    HoMethodRoutes.RISK_SEARCH,
    {
      params: {
        companyId: params.companyId,
        search: params.search?.trim() || undefined,
      },
    },
  );

  return response.data;
}

export function resolveHoMethodDocumentUrl(method: {
  id: string;
  originalDocumentUrl?: string | null;
  originalDocumentDownloadPath?: string | null;
}): string | null {
  if (method.originalDocumentUrl?.trim()) {
    return method.originalDocumentUrl;
  }

  if (method.originalDocumentDownloadPath?.trim()) {
    const base = api.defaults.baseURL?.replace(/\/$/, '') ?? '';
    const path = method.originalDocumentDownloadPath.replace(/^\//, '');
    return `${base}/${path}`;
  }

  if (method.id) {
    const base = api.defaults.baseURL?.replace(/\/$/, '') ?? '';
    return `${base}/${HoMethodRoutes.ORIGINAL_DOCUMENT.replace(':id', method.id)}`;
  }

  return null;
}

export async function browseHoMethods(
  params: BrowseHoMethodsParams,
): Promise<BrowseHoMethodsResponse> {
  const response = await api.get<BrowseHoMethodsResponse>(HoMethodRoutes.BASE, {
    params: buildBrowseQueryParams(params),
  });
  return response.data;
}

export async function readHoMethod(id: string): Promise<HoMethodRecord> {
  const response = await api.get<HoMethodRecord>(
    bindUrlParams({
      path: HoMethodRoutes.BY_ID,
      pathParams: { id },
    }),
  );
  return response.data;
}

export async function createHoMethod(
  payload: HoMethodWritePayload,
): Promise<HoMethodRecord> {
  const response = await api.post<HoMethodRecord>(HoMethodRoutes.BASE, payload);
  return response.data;
}

export async function updateHoMethod(
  id: string,
  payload: HoMethodWritePayload,
): Promise<HoMethodRecord> {
  const response = await api.patch<HoMethodRecord>(
    bindUrlParams({
      path: HoMethodRoutes.BY_ID,
      pathParams: { id },
    }),
    payload,
  );
  return response.data;
}

export async function deleteHoMethod(id: string): Promise<HoMethodRecord> {
  const response = await api.delete<HoMethodRecord>(
    bindUrlParams({
      path: HoMethodRoutes.BY_ID,
      pathParams: { id },
    }),
  );
  return response.data;
}

export async function browseHoSamplers(
  search?: string,
): Promise<HoSamplerRecord[]> {
  const response = await api.get<HoSamplerRecord[]>(HoMethodRoutes.SAMPLERS, {
    params: search?.trim() ? { search: search.trim() } : undefined,
  });
  return response.data;
}

export async function createHoSampler(payload: {
  name: string;
  description?: string;
  type?: string;
}): Promise<HoSamplerRecord> {
  const response = await api.post<HoSamplerRecord>(
    HoMethodRoutes.SAMPLERS,
    payload,
  );
  return response.data;
}

export async function browseHoExtractionSolvents(
  search?: string,
): Promise<HoExtractionSolventRecord[]> {
  const response = await api.get<HoExtractionSolventRecord[]>(
    HoMethodRoutes.EXTRACTION_SOLVENTS,
    {
      params: search?.trim() ? { search: search.trim() } : undefined,
    },
  );
  return response.data;
}

export async function createHoExtractionSolvent(payload: {
  name: string;
  description?: string;
  synonyms?: string[];
}): Promise<HoExtractionSolventRecord> {
  const response = await api.post<HoExtractionSolventRecord>(
    HoMethodRoutes.EXTRACTION_SOLVENTS,
    payload,
  );
  return response.data;
}

export async function browseHoLaboratories(
  search?: string,
): Promise<HoLaboratoryRecord[]> {
  const response = await api.get<HoLaboratoryRecord[]>(
    HoMethodRoutes.LABORATORIES,
    {
      params: search?.trim() ? { search: search.trim() } : undefined,
    },
  );
  return response.data;
}

export async function createHoLaboratory(payload: {
  cnpj?: string;
  corporateName: string;
  tradeName?: string;
  email?: string;
  phone?: string;
  contactName?: string;
  notes?: string;
}): Promise<HoLaboratoryRecord> {
  const response = await api.post<HoLaboratoryRecord>(
    HoMethodRoutes.LABORATORIES,
    payload,
  );
  return response.data;
}

export async function uploadHoMethodDocument(params: {
  companyId: string;
  file: File;
}): Promise<HoMethodFileUploadResponse> {
  const formData = new FormData();
  formData.append('file', params.file);

  const response = await api.post<HoMethodFileUploadResponse>(
    bindUrlParams({
      path: HoMethodRoutes.UPLOAD,
      pathParams: { companyId: params.companyId },
    }),
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );

  return response.data;
}
