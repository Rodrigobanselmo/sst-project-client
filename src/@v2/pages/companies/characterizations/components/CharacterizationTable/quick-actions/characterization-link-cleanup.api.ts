import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { api } from 'core/services/apiClient';

export type ActiveHierarchyLink = {
  id: number;
  hierarchyId: string;
  hierarchyName: string;
  hierarchyType: string;
  startDate: string | Date | null;
  endDate: null;
  removable: boolean;
  blockReason?: string;
};

export type ActiveHierarchyLinksResponse = {
  homogeneousGroupId: string;
  name: string;
  activeCount: number;
  removableCount: number;
  links: ActiveHierarchyLink[];
};

export type BulkUnlinkHierarchyHomoResponse = {
  elementsRequested: number;
  elementsProcessed: number;
  elementsWithoutActiveLinks: number;
  activeLinksFound: number;
  linksRemoved: number;
  blockedLinks: Array<{
    linkId: number;
    elementId: string;
    elementName: string;
    hierarchyId: string;
    hierarchyName: string;
    reason: string;
  }>;
  skippedElements: Array<{ id: string; reason: string }>;
  errors: Array<{ id: string; reason: string }>;
  reasons: string[];
  dryRun: boolean;
};

export async function fetchActiveHierarchyLinks(params: {
  homogeneousGroupId: string;
  companyId: string;
}): Promise<ActiveHierarchyLinksResponse> {
  const { homogeneousGroupId, companyId } = params;
  const response = await api.get<ActiveHierarchyLinksResponse>(
    `${ApiRoutesEnum.GHO}/active-hierarchy-links/${homogeneousGroupId}/${companyId}`,
  );
  return response.data;
}

export async function bulkUnlinkHierarchyHomo(params: {
  companyId: string;
  workspaceId?: string;
  ids: string[];
  confirm?: boolean;
}): Promise<BulkUnlinkHierarchyHomoResponse> {
  const { companyId, workspaceId, ids, confirm } = params;
  const response = await api.post<BulkUnlinkHierarchyHomoResponse>(
    `${ApiRoutesEnum.GHO}/hierarchy-homo-bulk-unlink/${companyId}`,
    { ids, workspaceId, confirm },
  );
  return response.data;
}
