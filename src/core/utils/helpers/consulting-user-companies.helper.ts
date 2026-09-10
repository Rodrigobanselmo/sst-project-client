/** Page size for GET /company?userId&findAll used to hydrate consulting user access. */
export const CONSULTING_USER_COMPANIES_TAKE = 1000;

type CompanyLike = { id: string };

export function resolveConsultingEditCompanies<T extends CompanyLike>(params: {
  fetchedCompanies: T[];
  fallbackCompany: T | null;
}): T[] {
  if (params.fetchedCompanies.length > 0) {
    return params.fetchedCompanies;
  }

  return params.fallbackCompany ? [params.fallbackCompany] : [];
}

export function shouldBlockConsultingUserSave(params: {
  isEdit: boolean;
  isConsulting: boolean;
  hasHydratedConsultingLinks: boolean;
}): boolean {
  return params.isEdit && params.isConsulting && !params.hasHydratedConsultingLinks;
}

export function resolveInitialConsultingEditCompanies<T extends CompanyLike>(params: {
  isConsultingEdit: boolean;
  initialCompanies?: T[];
  fallbackCompany?: T | null;
}): T[] {
  if (params.initialCompanies?.length) {
    return params.initialCompanies;
  }

  if (params.isConsultingEdit) {
    return [];
  }

  return params.fallbackCompany ? [params.fallbackCompany] : [];
}
