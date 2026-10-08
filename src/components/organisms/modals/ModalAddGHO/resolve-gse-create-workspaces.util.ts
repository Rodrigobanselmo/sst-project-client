/**
 * Estabelecimentos do POST de criação de GSE.
 * Campo vazio não vira “todos”. Sem estabelecimento corrente, a criação espera
 * uma seleção explícita. A edição não usa estas funções.
 */

export function firstRouteWorkspaceId(
  value: string | string[] | undefined,
): string {
  if (Array.isArray(value)) return value.find(Boolean) || '';
  return value || '';
}

export function resolveGseCreateWorkspaceIds(params: {
  tabWorkspaceId?: string;
  routeWorkspaceId?: string;
  companyWorkspaceIds: string[];
}): string[] {
  const current = params.tabWorkspaceId || params.routeWorkspaceId || '';
  if (!current) return [];
  if (!params.companyWorkspaceIds.includes(current)) return [];
  return [current];
}

/** Null bloqueia o POST. Lista explícita é o corpo de workspaceIds. */
export function buildGseCreateWorkspacePayload(
  workspaceIds: string[],
): string[] | null {
  const ids: string[] = [];
  const seen = new Set<string>();
  workspaceIds.forEach((workspaceId) => {
    if (!workspaceId || seen.has(workspaceId)) return;
    seen.add(workspaceId);
    ids.push(workspaceId);
  });
  if (!ids.length) return null;
  return ids;
}
