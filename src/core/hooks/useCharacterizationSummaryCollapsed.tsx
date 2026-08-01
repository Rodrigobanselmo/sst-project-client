/**
 * @deprecated Prefer `useCompanyWorkspaceCardsCollapsed`.
 * Reexports mantidos para imports legados.
 */
export {
  CompanyWorkspaceCardsProvider,
  CompanyWorkspaceCardsProvider as CharacterizationSummaryCollapsedProvider,
  CompanyWorkspaceCardsProvider as CompanySummaryCardsCollapsedProvider,
  useCompanyWorkspaceCardsCollapsed,
  useCompanyWorkspaceCardsCollapsed as useCharacterizationSummaryCollapsed,
  useCompanyWorkspaceCardsCollapsed as useCompanySummaryCardsCollapsed,
  COMPANY_WORKSPACE_CARDS_COLLAPSED_DEFAULT,
  COMPANY_WORKSPACE_CARDS_COLLAPSED_STORAGE_KEY,
  getCompanyWorkspaceCardsToggleLabel,
  parseCompanyWorkspaceCardsCollapsed,
  readCompanyWorkspaceCardsCollapsed,
  writeCompanyWorkspaceCardsCollapsed,
} from './useCompanyWorkspaceCardsCollapsed';

export {
  CHARACTERIZATION_SUMMARY_COLLAPSED_DEFAULT,
  CHARACTERIZATION_SUMMARY_COLLAPSED_STORAGE_KEY,
  getCharacterizationSummaryToggleLabel,
  parseCharacterizationSummaryCollapsed,
  readCharacterizationSummaryCollapsed,
  writeCharacterizationSummaryCollapsed,
} from './useCompanyWorkspaceCardsCollapsed.util';
