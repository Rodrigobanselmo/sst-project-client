import type { RiskCatalogEquivalence } from '../service/risk-catalog-equivalence.types';
import { isRiskCatalogGlobalEquivalenceMetadata } from './risk-catalog-equivalence-global.util';

export type RiskCatalogEquivalenceGroup = {
  key: string;
  kind: RiskCatalogEquivalence['kind'];
  riskId: string;
  canonicalId: string;
  canonicalLabel: string;
  equivalenceType: RiskCatalogEquivalence['equivalenceType'];
  aliases: RiskCatalogEquivalence[];
  aliasCount: number;
  hasGlobalEquivalence: boolean;
  hasRevoked: boolean;
  allRevoked: boolean;
  latestConfirmedAt: string | null;
};

export function isEquivalenceItemGlobal(
  eq: RiskCatalogEquivalence,
): boolean {
  return (
    eq.isGlobalEquivalence === true ||
    isRiskCatalogGlobalEquivalenceMetadata(eq.metadata)
  );
}

function buildGroupKey(eq: RiskCatalogEquivalence): string {
  return [
    eq.kind,
    eq.riskId,
    eq.canonicalId,
    eq.equivalenceType,
  ].join('::');
}

/**
 * Agrupa equivalências registradas por canônico + kind + riskId + tipo.
 * Aliases ativos vêm antes dos revogados dentro de cada grupo.
 */
export function groupRiskCatalogEquivalences(
  equivalences: RiskCatalogEquivalence[],
): RiskCatalogEquivalenceGroup[] {
  const groups = new Map<string, RiskCatalogEquivalenceGroup>();

  for (const eq of equivalences) {
    const key = buildGroupKey(eq);
    const existing = groups.get(key);

    if (!existing) {
      groups.set(key, {
        key,
        kind: eq.kind,
        riskId: eq.riskId,
        canonicalId: eq.canonicalId,
        canonicalLabel: eq.canonicalLabel,
        equivalenceType: eq.equivalenceType,
        aliases: [eq],
        aliasCount: 1,
        hasGlobalEquivalence: isEquivalenceItemGlobal(eq),
        hasRevoked: Boolean(eq.revokedAt),
        allRevoked: Boolean(eq.revokedAt),
        latestConfirmedAt: eq.confirmedAt,
      });
      continue;
    }

    existing.aliases.push(eq);
    existing.aliasCount += 1;
    existing.hasGlobalEquivalence =
      existing.hasGlobalEquivalence || isEquivalenceItemGlobal(eq);
    existing.hasRevoked = existing.hasRevoked || Boolean(eq.revokedAt);
    existing.allRevoked = existing.allRevoked && Boolean(eq.revokedAt);

    if (
      eq.confirmedAt &&
      (!existing.latestConfirmedAt ||
        new Date(eq.confirmedAt).getTime() >
          new Date(existing.latestConfirmedAt).getTime())
    ) {
      existing.latestConfirmedAt = eq.confirmedAt;
    }
  }

  for (const group of groups.values()) {
    group.aliases.sort((a, b) => {
      const revokedDiff = Number(Boolean(a.revokedAt)) - Number(Boolean(b.revokedAt));
      if (revokedDiff !== 0) return revokedDiff;

      const aTime = a.confirmedAt ? new Date(a.confirmedAt).getTime() : 0;
      const bTime = b.confirmedAt ? new Date(b.confirmedAt).getTime() : 0;
      return bTime - aTime;
    });
  }

  return [...groups.values()].sort((a, b) => {
    const aTime = a.latestConfirmedAt
      ? new Date(a.latestConfirmedAt).getTime()
      : 0;
    const bTime = b.latestConfirmedAt
      ? new Date(b.latestConfirmedAt).getTime()
      : 0;
    if (bTime !== aTime) return bTime - aTime;
    return a.canonicalLabel.localeCompare(b.canonicalLabel, 'pt-BR', {
      sensitivity: 'base',
    });
  });
}
