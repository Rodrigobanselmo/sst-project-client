export type RiskToolModalData = {
  riskGroupId: string;
  /** Só a abertura por Caracterização > Riscos > Origem liga a visualização por risco V2. */
  byRiskV2: boolean;
};

/**
 * Dados do modal quando ele está no topo da pilha (toda abertura envia `riskGroupId`).
 * Modais empilhados por cima devolvem `{}`: aí o estado atual é mantido.
 */
export function mergeRiskToolModalData(
  oldData: RiskToolModalData,
  initialData: Partial<RiskToolModalData> | null | undefined,
): RiskToolModalData {
  const isOwnOpenData = Object.prototype.hasOwnProperty.call(
    initialData ?? {},
    'riskGroupId',
  );
  return {
    ...oldData,
    ...(isOwnOpenData ? { byRiskV2: false } : {}),
    ...(initialData ?? {}),
  };
}
