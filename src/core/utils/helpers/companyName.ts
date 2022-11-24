import { ICompany } from 'core/interfaces/api/ICompany';

export const getCompanyName = (
  company?: ICompany,
  options?: { onlyFantasy?: boolean },
): string => {
  if (!company) return '';
  if (options?.onlyFantasy) {
    if (!company?.fantasy) return '';
  }

  const initials = company?.initials ? `(${company?.initials})` : '';
  const name = company?.fantasy || company?.name || '';
  const companyName = (initials ? initials + ' ' : '') + name;

  return companyName;
};
