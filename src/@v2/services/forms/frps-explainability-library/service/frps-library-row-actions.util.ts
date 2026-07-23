import type {
  FrpsCatalogAdminUsability,
  FrpsLibraryConceptualStatus,
} from './frps-explainability-library.types';

export type FrpsLibraryRowActions = {
  canGenerate: boolean;
  canView: boolean;
  canUnlinkFromCanonical: boolean;
};

export type GetFrpsLibraryRowActionsParams = {
  status: FrpsLibraryConceptualStatus;
  conceptualExplanationId: string | null;
  /** Default true quando omitido (compat com payloads antigos). */
  generateable?: boolean;
  hasActiveEquivalence?: boolean;
  isMaster?: boolean;
};

/**
 * Ações da tabela por status do browse + gerabilidade do catálogo.
 * Identidade de conteúdo existente vem de conceptualExplanationId.
 * Gerar GLOBAL continua filtrado na UI (`origin === 'GLOBAL'`).
 */
export function getFrpsLibraryRowActions(
  statusOrParams: FrpsLibraryConceptualStatus | GetFrpsLibraryRowActionsParams,
  conceptualExplanationId?: string | null,
): FrpsLibraryRowActions {
  const params: GetFrpsLibraryRowActionsParams =
    typeof statusOrParams === 'string'
      ? {
          status: statusOrParams,
          conceptualExplanationId: conceptualExplanationId ?? null,
        }
      : statusOrParams;

  const hasContent = Boolean(params.conceptualExplanationId);
  const generateable = params.generateable !== false;

  let canGenerateByStatus = false;
  let canView = false;

  switch (params.status) {
    case 'NEVER_GENERATED':
      canGenerateByStatus = true;
      canView = false;
      break;
    case 'DRAFT_AI':
    case 'VALIDATED':
      canGenerateByStatus = false;
      canView = hasContent;
      break;
    case 'REJECTED':
      canGenerateByStatus = true;
      canView = hasContent;
      break;
    default:
      canGenerateByStatus = false;
      canView = false;
  }

  return {
    canGenerate: canGenerateByStatus && generateable,
    canView,
    canUnlinkFromCanonical: Boolean(
      params.isMaster && params.hasActiveEquivalence,
    ),
  };
}

export function isFrpsInvalidSystemReference(
  catalogUsability: FrpsCatalogAdminUsability | undefined,
): boolean {
  return catalogUsability === 'INVALID_SYSTEM_REFERENCE';
}

export function buildFrpsLibraryRowKey(
  itemType: string,
  systemCatalogId: string,
): string {
  return `${itemType}:${systemCatalogId}`;
}
