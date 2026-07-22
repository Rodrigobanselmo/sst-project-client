import type {
  FrpsCatalogAdminItem,
  FrpsLibraryConceptualStatus,
} from '@v2/services/forms/frps-explainability-library';
import {
  RiskCatalogKind,
  type RiskCatalogSearchItem,
} from '@v2/services/risk-catalog-equivalence/service/risk-catalog-equivalence.types';
import { getCatalogScopeBlockReason } from '@v2/services/risk-catalog-equivalence/utils/risk-catalog-equivalence-scope.util';

export const FRPS_ADM_ENG_INCOMPATIBLE_MESSAGE =
  'Seleção incompatível entre Administrativa e Engenharia.';

export const FRPS_CANONICAL_MUST_BE_SYSTEM_MESSAGE =
  'O canônico deve ser um item global (system).';

export const FRPS_ALIAS_MUST_BE_LOCAL_MESSAGE =
  'Apenas itens locais podem ser selecionados como alias.';

/** Source pode ser LOCAL ou GLOBAL; já vinculado ou inválido é bloqueado. */
export const FRPS_ALIAS_SOURCE_ALREADY_LINKED_MESSAGE =
  'Este item já é alias ativo de outro canônico.';

export const FRPS_EQUIVALENCE_BOTH_VALIDATED_MESSAGE =
  'Os dois itens possuem explicações conceituais validadas. Reabra para revisão a explicação que não será mantida antes de criar a equivalência.';

export const FRPS_EQUIVALENCE_SOURCE_VALIDATED_TARGET_MISSING_MESSAGE =
  'O item de origem possui explicação conceitual validada e o canônico não possui. Reabra para revisão a explicação que não será mantida antes de criar a equivalência.';

/** Label de empresa exibido para itens do catálogo global (system). */
export const FRPS_GLOBAL_COMPANY_DISPLAY_NAME = 'SimpleSST';

export const FRPS_GLOBAL_ORIGIN_DISPLAY_NAME = 'Catálogo Global';

export type FrpsGlobalCandidateHintStatus =
  | 'EXACT_MATCH'
  | 'POSSIBLE_CANDIDATES'
  | 'NONE';

export type FrpsGlobalCandidateHint = {
  status: FrpsGlobalCandidateHintStatus;
  count: number;
  sampleLabel: string | null;
};

/**
 * Espelha a normalização do search de Equivalências (pontuação final),
 * sem alterar a regra de domínio no servidor.
 */
export function normalizeFrpsCatalogSearchTerm(search: string): string {
  const trimmed = search.trim();
  const withoutTrailingPunctuation = trimmed.replace(/[.,;:!?]+$/u, '').trim();
  return withoutTrailingPunctuation || trimmed;
}

/** Normalização para igualdade exata de label (pontuação final, espaços, caixa). */
export function normalizeFrpsCatalogLabelForExactMatch(label: string): string {
  return normalizeFrpsCatalogSearchTerm(label)
    .replace(/\s+/gu, ' ')
    .trim()
    .toLocaleLowerCase('pt-BR');
}

export function frpsCatalogLabelsMatchExactly(
  left: string,
  right: string,
): boolean {
  const a = normalizeFrpsCatalogLabelForExactMatch(left);
  const b = normalizeFrpsCatalogLabelForExactMatch(right);
  if (!a || !b) return false;
  return a === b;
}

/** Mesma ideia do `contains` case-insensitive do endpoint de search. */
export function frpsCatalogLabelsMatchByContains(
  left: string,
  right: string,
): boolean {
  const a = normalizeFrpsCatalogLabelForExactMatch(left);
  const b = normalizeFrpsCatalogLabelForExactMatch(right);
  if (!a || !b) return false;
  return a.includes(b) || b.includes(a);
}

