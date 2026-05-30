import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';

import { buildHierarchyIdToWorkspaceNameFromParticipants } from './buildHierarchyIdToWorkspaceNameFromParticipants';
import type { FormParticipantsBrowseResultModel } from '@v2/models/form/models/form-participants/form-participants-browse-result.model';

export type ParticipantGroupingEnrichmentContext = {
  entityMap: Record<string, { id: string; name: string; type?: HierarchyTypeEnum }>;
  hierarchyIdToWorkspaceName: Map<string, string>;
  applicationWorkspaces: { id: string; name: string }[];
  applicationWorkspaceNames: string[];
};

export function buildParticipantGroupingEnrichmentContext(params: {
  entityMap?: Record<
    string,
    { id: string; name: string; type?: HierarchyTypeEnum; companyId?: string }
  >;
  participants?: FormParticipantsBrowseResultModel[];
  applicationWorkspaces?: { id: string; name: string }[];
}): ParticipantGroupingEnrichmentContext | null {
  if (!params.entityMap || Object.keys(params.entityMap).length === 0) {
    return null;
  }

  const applicationWorkspaces = params.applicationWorkspaces ?? [];

  return {
    entityMap: params.entityMap,
    hierarchyIdToWorkspaceName: buildHierarchyIdToWorkspaceNameFromParticipants(
      params.participants ?? [],
    ),
    applicationWorkspaces,
    applicationWorkspaceNames: applicationWorkspaces.map((workspace) => workspace.name),
  };
}
