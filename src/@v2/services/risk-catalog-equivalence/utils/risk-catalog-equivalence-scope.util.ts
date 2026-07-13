import type { RiskCatalogSearchItem } from '../service/risk-catalog-equivalence.types';

export const RISK_CATALOG_SYSTEM_AS_ALIAS_MESSAGE =
  'Item de sistema deve ser usado como canônico';

export const RISK_CATALOG_DIFFERENT_COMPANY_MESSAGE =
  'Empresa diferente do canônico';

export const RISK_CATALOG_DIFFERENT_KIND_MESSAGE =
  'Tipo de catálogo diferente do canônico';

export const RISK_CATALOG_DIFFERENT_RISK_MESSAGE =
  'Risco diferente do canônico';

export const RISK_CATALOG_SCOPE_INCOMPATIBLE_FALLBACK_MESSAGE =
  'Escopo incompatível com o canônico';

export const RISK_CATALOG_SYSTEM_CANONICAL_INFO =
  'Canônico de sistema será usado como padrão global para novas seleções e dedupe.';

export const RISK_CATALOG_GLOBAL_EQUIVALENCE_CONFIRM_MESSAGE =
  'Esta equivalência global será usada para orientar deduplicação futura, novos vínculos e sugestões da IA. Ela não altera documentos já emitidos nem migra vínculos históricos.';

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

/**
 * Motivo legível de por que o item não pode ser alias do canônico.
 * Retorna null quando compatível. Não altera a regra de compatibilidade.
 */
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
    return RISK_CATALOG_DIFFERENT_KIND_MESSAGE;
  }
  if (canonical.riskId !== alias.riskId) {
    return RISK_CATALOG_DIFFERENT_RISK_MESSAGE;
  }
  if (isCatalogScopeCompatible(canonical, alias)) return null;
  if (!canonical.system && alias.system) {
    return RISK_CATALOG_SYSTEM_AS_ALIAS_MESSAGE;
  }
  if (!canonical.system && !alias.system && canonical.companyId !== alias.companyId) {
    return RISK_CATALOG_DIFFERENT_COMPANY_MESSAGE;
  }
  return RISK_CATALOG_SCOPE_INCOMPATIBLE_FALLBACK_MESSAGE;
}

export function canAddAsAlias(
  canonical: RiskCatalogSearchItem | null,
  item: RiskCatalogSearchItem,
): boolean {
  if (!canonical) return false;
  return getCatalogScopeBlockReason(canonical, item) === null;
}

/**
 * Elegível a equivalência global Master: mesmo kind/riskId, bloqueio apenas por empresa.
 * Não libera alias system nem tipo/risco diferente.
 */
export function canAddAsGlobalAlias(
  canonical: RiskCatalogSearchItem | null,
  item: RiskCatalogSearchItem,
): boolean {
  if (!canonical) return false;
  if (item.isAliasActive || canonical.isAliasActive) return false;
  if (canonical.id === item.id) return false;
  if (canonical.kind !== item.kind) return false;
  if (canonical.riskId !== item.riskId) return false;
  if (canonical.system || item.system) return false;
  if (isCatalogScopeCompatible(canonical, item)) return false;
  return canonical.companyId !== item.companyId;
}

export function isAliasAcceptableForCanonical(
  canonical: RiskCatalogSearchItem | null,
  item: RiskCatalogSearchItem,
): boolean {
  return canAddAsAlias(canonical, item) || canAddAsGlobalAlias(canonical, item);
}
