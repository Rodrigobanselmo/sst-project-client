export enum FilterFieldEnum {
  COMPANIES = 'companiesIds',
  CLINICS = 'clinicsIds',
  COMPANIES_GROUP = 'companiesGroupIds',
  CITIES = 'cities',
  UF = 'uf',
  START_DATE = 'startDate',
  END_DATE = 'endDate',

  // EXAM
  EVALUATION_TYPE = 'notInEvaluationType',
  EXAM_TYPE = 'notInExamType',
  LTE_EXPIRED_EXAM = 'lteExpiredDateExam',

  //ALL
  DOWNLOAD_TYPE = 'downloadType',
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
  [FilterFieldEnum.EXAM_TYPE]: {
    value: FilterFieldEnum.EXAM_TYPE,
    name: 'Remover exames',
  },
  [FilterFieldEnum.LTE_EXPIRED_EXAM]: {
    value: FilterFieldEnum.LTE_EXPIRED_EXAM,
    name: 'Exames a vencer até',
  },
  [FilterFieldEnum.DOWNLOAD_TYPE]: {
    value: FilterFieldEnum.DOWNLOAD_TYPE,
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
  FilterFieldEnum.LTE_EXPIRED_EXAM,
];

export const doneExamsFilterList = [
  FilterFieldEnum.CLINICS,
  FilterFieldEnum.EXAM_TYPE,
  FilterFieldEnum.EVALUATION_TYPE,
  FilterFieldEnum.COMPANIES,
  FilterFieldEnum.COMPANIES_GROUP,
  FilterFieldEnum.START_DATE,
  FilterFieldEnum.END_DATE,
];
