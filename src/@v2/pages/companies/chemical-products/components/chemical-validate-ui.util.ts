import type { ChemicalValidatePreviewResult } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

export function shouldShowCorrectedWorkbookDownload(
  preview: ChemicalValidatePreviewResult | null | undefined,
): boolean {
  if (!preview || preview.persisted) return false;
  return Boolean(preview.correctedWorkbookAvailable);
}
