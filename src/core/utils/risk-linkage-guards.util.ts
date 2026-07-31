/** Safe label for characterization / GHO rows when description may be null. */
export function characterizationDisplayName(
  description?: string | null,
  name?: string | null,
): string {
  return description?.split('(//)')[0] || name || '';
}

export const RISK_LINKAGE_EMPTY_MESSAGE =
  'Nenhum fator de risco vinculado a esta entidade.';

export const RISK_LINKAGE_SELECT_ENTITY_MESSAGE =
  'Selecione uma entidade para visualizar os fatores de risco.';

export const RISK_LINKAGE_ENTITY_UNAVAILABLE_MESSAGE =
  'A entidade selecionada não está mais disponível.';

export const RISK_LINKAGE_LOAD_ERROR_MESSAGE =
  'Não foi possível carregar os fatores de risco desta entidade.';

/** Side list must tolerate undefined query payloads from loading/error states. */
export function coerceGhoQueryList<T>(ghoQuery: T[] | null | undefined): T[] {
  return ghoQuery ?? [];
}

/** Normalize risk-data query payloads before list rendering. */
export function coerceRiskDataList<T>(riskData: T[] | null | undefined): T[] {
  return riskData ?? [];
}

export function riskLinkageEmptyMessage(params: {
  hasSelection: boolean;
  selectionMissing?: boolean;
}): string {
  if (params.selectionMissing) return RISK_LINKAGE_ENTITY_UNAVAILABLE_MESSAGE;
  if (params.hasSelection) return RISK_LINKAGE_EMPTY_MESSAGE;
  return RISK_LINKAGE_SELECT_ENTITY_MESSAGE;
}
