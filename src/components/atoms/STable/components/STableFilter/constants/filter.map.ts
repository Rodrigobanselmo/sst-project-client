export enum FilterFieldEnum {
  COMPANIES = 'companiesIds',
  CLINICS = 'clinicsIds',
  COMPANIES_GROUP = 'companiesGroupIds',
  CITIES = 'cities',
  UF = 'uf',
  START_DATE = 'startDate',
  END_DATE = 'endDate',
  DOWLOAD_TYPE = 'downloadType',
  EVALUATION_TYPE = 'notInEvaluationType',
  IS_PERIODIC = 'isPeriodic:  ',
  IS_CHANGE = 'isChange ',
  IS_ADMISSION = 'isAdmission ',
  IS_RETURN = 'isReturn ',
  IS_DISMISSAL = 'isDismissal ',
}

type IMap = Record<
  FilterFieldEnum,
  {
    value: FilterFieldEnum;
    name: string;
  }
>;

export const filterFieldMap: IMap = {
  [FilterFieldEnum.COMPANIES]: {
    value: FilterFieldEnum.COMPANIES,
    name: 'Empresa',
  },
  [FilterFieldEnum.CLINICS]: {
    value: FilterFieldEnum.CLINICS,
    name: 'Clínicas',
  },
  [FilterFieldEnum.COMPANIES_GROUP]: {
    value: FilterFieldEnum.COMPANIES_GROUP,
    name: 'Grupo Empresarial',
  },
  [FilterFieldEnum.CITIES]: {
    value: FilterFieldEnum.CITIES,
    name: 'Cidades',
  },
  [FilterFieldEnum.UF]: {
    value: FilterFieldEnum.UF,
    name: 'Estado',
  },
  [FilterFieldEnum.START_DATE]: {
    value: FilterFieldEnum.START_DATE,
    name: 'Data Início',
  },
  [FilterFieldEnum.END_DATE]: {
    value: FilterFieldEnum.END_DATE,
    name: 'Data Fim',
  },
  [FilterFieldEnum.EVALUATION_TYPE]: {
    value: FilterFieldEnum.EVALUATION_TYPE,
    name: 'Remover tipo avaliaçàp',
  },
  [FilterFieldEnum.IS_ADMISSION]: {
    value: FilterFieldEnum.IS_ADMISSION,
    name: 'Remover exames',
  },
  [FilterFieldEnum.IS_PERIODIC]: {
    value: FilterFieldEnum.IS_PERIODIC,
    name: 'Remover exames',
  },
  [FilterFieldEnum.IS_CHANGE]: {
    value: FilterFieldEnum.IS_CHANGE,
    name: 'Remover exames',
  },
  [FilterFieldEnum.IS_DISMISSAL]: {
    value: FilterFieldEnum.IS_DISMISSAL,
    name: 'Remover exames',
  },
  [FilterFieldEnum.IS_RETURN]: {
    value: FilterFieldEnum.IS_RETURN,
    name: 'Remover exames',
  },
  [FilterFieldEnum.DOWLOAD_TYPE]: {
    value: FilterFieldEnum.DOWLOAD_TYPE,
    name: '',
  },
};

export const clinicFilterList = [
  FilterFieldEnum.CITIES,
  FilterFieldEnum.UF,
  FilterFieldEnum.COMPANIES,
  FilterFieldEnum.COMPANIES_GROUP,
];

export const expiredExamFilterList = [
  FilterFieldEnum.CITIES,
  FilterFieldEnum.UF,
  FilterFieldEnum.COMPANIES,
  FilterFieldEnum.COMPANIES_GROUP,
];

export const examsTypeList = [
  FilterFieldEnum.IS_PERIODIC,
  FilterFieldEnum.IS_CHANGE,
  FilterFieldEnum.IS_ADMISSION,
  FilterFieldEnum.IS_RETURN,
  FilterFieldEnum.IS_DISMISSAL,
];

export const examsFilterList = [
  ...examsTypeList,
  FilterFieldEnum.CLINICS,
  FilterFieldEnum.EVALUATION_TYPE,
  FilterFieldEnum.COMPANIES,
  FilterFieldEnum.COMPANIES_GROUP,
  FilterFieldEnum.START_DATE,
  FilterFieldEnum.END_DATE,
];
