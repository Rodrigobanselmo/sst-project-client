import { statusEmployeeStepMap } from './../../../../../../core/constants/maps/status-employee-step.map';

export enum FilterFieldEnum {
  COMPANIES = 'companiesIds',
  CLINICS = 'clinicsIds',
  COMPANIES_GROUP = 'companiesGroupIds',
  CITIES = 'cities',
  UF = 'uf',
  START_DATE = 'startDate',
  END_DATE = 'endDate',
  STATUS = 'notInStatus',

  // EXAM
  EVALUATION_TYPE = 'notInEvaluationType',
  EXAM_TYPE = 'notInExamType',
  LTE_EXPIRED_EXAM = 'lteExpiredDateExam',
  EXAM_AVALIATION_EXAM = 'notInAvaliationType',

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
  [FilterFieldEnum.EXAM_AVALIATION_EXAM]: {
    value: FilterFieldEnum.EXAM_AVALIATION_EXAM,
    name: 'remover exames',
  },
  [FilterFieldEnum.STATUS]: {
    value: FilterFieldEnum.STATUS,
    name: 'Remover status',
  },
  [FilterFieldEnum.DOWNLOAD_TYPE]: {
    value: FilterFieldEnum.DOWNLOAD_TYPE,
    name: '',
  },
};
