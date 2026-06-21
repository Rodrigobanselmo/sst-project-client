import { DocumentGenerationRiskFilter } from './document-generation-risk-filter.types';

export type DocumentGenerationFilterItemSnapshot = {
  id: string;
  name?: string;
};

export type DocumentGenerationSnapshot = {
  ghoIds?: string[];
  filterViewType?: string;
  selectedFilters?: DocumentGenerationFilterItemSnapshot[];
  modelId?: number;
  coordinatorBy?: string;
  legalResponsibleBy?: string;
  json?: Record<string, unknown>;
  professionalSignatures?: Array<{
    professionalId: number;
    isSigner?: boolean;
    isElaborator?: boolean;
  }>;
  riskFilter?: DocumentGenerationRiskFilter;
  promotedFromTestVersionId?: string;
};
