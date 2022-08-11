import { CompanyPaymentTypeEnum } from 'core/enums/company-payment-type.enum';

export interface ICompanyOption {
  value: CompanyPaymentTypeEnum;
  name: string;
}
interface ICompanyScheduleOptions
  extends Record<CompanyPaymentTypeEnum, ICompanyOption> {}

export const companyPaymentScheduleMap = {
  [CompanyPaymentTypeEnum.ANTICIPATED]: {
    value: CompanyPaymentTypeEnum.ANTICIPATED,
    name: 'Depósito antecipado',
  },
  [CompanyPaymentTypeEnum.DEBIT]: {
    value: CompanyPaymentTypeEnum.DEBIT,
    name: 'Faturamento',
  },
} as ICompanyScheduleOptions;

export const companyPaymentOptionsList = [
  companyPaymentScheduleMap[CompanyPaymentTypeEnum.ANTICIPATED],
  companyPaymentScheduleMap[CompanyPaymentTypeEnum.DEBIT],
];
