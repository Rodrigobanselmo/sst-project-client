const LOCATION_STOP_WORDS = new Set(['DE', 'DA', 'DO', 'DOS', 'DAS', 'E']);

function normalizeForMatch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeSuffix(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenizeLocation(location: string): string[] {
  return normalizeForMatch(location)
    .split(' ')
    .filter((token) => token.length > 0 && !LOCATION_STOP_WORDS.has(token));
}

function parseWorkspaceEstablishment(workspaceName: string): {
  uf: string;
  locationTokens: string[];
} | null {
  const match = workspaceName.trim().match(/\(([A-Z]{2})\)\s*(.+)$/i);
  if (!match) return null;

  const uf = match[1].toUpperCase();
  const locationTokens = tokenizeLocation(match[2]);
  if (locationTokens.length === 0) return null;

  return { uf, locationTokens };
}

function sectorMatchesWorkspaceLocation(
  sectorNormalized: string,
  sectorTokens: string[],
  uf: string,
  locationTokens: string[],
): boolean {
  if (!sectorTokens.includes(uf)) return false;

  return locationTokens.every((token) => {
    if (token.length === 1) {
      return sectorTokens.includes(token);
    }
    if (sectorNormalized.includes(token)) return true;
    return sectorTokens.some(
      (sectorToken) =>
        sectorToken.startsWith(token) || token.startsWith(sectorToken),
    );
  });
}

function extractWorkspaceSuffix(workspaceName: string): string {
  const normalized = workspaceName.trim();
  const segments = normalized
    .split(/\s(?:—|–|-)\s/)
    .map((part) => part.trim())
    .filter(Boolean);

  return segments[segments.length - 1] ?? normalized;
}

function resolveEstablishmentLabelFromSectorNameByUfLocation(
  sectorName: string,
  workspaceNames: string[],
): string | null {
  const sectorNormalized = normalizeForMatch(sectorName);
  if (!sectorNormalized) return null;

  const sectorTokens = sectorNormalized.split(' ').filter(Boolean);
  const matches: string[] = [];

  for (const workspaceName of workspaceNames) {
    const label = workspaceName.trim();
    if (!label) continue;

    const parsed = parseWorkspaceEstablishment(label);
    if (!parsed) continue;

    if (
      sectorMatchesWorkspaceLocation(
        sectorNormalized,
        sectorTokens,
        parsed.uf,
        parsed.locationTokens,
      )
    ) {
      matches.push(label);
    }
  }

  if (matches.length !== 1) return null;

  return matches[0];
}

function resolveEstablishmentLabelFromSectorNameBySuffix(
  sectorName: string,
  workspaceNames: string[],
): string | null {
  const sectorNormalized = normalizeSuffix(sectorName);
  if (!sectorNormalized) return null;

  const matches: string[] = [];

  for (const workspaceName of workspaceNames) {
    const label = workspaceName.trim();
    if (!label) continue;

    const suffix = normalizeSuffix(extractWorkspaceSuffix(label));
    if (!suffix || suffix.length < 2) continue;

    if (sectorNormalized.includes(suffix)) {
      matches.push(label);
    }
  }

  if (matches.length !== 1) return null;

  return matches[0];
}

/**
 * Resolve estabelecimento a partir do nome do setor e da lista de workspaces.
 *
 * 1) Padrão conservador "(UF) Localidade" (ex.: Corteva — (GO) Formosa).
 * 2) Fallback por sufixo: último segmento após separador " — ", " – " ou " - "
 *    contido no nome do setor, com match único.
 */
export function resolveEstablishmentLabelFromSectorName(
  sectorName: string,
  workspaceNames: string[],
): string | null {
  const ufLocationMatch = resolveEstablishmentLabelFromSectorNameByUfLocation(
    sectorName,
    workspaceNames,
  );
  if (ufLocationMatch) return ufLocationMatch;

  return resolveEstablishmentLabelFromSectorNameBySuffix(
    sectorName,
    workspaceNames,
  );
}
