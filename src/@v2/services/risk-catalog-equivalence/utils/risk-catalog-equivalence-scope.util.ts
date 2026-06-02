import type { RiskCatalogSearchItem } from '../service/risk-catalog-equivalence.types';

export const RISK_CATALOG_SYSTEM_AS_ALIAS_MESSAGE =
  'Item de sistema deve ser usado como canônico. Inverta a seleção.';

export const RISK_CATALOG_DIFFERENT_COMPANY_MESSAGE =
  'Não é possível mesclar itens de empresas diferentes nesta fase.';

export const RISK_CATALOG_SYSTEM_CANONICAL_INFO =
  'Canônico de sistema será usado como padrão global para novas seleções e dedupe.';

/** Alinhado à API: canônico system aceita aliases de qualquer empresa com mesmo riskId/kind. */
export function isCatalogScopeCompatible(
  canonical: RiskCatalogSearchItem,
  alias: RiskCatalogSearchItem,
): boolean {
  if (canonical.kind !== alias.kind) return false;
  if (canonical.riskId !== alias.riskId) return false;
  if (canonical.system) return true;
  if (alias.system) return false;
  return canonical.companyId === alias.companyId;
}

export function getCatalogScopeBlockReason(
  canonical: RiskCatalogSearchItem,
  alias: RiskCatalogSearchItem,
): string | null {
  if (alias.isAliasActive) {
    return `Este item já é alias ativo → ${alias.canonicalLabel ?? 'canônico'}.`;
  }
  if (canonical.isAliasActive) {
    return 'O canônico selecionado já é alias de outro item.';
  }
  if (canonical.id === alias.id) {
    return 'Alias não pode ser igual ao canônico.';
  }
  if (canonical.kind !== alias.kind) {
    return 'Canônico e alias devem ser do mesmo tipo de catálogo.';
  }
  if (canonical.riskId !== alias.riskId) {
    return `Canônico e alias devem pertencer ao mesmo risco (${canonical.riskName} ≠ ${alias.riskName}).`;
  }
  if (isCatalogScopeCompatible(canonical, alias)) return null;
  if (!canonical.system && alias.system) {
    return RISK_CATALOG_SYSTEM_AS_ALIAS_MESSAGE;
  }
  return RISK_CATALOG_DIFFERENT_COMPANY_MESSAGE;
}

export function canAddAsAlias(
  canonical: RiskCatalogSearchItem | null,
  item: RiskCatalogSearchItem,
): boolean {
  if (!canonical) return false;
  return getCatalogScopeBlockReason(canonical, item) === null;
}
