export type RiskGroupInventoryChoice<T extends { id: string }> =
  | { kind: 'none' }
  | { kind: 'unique'; id: string }
  | { kind: 'multiple'; groups: T[] };

/** Título já usado pelo RiskTool em “Importar riscos”. */
export const SST_GSE_INVENTORY_SELECT_TITLE =
  'Selecione o Sistema de Gestão SST do GSE';

export function emptySstInventoryMessage(side: 'origem' | 'destino'): string {
  const location = side === 'origem' ? 'na origem' : 'no destino';
  return `Nenhum Sistema de Gestão SST cadastrado ${location}, por favor cadastre um antes para continuar.`;
}

/**
 * Escolha de RiskFactorGroupData sem fallback arbitrário.
 * `groups[0]` só é usado quando o array tem exatamente 1 item (o único).
 */
export function classifyRiskGroupInventory<T extends { id: string }>(
  groups: T[] | null | undefined,
): RiskGroupInventoryChoice<T> {
  if (!groups?.length) return { kind: 'none' };
  if (groups.length === 1) return { kind: 'unique', id: groups[0].id };
  return { kind: 'multiple', groups };
}
