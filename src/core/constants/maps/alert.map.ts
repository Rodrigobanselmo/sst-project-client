export enum AlertsGroupTypeEnum {
  CLINIC = 'CLINIC',
  COMPANY = 'COMPANY',
  GROUP_COMPANY = 'GROUP_COMPANY',
  CONSULT_COMPANY = 'CONSULT_COMPANY',
}

export enum AlertsFieldEnum {
  USER = 'USER',
  GROUP = 'GROUP',
  EMAIL = 'EMAIL',
}

export enum AlertsTypeEnum {
  CLINIC_NEXT_DAY_SCHEDULE = 'CLINIC_NEXT_DAY_SCHEDULE',
  COMPANY_EXPIRED_EXAM = 'COMPANY_EXPIRED_EXAM',
}

export interface IAlertOption {
  value: AlertsTypeEnum;
  label: string;
  description: string;
  users: string[];
}
interface IAlertOptions extends Record<AlertsTypeEnum, IAlertOption> {}

export const alertMap: IAlertOptions = {
  [AlertsTypeEnum.CLINIC_NEXT_DAY_SCHEDULE]: {
    value: AlertsTypeEnum.CLINIC_NEXT_DAY_SCHEDULE,
    label: 'Exames agendados',
    users: [AlertsGroupTypeEnum.CLINIC],
    description:
      'Envio da lista de exames agendados para a clínica referente ao dia seguinte',
  },
  [AlertsTypeEnum.COMPANY_EXPIRED_EXAM]: {
    value: AlertsTypeEnum.COMPANY_EXPIRED_EXAM,
    label: 'Exames vencidos/a vencer',
    users: [
      AlertsGroupTypeEnum.COMPANY,
      AlertsGroupTypeEnum.GROUP_COMPANY,
      AlertsGroupTypeEnum.CONSULT_COMPANY,
    ],
    description:
      'Envio da lista de empregados com exames vencidos ou proximos do vencimento',
  },
};

export const alertOptionsList = [
  alertMap[AlertsTypeEnum.COMPANY_EXPIRED_EXAM],
  alertMap[AlertsTypeEnum.CLINIC_NEXT_DAY_SCHEDULE],
];

export const alertFilterOptionsList = [
  { label: 'Empresa', value: AlertsGroupTypeEnum.COMPANY },
  { label: 'Clínica', value: AlertsGroupTypeEnum.CLINIC },
];
