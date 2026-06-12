export const CompanyGroupRoutes = {
  HOME_SUMMARY: 'v2/company-groups/:companyGroupId/home-summary',
  CONSOLIDATED_VIEW_ELIGIBILITY:
    'v2/company-groups/:companyGroupId/forms/applications/consolidated-view/eligibility',
  CONSOLIDATED_VIEW_SUMMARY:
    'v2/company-groups/:companyGroupId/forms/applications/consolidated-view/summary',
  CONSOLIDATED_VIEW_PARTICIPANTS:
    'v2/company-groups/:companyGroupId/forms/applications/consolidated-view/participants',
} as const;