function matchesAliasRecMedTypeForSearchItem(
  alias: FrpsCatalogAdminItem,
  candidate: RiskCatalogSearchItem,
): boolean {
  if (alias.kind !== 'REC_MED') return true;
  const candidateType = candidate.recType || candidate.medType;
  if (alias.itemType === 'ADMINISTRATIVE_RECOMMENDATION') {
    return candidateType === 'ADM';
  }
  if (alias.itemType === 'ENGINEERING_RECOMMENDATION') {
    return candidateType === 'ENG';
  }
  return true;
}

/**
 * Filtra resultados do search para canônicos estruturalmente compatíveis
 * (system, kind, risk, ADM/ENG, escopo). Não decide sugestão automática.
 */
export function filterStructurallyCompatibleGlobalCanonicals(params: {
  aliases: FrpsCatalogAdminItem[];
  searchItems: RiskCatalogSearchItem[];
}): RiskCatalogSearchItem[] {
  const firstAlias = params.aliases[0];
  if (!firstAlias) return [];

  const aliasSearchItems = params.aliases.map(mapFrpsCatalogAdminItemToSearchItem);

  const sourceIds = new Set(params.aliases.map((alias) => alias.id));

  return params.searchItems.filter((item) => {
    if (!item.system) return false;
    if (item.deleted_at) return false;
    if (item.isAliasActive) return false;
    if (sourceIds.has(item.id)) return false;
    if (item.kind !== (firstAlias.kind === 'GENERATE_SOURCE'
      ? RiskCatalogKind.GENERATE_SOURCE
      : RiskCatalogKind.REC_MED)) {
      return false;
    }
    if (item.riskId !== firstAlias.riskId) return false;
    if (!matchesAliasRecMedTypeForSearchItem(firstAlias, item)) return false;
    return aliasSearchItems.every((alias) => {
      const reason = getCatalogScopeBlockReason(item, alias);
      return reason == null;
    });
  });
}

export type FrpsLibraryCanonicalLinkAction = 'SEARCH' | 'CHOOSE_OTHER';

/**
 * Ação da coluna "Candidato global" para abrir o diálogo de vinculação.
 * Não cria equivalência; apenas decide o rótulo da ação manual.
 */
export function resolveFrpsLibraryCanonicalLinkAction(params: {
  origin: FrpsCatalogAdminItem['origin'];
  hasActiveEquivalence: boolean;
  hintStatus: FrpsGlobalCandidateHintStatus;
}): FrpsLibraryCanonicalLinkAction | null {
  // LOCAL ou GLOBAL podem ser source; já vinculados não oferecem ação.
  if (
    (params.origin !== 'LOCAL' && params.origin !== 'GLOBAL') ||
    params.hasActiveEquivalence
  ) {
    return null;
  }
  if (params.hintStatus === 'NONE') return 'SEARCH';
  return 'CHOOSE_OTHER';
}

/**
 * Sugestão automática do card: exatamente 1 global estruturalmente
 * compatível com igualdade normalizada exata do label.
 * `contains` do endpoint NÃO basta para pré-selecionar.
 */
export function resolveFrpsExactAutoSuggestedCanonical(params: {
  aliases: FrpsCatalogAdminItem[];
  searchItems: RiskCatalogSearchItem[];
}): RiskCatalogSearchItem | null {
  const firstAlias = params.aliases[0];
  if (!firstAlias) return null;

  const exactMatches = filterStructurallyCompatibleGlobalCanonicals(params).filter(
    (item) => frpsCatalogLabelsMatchExactly(firstAlias.label, item.label),
  );

  return exactMatches.length === 1 ? exactMatches[0] : null;
}

/**
 * Candidatos globais compatíveis com o alias local, usando as mesmas
 * regras de `getFrpsCanonicalSelectionBlockReason` (sem criar equivalência).
 */
export function findCompatibleGlobalCatalogCandidates(
  local: FrpsCatalogAdminItem,
  catalogItems: FrpsCatalogAdminItem[],
): FrpsCatalogAdminItem[] {
  return catalogItems.filter(
    (candidate) =>
      getFrpsCanonicalSelectionBlockReason([local], candidate) === null,
  );
}

/**
 * Indicador informativo da listagem a partir dos itens já carregados na página.
 * Não dispara request por linha.
 */
