import type { ICompany } from 'core/interfaces/api/ICompany';

export type CompanyDisplayName = 'legal' | 'fantasy';
export const companyDisplayNameKey = (companyId: string) =>
  `simplesst:organogram:company-display-name:${companyId}`;

export function getCompanyDisplayNamePreference(companyId: string): CompanyDisplayName {
  try {
    return typeof window !== 'undefined' &&
      window.localStorage.getItem(companyDisplayNameKey(companyId)) === 'fantasy'
      ? 'fantasy' : 'legal';
  } catch {
    return 'legal';
  }
}

export function resolveCompanyDisplayName(company: Pick<ICompany, 'id' | 'name' | 'fantasy'>) {
  return getCompanyDisplayNamePreference(company.id) === 'fantasy' && company.fantasy?.trim()
    ? company.fantasy : company.name;
}
