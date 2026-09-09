import { InventoryPgrImportRoutes } from '@v2/constants/routes/inventory-pgr-import.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

import type {
  ApplyInventoryPgrImportParams,
  InventoryPgrImportApply,
  InventoryPgrImportPreview,
  InventoryPgrImportReview,
  PreviewInventoryPgrImportParams,
  ReviewInventoryPgrImportParams,
} from './inventory-pgr-import.types';

export async function previewInventoryPgrImport({
  companyId,
  workspaceId,
  file,
}: PreviewInventoryPgrImportParams): Promise<InventoryPgrImportPreview> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<InventoryPgrImportPreview>(
    bindUrlParams({
      path: InventoryPgrImportRoutes.PREVIEW,
      pathParams: { companyId, workspaceId },
    }),
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );

  return response.data;
}

export async function reviewInventoryPgrImport({
  companyId,
  workspaceId,
  extraction,
  decisions,
}: ReviewInventoryPgrImportParams): Promise<InventoryPgrImportReview> {
  const response = await api.post<InventoryPgrImportReview>(
    bindUrlParams({
      path: InventoryPgrImportRoutes.REVIEW,
      pathParams: { companyId, workspaceId },
    }),
    { extraction, decisions },
  );
  return response.data;
}

export async function applyInventoryPgrImport({
  companyId,
  workspaceId,
  extraction,
  decisions,
  extractionFingerprint,
  catalogFingerprint,
  reviewFingerprint,
}: ApplyInventoryPgrImportParams): Promise<InventoryPgrImportApply> {
  const response = await api.post<InventoryPgrImportApply>(
    bindUrlParams({
      path: InventoryPgrImportRoutes.APPLY,
      pathParams: { companyId, workspaceId },
    }),
    {
      extraction,
      decisions,
      extractionFingerprint,
      catalogFingerprint,
      reviewFingerprint,
    },
  );
  return response.data;
}
