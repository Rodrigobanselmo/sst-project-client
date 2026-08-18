import type {
  ChemicalExcelImportPreview,
  ChemicalExcelProductAction,
  ChemicalExcelUseScenarioAction,
  ChemicalExcelUseScenarioProductStatus,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

export const CHEMICAL_EXCEL_PRODUCT_ACTION_LABEL: Record<
  ChemicalExcelProductAction,
  string
> = {
  CREATE_NEW: 'NOVO PRODUTO',
  POSSIBLE_DUPLICATE: 'NOVO PRODUTO (possível duplicidade)',
  REUSE_EXISTING: 'PRODUTO EXISTENTE',
  AMBIGUOUS_BLOCKED: 'AMBÍGUO / BLOQUEADO',
  SKIP_INVALID: 'INVÁLIDO / BLOQUEADO',
};

export const CHEMICAL_EXCEL_USE_SCENARIO_PRODUCT_STATUS_LABEL: Record<
  ChemicalExcelUseScenarioProductStatus,
  string
> = {
  NEW: 'NOVO PRODUTO',
  EXISTING: 'PRODUTO EXISTENTE',
  AMBIGUOUS: 'AMBÍGUO / BLOQUEADO',
  MISSING: 'INVÁLIDO / BLOQUEADO',
};

export const CHEMICAL_EXCEL_USE_SCENARIO_ACTION_LABEL: Record<
  ChemicalExcelUseScenarioAction,
  string
> = {
  CREATE_NEW: 'NOVO CENÁRIO',
  ALREADY_IMPORTED: 'JÁ IMPORTADO',
  BLOCKED: 'INVÁLIDO / BLOQUEADO',
};

export function chemicalExcelProductActionLabel(
  action: string | null | undefined,
): string {
  if (!action) return '—';
  return (
    CHEMICAL_EXCEL_PRODUCT_ACTION_LABEL[action as ChemicalExcelProductAction] ||
    action
  );
}

export function summarizeChemicalExcelImportPreview(
  preview: Pick<ChemicalExcelImportPreview, 'canCommit' | 'totals' | 'useScenarios'>,
) {
  const totals = preview.totals;
  const useScenarios = preview.useScenarios;
  const hasUseScenarioSheet = Boolean(useScenarios?.sheetPresent);
  const blocked =
    (totals.blockedScenarios ?? 0) + (totals.ambiguousProducts ?? 0);
  return {
    hasUseScenarioSheet,
    sheetEmpty: Boolean(useScenarios?.sheetEmpty),
    newProducts: totals.newProducts ?? 0,
    reusedProducts: totals.reusedProducts ?? 0,
    ambiguousProducts: totals.ambiguousProducts ?? 0,
    newScenarios: totals.newScenarios ?? 0,
    alreadyImportedScenarios: totals.alreadyImportedScenarios ?? 0,
    blocked,
    canCommit: preview.canCommit,
    commitDisabledReason: preview.canCommit
      ? null
      : blocked > 0
        ? 'Há produtos ou cenários bloqueados. Corrija a planilha antes de confirmar.'
        : (totals.newScenarios ?? 0) === 0 &&
            (totals.newProducts ?? totals.products) === 0 &&
            (totals.alreadyImportedScenarios ?? 0) > 0
          ? 'Não há novos cenários para importar.'
          : null,
  };
}
