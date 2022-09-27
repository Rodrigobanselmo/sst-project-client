import { ICompany } from 'core/interfaces/api/ICompany';

export const getCompanyName = (company?: ICompany): string => {
  if (!company) return '';

  const initials = company?.initials ? `(${company?.initials})` : '';
  const name = company?.fantasy || company?.name || '';
  const companyName = (initials ? initials + ' ' : '') + name;

  return companyName;
};
