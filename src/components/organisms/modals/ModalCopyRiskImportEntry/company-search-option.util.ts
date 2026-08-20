import { ICompany } from 'core/interfaces/api/ICompany';

export function stringifyCompanySearchOption(company: ICompany): string {
  return [company.fantasy, company.name, company.initials, company.cnpj, company.id]
    .filter(Boolean)
    .join(' ');
}
