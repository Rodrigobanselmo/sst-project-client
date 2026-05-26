import { stringNormalize } from 'core/utils/strings/stringNormalize';

export type PickableWorkspace = {
  id: string;
  name: string;
  abbreviation?: string | null;
  description?: string;
  isOwner?: boolean;
};

/** Ordem de prioridade entre palavras-chave (matriz antes de sede, etc.). */
const PRINCIPAL_KEYWORDS = [
  'matriz',
  'sede',
  'unidade principal',
  'principal',
] as const;

function sortByName(workspaces: PickableWorkspace[]) {
  return [...workspaces].sort((a, b) =>
    a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }),
  );
}

function workspaceSearchText(workspace: PickableWorkspace): string {
  return stringNormalize(
    [workspace.name, workspace.abbreviation, workspace.description]
      .filter(Boolean)
      .join(' '),
  );
}

/** Índice da palavra-chave encontrada, ou -1 se nenhuma. */
function principalKeywordIndex(workspace: PickableWorkspace): number {
  const text = workspaceSearchText(workspace);

  for (let i = 0; i < PRINCIPAL_KEYWORDS.length; i++) {
    if (text.includes(PRINCIPAL_KEYWORDS[i])) return i;
  }

  return -1;
}

/** Prioridade: owner → matriz/sede/principal → único → primeiro por nome. */
export function pickDefaultWorkspace(
  workspaces: PickableWorkspace[] | undefined,
): string | undefined {
  if (!workspaces?.length) return undefined;
  if (workspaces.length === 1) return workspaces[0].id;

  const owners = workspaces.filter((workspace) => workspace.isOwner === true);
  if (owners.length) return sortByName(owners)[0].id;

  const principals = workspaces
    .map((workspace) => ({
      workspace,
      keywordIndex: principalKeywordIndex(workspace),
    }))
    .filter((entry) => entry.keywordIndex >= 0)
    .sort((a, b) => {
      if (a.keywordIndex !== b.keywordIndex) {
        return a.keywordIndex - b.keywordIndex;
      }
      return a.workspace.name.localeCompare(b.workspace.name, 'pt-BR', {
        sensitivity: 'base',
      });
    });

  if (principals.length) return principals[0].workspace.id;

  return sortByName(workspaces)[0].id;
}

export function enrichPickableWorkspaces<
  T extends { id: string; name: string },
>(
  browseResults: T[] | undefined,
  companyWorkspaces?: PickableWorkspace[],
): PickableWorkspace[] {
  if (!browseResults?.length) return [];

  const byId = new Map(
    companyWorkspaces?.map((workspace) => [workspace.id, workspace]),
  );

  return browseResults.map((result) => {
    const full = byId.get(result.id);
    return {
      id: result.id,
      name: result.name,
      abbreviation: full?.abbreviation,
      description: full?.description,
      isOwner: full?.isOwner,
    };
  });
}
