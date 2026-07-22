import type { GenerateFrpsLibraryConceptualParams } from './frps-explainability-library.types';

/** Payload de geração: identidade estrita por systemCatalogId + itemType. */
export function buildFrpsLibraryGeneratePayload(
  params: GenerateFrpsLibraryConceptualParams,
): {
  systemCatalogId: string;
  itemType: GenerateFrpsLibraryConceptualParams['itemType'];
  conceptualModel?: string;
} {
  return {
    systemCatalogId: params.systemCatalogId,
    itemType: params.itemType,
    ...(params.conceptualModel
      ? { conceptualModel: params.conceptualModel }
      : {}),
  };
}
