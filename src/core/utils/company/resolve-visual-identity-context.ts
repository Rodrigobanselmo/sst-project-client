export type VisualIdentityContextInput = {
  sessionCompanyId?: string | null;
  selectedCompanyId?: string | null;
  lastKnownCompanyId?: string | null;
  isRouterReady?: boolean;
};

export type FetchedVisualIdentity = {
  companyId?: string | null;
  visualIdentityEnabled?: boolean;
};

function asCompanyId(value: unknown): string {
  return typeof value === 'string' && value ? value : '';
}

function firstId(...ids: unknown[]): string {
  return ids.map(asCompanyId).find(Boolean) || '';
}

let lastKnownOperationalCompanyId = '';

export function peekLastKnownVisualIdentityCompanyId(): string {
  return lastKnownOperationalCompanyId;
}

export function rememberVisualIdentityCompanyId(companyId: string): void {
  const id = asCompanyId(companyId);
  if (id) lastKnownOperationalCompanyId = id;
}

export function resetVisualIdentityCompanyIdMemory(): void {
  lastKnownOperationalCompanyId = '';
}

/**
 * Empresa operacional enviada ao GET. A API resolve a dona da identidade.
 * Não escolhe âncora no client (master/consultoria).
 *
 * isReady sozinho não basta: no pages router o query.companyId pode esvaziar
 * no meio da transição com isReady ainda true. lastKnown evita trocar a
 * query key nesse flicker (não é companies[0]).
 */
export function resolveVisualIdentityFetchCompanyId(
  input: VisualIdentityContextInput,
): string {
  const routeId = asCompanyId(input.selectedCompanyId);
  const sessionId = asCompanyId(input.sessionCompanyId);
  const lastKnownId = asCompanyId(input.lastKnownCompanyId);

  if (routeId) {
    return routeId;
  }

  if (input.isRouterReady === false) {
    return firstId(lastKnownId, sessionId);
  }

  return firstId(lastKnownId, sessionId);
}

/**
 * Aplica a identidade já resolvida pela API.
 * companyId da identidade pode ser a âncora (SimpleSST / consultoria),
 * não necessariamente a empresa operacional.
 */
export function canApplyVisualIdentity(params: {
  visualIdentity: FetchedVisualIdentity | null | undefined;
}): boolean {
  return Boolean(params.visualIdentity?.visualIdentityEnabled);
}
