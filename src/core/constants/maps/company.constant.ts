import { CompanyTypesEnum } from 'project/enum/company-type.enum';

export interface ICompanyType {
  value: CompanyTypesEnum;
  name: string;
}
interface ICompanyTypes extends Record<CompanyTypesEnum, ICompanyType> {}

export const companyOptionsConstant: ICompanyTypes = {
  [CompanyTypesEnum.MATRIZ]: {
    value: CompanyTypesEnum.MATRIZ,
    name: 'Matriz',
  },
  [CompanyTypesEnum.FILIAL]: {
    value: CompanyTypesEnum.FILIAL,
    name: 'Filial',
  },
  [CompanyTypesEnum.CLINIC]: {
    value: CompanyTypesEnum.CLINIC,
    name: 'Clínica',
  },
};
