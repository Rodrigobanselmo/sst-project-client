import type { FrpsLibraryConceptualStatus } from '@v2/services/forms/frps-explainability-library';

/**
 * Visibilidade do botão "Validar explicação" na Biblioteca.
 *
 * Regra de produto (client pré-filtro; API é autoridade final):
 * - MASTER
 * - item GLOBAL/system (não LOCAL)
 * - não é alias
 * - tem conceptualExplanationId
 * - validationStatus = DRAFT_AI
 *
 * Importante: NÃO usar `isCanonical` do browse — na API isso significa
 * `aliasCount > 0` (cabeça de grupo com aliases), não “é canônico global”.
 */
export function canShowFrpsLibraryConceptualValidateAction(params: {
  isMaster: boolean;
  origin: 'GLOBAL' | 'LOCAL';
  isAliasRow: boolean;
  conceptualExplanationId: string | null | undefined;
  validationStatus: FrpsLibraryConceptualStatus | string | null | undefined;
}): boolean {
  if (!params.isMaster) return false;
  if (params.origin !== 'GLOBAL') return false;
  if (params.isAliasRow) return false;
  if (!params.conceptualExplanationId?.trim()) return false;
  return params.validationStatus === 'DRAFT_AI';
}

export function formatFrpsValidatedAtLabel(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString('pt-BR');
}
