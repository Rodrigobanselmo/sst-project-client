import { IGho } from 'core/interfaces/api/IGho';

import { initialAddGhoState } from './hooks/useAddGho';

export function getGseLinkedWorkspaceIds(
  ghoData: typeof initialAddGhoState,
  ghoQuery?: IGho | null,
): string[] {
  const fromData = (ghoData.workspaceIds || []).filter(Boolean);
  if (fromData.length) return [...new Set(fromData)];

  const fromWorkspaces = (ghoData.workspaces || [])
    .map((workspace) => workspace.id)
    .filter(Boolean);
  if (fromWorkspaces.length) return [...new Set(fromWorkspaces)];

  const fromQuery = (ghoQuery?.workspaceIds || []).filter(Boolean);
  return [...new Set(fromQuery)];
}
