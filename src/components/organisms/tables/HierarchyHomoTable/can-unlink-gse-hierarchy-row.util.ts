import { UNGROUPED_WORKSPACE_NAME } from './resolve-hierarchy-workspace-group.util';

export function canUnlinkGseHierarchyRow(params: {
  groupByWorkspace?: boolean;
  preferredWorkspaceId?: string;
  rowWorkspaceGroupId?: string;
}): boolean {
  if (!params.groupByWorkspace) return true;
  if (!params.preferredWorkspaceId) return true;
  return params.rowWorkspaceGroupId === params.preferredWorkspaceId;
}

export function formatGseUnlinkOtherWorkspaceTooltip(
  workspaceName?: string,
): string {
  const name = (workspaceName || '').trim();
  if (name && name !== UNGROUPED_WORKSPACE_NAME) {
    return `Para excluir este cargo, troque para o estabelecimento ${name}.`;
  }
  return 'Para excluir este cargo, troque para o estabelecimento correspondente.';
}
