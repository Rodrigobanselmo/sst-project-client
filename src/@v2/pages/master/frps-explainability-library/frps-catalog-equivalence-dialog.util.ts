/**
 * Estado inicial do diálogo de vinculação (auto vs manual).
 * Separado do componente para testes pontuais sem montar o Dialog.
 */

export type FrpsEquivalenceDialogInit = {
  pickerMode: 'auto' | 'manual';
  autoResolved: boolean;
  suggestionAccepted: boolean;
  searchDraft: string;
  canonicalId: string;
};

export function buildFrpsEquivalenceDialogInit(params: {
  aliasLabel: string;
  preferManualPicker: boolean;
  normalizeSearch: (value: string) => string;
}): FrpsEquivalenceDialogInit {
  const searchDraft = params.normalizeSearch(params.aliasLabel);
  if (params.preferManualPicker) {
    return {
      pickerMode: 'manual',
      autoResolved: true,
      suggestionAccepted: false,
      searchDraft,
      canonicalId: '',
    };
  }
  return {
    pickerMode: 'auto',
    autoResolved: false,
    suggestionAccepted: false,
    searchDraft,
    canonicalId: '',
  };
}

/**
 * Após sucesso parcial/total: mantém seleções fora do lote e só os aliases
 * que falharam no lote atual (para retry).
 */
export function mergeFrpsEquivalenceSelectionAfterBatch<T extends { id: string }>(params: {
  previousSelected: T[];
  attemptedAliasIds: ReadonlySet<string>;
  failedAliases: T[];
}): T[] {
  const outside = params.previousSelected.filter(
    (item) => !params.attemptedAliasIds.has(item.id),
  );
  const merged = [...outside];
  for (const failed of params.failedAliases) {
    if (!merged.some((item) => item.id === failed.id)) {
      merged.push(failed);
    }
  }
  return merged;
}
