export const HOME_COMPANY_PAGE_PATHNAME =
  '/dashboard/empresas/[companyId]/novo/[stage]';

export const HOME_SCOPE_QUERY_KEY = 'homeScope';
export const BUSINESS_GROUP_ID_QUERY_KEY = 'businessGroupId';

export const HOME_SCOPE_GROUP = 'group';
export const HOME_SCOPE_COMPANY = 'company';

export const HOME_ALL_GROUP_COMPANIES_VALUE = '__ALL_GROUP_COMPANIES__';

export const HOME_GROUP_CONSOLIDATED_STAGE_MESSAGE =
  'Selecione uma empresa para ver os detalhes.';

export function isHomeCompanyPage(pathname: string): boolean {
  return pathname === HOME_COMPANY_PAGE_PATHNAME;
}

/** Restringe o seletor do header ao grupo da empresa atual em qualquer rota de empresa. */
export function shouldRestrictCompanySelectorToBusinessGroup(params: {
  isCompanyRoute: boolean;
  hasBusinessGroup: boolean;
  businessGroupId: number | null;
}): boolean {
  return (
    params.isCompanyRoute &&
    params.hasBusinessGroup &&
    !!params.businessGroupId
  );
}
