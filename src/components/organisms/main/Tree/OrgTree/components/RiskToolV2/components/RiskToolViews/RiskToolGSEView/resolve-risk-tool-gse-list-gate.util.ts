/**
 * Gate da lista de Fatores de Riscos (GSE / Elemento).
 * O catálogo precisa estar resolvido antes de tratar `[]` como vazio real.
 */

export function isRiskCatalogPending(params: {
  isFetched: boolean;
  isLoading: boolean;
  isFetching: boolean;
}): boolean {
  return !params.isFetched && (params.isLoading || params.isFetching);
}

export type RiskToolGseListGateInput = {
  homoId: string;
  isRiskDataLoading: boolean;
  isRiskDataError: boolean;
  isCatalogFetched: boolean;
  isCatalogLoading: boolean;
  isCatalogFetching: boolean;
  joinedRowCount: number;
};

export type RiskToolGseListGateResult =
  | { state: 'no-selection' }
  | { state: 'loading' }
  | { state: 'error' }
  | { state: 'empty' }
  | { state: 'success' };

export function resolveRiskToolGseListGate(
  input: RiskToolGseListGateInput,
): RiskToolGseListGateResult {
  if (!input.homoId) return { state: 'no-selection' };
  if (input.isRiskDataLoading) return { state: 'loading' };
  if (input.isRiskDataError) return { state: 'error' };
  if (
    isRiskCatalogPending({
      isFetched: input.isCatalogFetched,
      isLoading: input.isCatalogLoading,
      isFetching: input.isCatalogFetching,
    })
  ) {
    return { state: 'loading' };
  }
  if (input.joinedRowCount === 0) return { state: 'empty' };
  return { state: 'success' };
}
