/**
 * Testes pontuais do botão de planilha corrigida (sem runner de Jest no client).
 * Executar: npx tsx src/@v2/pages/companies/chemical-products/components/chemical-validate-ui.util.spec.ts
 */
import type { ChemicalValidatePreviewResult } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

import { shouldShowCorrectedWorkbookDownload } from './chemical-validate-ui.util';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function preview(
  overrides: Partial<ChemicalValidatePreviewResult> = {},
): ChemicalValidatePreviewResult {
  return {
    persisted: false,
    fileName: 'x.xlsx',
    sourceSheet: 'Planilha preparada',
    canProceedHint: false,
    correctedWorkbookAvailable: false,
    consolidations: [],
    summary: {
      components: 0,
      products: 0,
      autoLinkedByCas: 0,
      autoLinkedByExactName: 0,
      autoLinkedBySynonym: 0,
      matchedEquivalence: 0,
      reviewRequired: 0,
      noMatch: 0,
      userAddedCas: 0,
      invalidCas: 0,
      conflicts: 0,
      accepted: 0,
      corrected: 0,
      pending: 0,
      errors: 0,
      warnings: 0,
      infos: 0,
      readyToImport: 0,
      safeCasConsolidations: 0,
    },
    components: [],
    issues: [],
    ...overrides,
  };
}

assert(shouldShowCorrectedWorkbookDownload(null) === false, 'null → oculto');
assert(
  shouldShowCorrectedWorkbookDownload(
    preview({ correctedWorkbookAvailable: false }),
  ) === false,
  'flag false → oculto',
);
assert(
  shouldShowCorrectedWorkbookDownload(
    preview({ correctedWorkbookAvailable: true }),
  ) === true,
  'flag true → visível',
);

console.log('chemical-validate-ui.util.spec.ts OK');
