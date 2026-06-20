import { RiskEnum } from 'project/enum/risk.enums';

export type DocumentGenerationRiskFilter = {
  mode: 'EXCLUDE';
  excludedRiskFactorIds?: string[];
  excludedCategoryIds?: RiskEnum[];
  excludedSubcategoryIds?: number[];
};

export const emptyDocumentGenerationRiskFilter = (): undefined => undefined;

export const hasActiveDocumentRiskFilter = (
  filter?: DocumentGenerationRiskFilter | null,
): filter is DocumentGenerationRiskFilter => {
  if (!filter || filter.mode !== 'EXCLUDE') return false;

  return Boolean(
    filter.excludedRiskFactorIds?.length ||
      filter.excludedCategoryIds?.length ||
      filter.excludedSubcategoryIds?.length,
  );
};
