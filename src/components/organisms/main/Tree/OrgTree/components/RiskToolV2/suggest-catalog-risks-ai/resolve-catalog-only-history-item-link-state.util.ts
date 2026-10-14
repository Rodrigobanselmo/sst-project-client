import type { CatalogOnlyAiIdentificationRunItem } from '@v2/services/security/characterization/characterization/catalog-only-ai-identification-history/service/catalog-only-ai-identification-history.types';

export type CatalogOnlyHistoryItemLinkState =
  | 'selectable'
  | 'already_linked'
  | 'unavailable';

/**
 * Confronta fator do histórico com vínculos atuais e catálogo ativo permitido.
 * Não altera registros históricos — só decide se a inclusão é permitida agora.
 */
export function resolveCatalogOnlyHistoryItemLinkState(params: {
  item: Pick<CatalogOnlyAiIdentificationRunItem, 'riskId'>;
  catalogIds: Set<string>;
  existingDirectRiskIds: Set<string>;
}): CatalogOnlyHistoryItemLinkState {
  const riskId = params.item?.riskId;
  if (!riskId || !params.catalogIds.has(riskId)) {
    return 'unavailable';
  }
  if (params.existingDirectRiskIds.has(riskId)) {
    return 'already_linked';
  }
  return 'selectable';
}

/**
 * Filtra IDs explicitamente selecionados para o payload de vínculo catalog-only.
 * Descarta duplicatas, já vinculados e indisponíveis no catálogo.
 */
export function filterCatalogOnlyHistoryIdsForLink(params: {
  selectedRiskIds: string[];
  catalogIds: Set<string>;
  existingDirectRiskIds: Set<string>;
}): {
  linkableIds: string[];
  blockedAlreadyLinked: number;
  blockedUnavailable: number;
} {
  const seen = new Set<string>();
  const linkableIds: string[] = [];
  let blockedAlreadyLinked = 0;
  let blockedUnavailable = 0;

  for (const id of params.selectedRiskIds) {
    if (!id || seen.has(id)) continue;
    seen.add(id);
    if (!params.catalogIds.has(id)) {
      blockedUnavailable += 1;
      continue;
    }
    if (params.existingDirectRiskIds.has(id)) {
      blockedAlreadyLinked += 1;
      continue;
    }
    linkableIds.push(id);
  }

  return { linkableIds, blockedAlreadyLinked, blockedUnavailable };
}
