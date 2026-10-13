import {
  countSuggestionMayAutoSave,
  WorkspaceProbabilityAuthority,
  WorkspaceProbabilityOrigin,
} from 'core/utils/workspace-probability-evaluation.util';

import {
  CountSuggestionDecision,
  countSuggestionEffectAction,
  countSuggestionSignature,
} from './qualitative-probability.util';

export type CountSuggestionTracking = {
  contextKey: string;
  signature: string;
};

/**
 * Identifica a linha observada: fator, estabelecimento do cabeçalho, origem das
 * contagens e a avaliação carregada. A linha do novo estabelecimento chega
 * depois da troca do cabeçalho; com `criteriaAdoptedAt`, autoridade e origem na
 * chave, essa chegada vira nova linha de base em vez de gravação.
 */
export function countSuggestionContextKey(params: {
  riskDataId?: string | null;
  headerWorkspaceId?: string | null;
  countWorkspaceIds?: string[] | null;
  authority?: WorkspaceProbabilityAuthority | null;
  origin?: WorkspaceProbabilityOrigin | null;
  criteriaAdoptedAt?: string | Date | null;
}): string {
  const adoptedAt =
    params.criteriaAdoptedAt instanceof Date
      ? params.criteriaAdoptedAt.toISOString()
      : params.criteriaAdoptedAt ?? '';
  return [
    params.riskDataId ?? '',
    params.headerWorkspaceId ?? '',
    (params.countWorkspaceIds ?? []).join(','),
    params.authority ?? '',
    params.origin ?? '',
    adoptedAt,
  ].join('|');
}

/** Com estabelecimento no cabeçalho, as contagens do GSE precisam ser só dele. */
function countsMatchHeader(params: {
  isGhoSource?: boolean;
  headerWorkspaceId?: string | null;
  countWorkspaceIds?: string[] | null;
}): boolean {
  if (!params.isGhoSource || !params.headerWorkspaceId) return true;
  const ids = params.countWorkspaceIds ?? [];
  return ids.length === 1 && ids[0] === params.headerWorkspaceId;
}

/**
 * Primeira observação de cada contexto só registra a linha de base. Depois,
 * grava apenas quando a sugestão automática muda, a avaliação permite
 * (WORKSPACE + ESTIMATE ou sem autoridade) e as contagens são do cabeçalho.
 */
export function decideCountSuggestionAutoSave(params: {
  previous: CountSuggestionTracking | null;
  contextKey: string;
  decision: CountSuggestionDecision;
  authority?: WorkspaceProbabilityAuthority | null;
  origin?: WorkspaceProbabilityOrigin | null;
  isGhoSource?: boolean;
  headerWorkspaceId?: string | null;
  countWorkspaceIds?: string[] | null;
}): { tracking: CountSuggestionTracking; save: boolean } {
  const tracking = {
    contextKey: params.contextKey,
    signature: countSuggestionSignature(params.decision),
  };

  if (!params.previous || params.previous.contextKey !== params.contextKey) {
    return { tracking, save: false };
  }

  const action = countSuggestionEffectAction(
    params.previous.signature,
    params.decision,
  );
  const save =
    action === 'auto' &&
    params.decision.kind === 'auto' &&
    countSuggestionMayAutoSave({
      authority: params.authority,
      origin: params.origin,
    }) &&
    countsMatchHeader(params);

  return { tracking, save };
}
