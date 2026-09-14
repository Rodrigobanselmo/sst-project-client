import type { ParsedUrlQuery } from 'querystring';

/** Query exclusiva da visão do organograma com 2+ estabelecimentos. */
export const ORG_MULTI_WORKSPACE_QUERY_KEY = 'tabWorkspaceIds';

function uniqueIds(ids: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  ids.forEach((id) => {
    const trimmed = id.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    result.push(trimmed);
  });
  return result;
}

function splitQueryValue(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const parts = Array.isArray(value) ? value : [value];
  return uniqueIds(parts.flatMap((item) => item.split(',')));
}

/**
 * IDs de estabelecimento para filtrar o organograma.
 * - `tabWorkspaceIds` (2+) tem prioridade.
 * - senão, o `tabWorkspaceId` string atual (0 ou 1).
 * Nunca interpreta `tabWorkspaceId` como lista: consumidores existentes
 * continuam recebendo um único id.
 */
export function parseOrgWorkspaceFilterIds(query: ParsedUrlQuery): string[] {
  const fromMulti = splitQueryValue(query[ORG_MULTI_WORKSPACE_QUERY_KEY]);
  if (fromMulti.length > 0) return fromMulti;

  const single = query.tabWorkspaceId;
  if (typeof single === 'string' && single.trim()) return uniqueIds([single]);
  return [];
}

export const ORG_MULTI_WORKSPACE_DISABLED_HINT =
  'Disponível com um único estabelecimento selecionado.';

export function isOrgMultiWorkspaceMode(query: ParsedUrlQuery): boolean {
  return parseOrgWorkspaceFilterIds(query).length > 1;
}

export function isOrgHierarquiaMultiWorkspace(
  pathname: string | undefined,
  query: ParsedUrlQuery,
): boolean {
  const isHierarquiaPage =
    typeof pathname === 'string' &&
    pathname.includes('/empresas/') &&
    pathname.includes('/hierarquia');
  return isHierarquiaPage && isOrgMultiWorkspaceMode(query);
}

/**
 * Grava o filtro na query sem transformar `tabWorkspaceId` em array:
 * - 0 ids: remove os dois params (empresa inteira);
 * - 1 id: só `tabWorkspaceId` (URL idêntica à atual);
 * - 2+ ids: só `tabWorkspaceIds` — sem `tabWorkspaceId`, para não
 *   implícitar o primeiro estabelecimento em GSE/riscos.
 */
export function applyOrgWorkspaceFilterToQuery(
  query: ParsedUrlQuery,
  ids: string[],
): void {
  const unique = uniqueIds(ids);
  delete query[ORG_MULTI_WORKSPACE_QUERY_KEY];
  delete query.tabWorkspaceId;

  if (unique.length === 1) {
    query.tabWorkspaceId = unique[0];
    return;
  }

  if (unique.length > 1) {
    query[ORG_MULTI_WORKSPACE_QUERY_KEY] = unique.join(',');
  }
}
