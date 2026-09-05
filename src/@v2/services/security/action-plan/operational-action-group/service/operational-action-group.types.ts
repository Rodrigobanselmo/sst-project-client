export type OperationalActionSuggestionRisk = {
  id: string;
  name: string;
};

export type OperationalActionSuggestion = {
  id: string;
  normalizedKey: string;
  recType: string | null;
  label: string;
  recommendationIds: string[];
  risks: OperationalActionSuggestionRisk[];
  applicationsCount: number;
  suggestedScope: 'GLOBAL';
  members: Array<{
    recommendationId: string;
    riskId: string;
    riskName: string;
    applicationsCount: number;
  }>;
};

export type BrowseOperationalActionSuggestionsParams = {
  companyId: string;
  workspaceId: string;
};

export type ConfirmOperationalActionSuggestionParams = {
  recommendationIds: string[];
  label?: string;
  viewingCompanyId: string;
  scope: 'GLOBAL' | 'COMPANY';
};

export type DismissOperationalActionSuggestionParams = {
  recommendationIds: string[];
  label?: string;
  viewingCompanyId: string;
  scope: 'GLOBAL' | 'COMPANY';
};
