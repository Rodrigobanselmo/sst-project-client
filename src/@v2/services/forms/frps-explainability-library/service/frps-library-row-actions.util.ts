import type { FrpsLibraryConceptualStatus } from './frps-explainability-library.types';

export type FrpsLibraryRowActions = {
  canGenerate: boolean;
  canView: boolean;
};

/**
 * Ações da tabela por status do browse.
 * Identidade de conteúdo existente vem de conceptualExplanationId.
 */
export function getFrpsLibraryRowActions(
  status: FrpsLibraryConceptualStatus,
  conceptualExplanationId: string | null,
): FrpsLibraryRowActions {
  const hasContent = Boolean(conceptualExplanationId);

  switch (status) {
    case 'NEVER_GENERATED':
      return { canGenerate: true, canView: false };
    case 'DRAFT_AI':
    case 'VALIDATED':
      return { canGenerate: false, canView: hasContent };
    case 'REJECTED':
      return { canGenerate: true, canView: hasContent };
    default:
      return { canGenerate: false, canView: false };
  }
}

export function buildFrpsLibraryRowKey(
  itemType: string,
  systemCatalogId: string,
): string {
  return `${itemType}:${systemCatalogId}`;
}
