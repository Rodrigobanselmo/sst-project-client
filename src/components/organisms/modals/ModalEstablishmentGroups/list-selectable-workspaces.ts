import { IEstablishmentGroup, IWorkspace } from 'core/interfaces/api/ICompany';

type SelectableWorkspace = Pick<
  IWorkspace,
  'id' | 'name' | 'abbreviation' | 'establishmentGroupId'
>;

export function getAssignedEstablishmentGroupId(
  workspace: SelectableWorkspace,
  groupByWorkspaceId: Map<string, Pick<IEstablishmentGroup, 'id'>>,
) {
  return (
    workspace.establishmentGroupId ||
    groupByWorkspaceId.get(workspace.id)?.id ||
    ''
  );
}

function compareWorkspaces(a: SelectableWorkspace, b: SelectableWorkspace) {
  const byName = String(a.name || '').localeCompare(String(b.name || ''), 'pt-BR', {
    sensitivity: 'base',
  });
  if (byName !== 0) return byName;

  const byAbbreviation = String(a.abbreviation || '').localeCompare(
    String(b.abbreviation || ''),
    'pt-BR',
    { sensitivity: 'base' },
  );
  if (byAbbreviation !== 0) return byAbbreviation;

  return String(a.id).localeCompare(String(b.id));
}

/**
 * Criar: só workspaces sem grupo.
 * Editar: grupo atual + workspaces sem grupo.
 * Workspaces de outro grupo ficam de fora da lista.
 */
export function listSelectableWorkspacesForEstablishmentGroup(params: {
  workspaces: SelectableWorkspace[];
  groupByWorkspaceId: Map<string, Pick<IEstablishmentGroup, 'id'>>;
  currentGroupId?: string;
}) {
  const filtered = params.workspaces.filter((workspace) => {
    const assignedGroupId = getAssignedEstablishmentGroupId(
      workspace,
      params.groupByWorkspaceId,
    );
    if (!assignedGroupId) return true;
    return !!params.currentGroupId && assignedGroupId === params.currentGroupId;
  });

  return [...filtered].sort(compareWorkspaces);
}