export function resolveFrpsGlobalCandidateHint(
  local: FrpsCatalogAdminItem,
  pageItems: FrpsCatalogAdminItem[],
): FrpsGlobalCandidateHint {
  if (
    (local.origin !== 'LOCAL' && local.origin !== 'GLOBAL') ||
    local.activeEquivalence
  ) {
    return { status: 'NONE', count: 0, sampleLabel: null };
  }

  const compatible = findCompatibleGlobalCatalogCandidates(local, pageItems);
  const exact = compatible.filter((candidate) =>
    frpsCatalogLabelsMatchExactly(local.label, candidate.label),
  );

  if (exact.length > 0) {
    return {
      status: 'EXACT_MATCH',
      count: exact.length,
      sampleLabel: exact[0].label,
    };
  }

  const possible = compatible.filter((candidate) =>
    frpsCatalogLabelsMatchByContains(local.label, candidate.label),
  );

  if (possible.length > 0) {
    return {
      status: 'POSSIBLE_CANDIDATES',
      count: possible.length,
      sampleLabel: possible[0].label,
    };
  }

  return { status: 'NONE', count: 0, sampleLabel: null };
}

/** @deprecated Prefer resolveFrpsGlobalCandidateHint. */
export function findLikelyGlobalCatalogCandidates(
  local: FrpsCatalogAdminItem,
  catalogItems: FrpsCatalogAdminItem[],
): FrpsCatalogAdminItem[] {
  return findCompatibleGlobalCatalogCandidates(local, catalogItems).filter(
    (candidate) => frpsCatalogLabelsMatchByContains(local.label, candidate.label),
  );
}
export type FrpsConceptualStatusSnapshot = {
  status: FrpsLibraryConceptualStatus;
  explanationId: string | null;
  itemKey: string;
};

export function mapFrpsCatalogAdminItemToSearchItem(
  item: FrpsCatalogAdminItem,
): RiskCatalogSearchItem {
  return {
    id: item.id,
    kind:
      item.kind === 'GENERATE_SOURCE'
        ? RiskCatalogKind.GENERATE_SOURCE
        : RiskCatalogKind.REC_MED,
    label: item.label,
    riskId: item.riskId,
    riskName: item.riskName,
    companyId: item.companyId,
    companyName: item.companyName,
    system: item.system,
    deleted_at: null,
    recType: item.recType,
    medType: item.medType,
    isAliasActive: Boolean(item.activeEquivalence),
    canonicalId: item.activeEquivalence?.canonicalId ?? null,
    canonicalLabel: item.activeEquivalence?.canonicalLabel ?? null,
  };
}

export function getFrpsAliasSelectionBlockReason(
  selectedAliases: FrpsCatalogAdminItem[],
  candidate: FrpsCatalogAdminItem,
): string | null {
  // Source: LOCAL ou GLOBAL (system). Nunca item já vinculado.
  if (candidate.origin !== 'LOCAL' && candidate.origin !== 'GLOBAL') {
    return FRPS_ALIAS_MUST_BE_LOCAL_MESSAGE;
  }
  if (candidate.origin === 'GLOBAL' && !candidate.system) {
    return FRPS_ALIAS_MUST_BE_LOCAL_MESSAGE;
  }
  if (candidate.activeEquivalence) {
    return `${FRPS_ALIAS_SOURCE_ALREADY_LINKED_MESSAGE} → ${candidate.activeEquivalence.canonicalLabel}.`;
  }

  if (!selectedAliases.length) return null;

  const first = selectedAliases[0];
  if (first.kind !== candidate.kind) {
    return 'Tipo de catálogo diferente dos aliases já selecionados.';
  }
  if (first.riskId !== candidate.riskId) {
    return 'Risco diferente dos aliases já selecionados.';
  }
  if (first.kind === 'REC_MED' && first.itemType !== candidate.itemType) {
    return FRPS_ADM_ENG_INCOMPATIBLE_MESSAGE;
  }

  return null;
}

