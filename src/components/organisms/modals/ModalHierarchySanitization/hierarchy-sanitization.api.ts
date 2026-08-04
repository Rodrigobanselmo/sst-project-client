import { api } from 'core/services/apiClient';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';

import type {
  HierarchySanitizationBrowseResponse,
  HierarchySanitizationBulkResponse,
  HierarchySanitizationDetailsResponse,
  JustifyHierarchySanitizationReviewResponse,
  ReopenHierarchySanitizationReviewResponse,
} from './hierarchy-sanitization.types';

export type {
  HierarchySanitizationBrowseResponse,
  HierarchySanitizationBulkResponse,
  HierarchySanitizationCategory,
  HierarchySanitizationDetailsResponse,
  HierarchySanitizationItem,
  HierarchySanitizationStatus,
  JustifyHierarchySanitizationReviewResponse,
  ReopenHierarchySanitizationReviewResponse,
} from './hierarchy-sanitization.types';

export {
  buildSanitizationBulkConfirmMessage,
  buildSingleDeleteConfirmMessage,
  mergeEligibleSelection,
  pruneSelectionAfterReload,
  countDeleteCalls,
} from './hierarchy-sanitization.utils';

export async function browseHierarchySanitization(params: {
  companyId: string;
  page?: number;
  limit?: number;
  search?: string;
  category?: 'OFFICE' | 'SUB_OFFICE' | 'ALL';
  status?: 'ELIGIBLE' | 'BLOCKED' | 'ALL';
  reviewStatus?: 'PENDING' | 'JUSTIFIED' | 'ALL';
}): Promise<HierarchySanitizationBrowseResponse> {
  const { companyId, ...body } = params;
  const { data } = await api.post<HierarchySanitizationBrowseResponse>(
    `${ApiRoutesEnum.HIERARCHY}/sanitization/browse/${companyId}`,
    body,
  );
  return data;
}

export async function bulkDeleteHierarchySanitization(params: {
  companyId: string;
  hierarchyIds: string[];
  confirm?: boolean;
}): Promise<HierarchySanitizationBulkResponse> {
  const { companyId, hierarchyIds, confirm } = params;
  const { data } = await api.post<HierarchySanitizationBulkResponse>(
    `${ApiRoutesEnum.HIERARCHY}/sanitization/bulk-delete/${companyId}`,
    { hierarchyIds, confirm },
  );
  return data;
}

export async function getHierarchySanitizationDetails(params: {
  companyId: string;
  hierarchyId: string;
}): Promise<HierarchySanitizationDetailsResponse> {
  const { data } = await api.get<HierarchySanitizationDetailsResponse>(
    `${ApiRoutesEnum.HIERARCHY}/sanitization/details/${params.hierarchyId}/${params.companyId}`,
  );
  return data;
}

export async function justifyHierarchySanitizationReview(params: {
  companyId: string;
  hierarchyId: string;
  reason: string;
}): Promise<JustifyHierarchySanitizationReviewResponse> {
  const { data } = await api.post<JustifyHierarchySanitizationReviewResponse>(
    `${ApiRoutesEnum.HIERARCHY}/sanitization/review/${params.hierarchyId}/${params.companyId}`,
    { reason: params.reason },
  );
  return data;
}

export async function reopenHierarchySanitizationReview(params: {
  companyId: string;
  hierarchyId: string;
}): Promise<ReopenHierarchySanitizationReviewResponse> {
  const { data } = await api.post<ReopenHierarchySanitizationReviewResponse>(
    `${ApiRoutesEnum.HIERARCHY}/sanitization/review/${params.hierarchyId}/${params.companyId}/reopen`,
  );
  return data;
}