export function getFrpsCanonicalSelectionBlockReason(
  aliases: FrpsCatalogAdminItem[],
  canonical: FrpsCatalogAdminItem,
): string | null {
  if (!aliases.length) return 'Selecione ao menos um item.';
  if (canonical.origin !== 'GLOBAL' || !canonical.system) {
    return FRPS_CANONICAL_MUST_BE_SYSTEM_MESSAGE;
  }
  if (canonical.activeEquivalence) {
    return 'O canônico selecionado já é alias de outro item.';
  }
  if (aliases.some((alias) => alias.id === canonical.id)) {
    return 'O canônico não pode ser o mesmo item selecionado como alias.';
  }

  const first = aliases[0];
  if (canonical.kind !== first.kind) {
    return 'Tipo de catálogo diferente dos aliases.';
  }
  if (canonical.riskId !== first.riskId) {
    return 'Risco incompatível com os aliases.';
  }
  if (first.kind === 'REC_MED' && canonical.itemType !== first.itemType) {
    return FRPS_ADM_ENG_INCOMPATIBLE_MESSAGE;
  }

  const canonicalSearch = mapFrpsCatalogAdminItemToSearchItem(canonical);
  for (const alias of aliases) {
    const reason = getCatalogScopeBlockReason(
      canonicalSearch,
      mapFrpsCatalogAdminItemToSearchItem(alias),
    );
    if (reason) return reason;
  }

  return null;
}

/**
 * Bloqueio duro de conflito conceitual (API espelhada).
 * Info/aviso leve continua em shouldWarnConceptualExplanationConflict.
 */
export function getFrpsEquivalenceConceptualConflictReason(params: {
  aliases: Array<{ conceptualExplanation: FrpsConceptualStatusSnapshot }>;
  canonical: FrpsConceptualStatusSnapshot | null;
}): string | null {
  if (!params.canonical) return null;

  for (const alias of params.aliases) {
    const source = alias.conceptualExplanation.status;
    const target = params.canonical.status;

    if (source === 'VALIDATED' && target === 'VALIDATED') {
      return FRPS_EQUIVALENCE_BOTH_VALIDATED_MESSAGE;
    }
    if (
      source === 'VALIDATED' &&
      (target === 'NEVER_GENERATED' || target === 'REJECTED')
    ) {
      return FRPS_EQUIVALENCE_SOURCE_VALIDATED_TARGET_MISSING_MESSAGE;
    }
  }

  return null;
}

/** True when alias and canonical both have conceptual content (any status ≠ NEVER). */
export function shouldWarnConceptualExplanationConflict(
  aliases: Array<{ conceptualExplanation: FrpsConceptualStatusSnapshot }>,
  canonical: FrpsConceptualStatusSnapshot | null,
): boolean {
  if (!canonical) return false;
  if (getFrpsEquivalenceConceptualConflictReason({ aliases, canonical })) {
    return false;
  }
  if (canonical.status === 'NEVER_GENERATED') return false;
  return aliases.some(
    (alias) => alias.conceptualExplanation.status !== 'NEVER_GENERATED',
  );
}

export function describeConceptualComparison(params: {
  aliases: Array<{
    label: string;
    conceptualExplanation: FrpsConceptualStatusSnapshot;
  }>;
  canonical: FrpsConceptualStatusSnapshot | null;
}): {
  conflict: boolean;
  canonicalStatusLabel: string;
  aliasSummaries: Array<{ label: string; status: FrpsLibraryConceptualStatus }>;
} {
  const conflict = shouldWarnConceptualExplanationConflict(
    params.aliases,
    params.canonical,
  );

  return {
    conflict,
    canonicalStatusLabel: params.canonical?.status ?? 'NEVER_GENERATED',
    aliasSummaries: params.aliases.map((alias) => ({
      label: alias.label,
      status: alias.conceptualExplanation.status,
    })),
  };
}

/** Avoid exposing technical IDs in user-facing copy. */
export function assertNoTechnicalIdInUserCopy(text: string): boolean {
  const uuidPattern =
    /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;
  return !uuidPattern.test(text);
}
