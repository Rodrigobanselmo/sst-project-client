import { statusEmployeeStepMap } from './../../../../../../core/constants/maps/status-employee-step.map';

export enum FilterFieldEnum {
  COMPANY = 'companyId',
  WORSKAPACE = 'workspaceId',

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
  EXTERNAL_SYSTEM = 'externalSystem',
  DOWNLOAD_TYPE = 'downloadType',

  // RISK (Todos os riscos cadastrados)
  RISK_TYPES = 'riskTypes',
  RISK_SEVERITIES = 'severities',
  RISK_SUB_TYPE_IDS = 'riskSubTypeIds',
  RISK_MUST_IS_PGR = 'mustIsPGR',
  RISK_MUST_IS_PPP = 'mustIsPPP',
  RISK_MUST_IS_PCMSO = 'mustIsPCMSO',
  RISK_MUST_IS_ASO = 'mustIsAso',

  /** Listagem de absenteísmo */
  ABSENTEEISM_EMPLOYEES = 'employeeIds',
  ABSENTEEISM_MOTIVE_IDS = 'motiveIds',
  ABSENTEEISM_OVERLAP_START = 'absenteeismOverlapStart',
  ABSENTEEISM_OVERLAP_END = 'absenteeismOverlapEnd',
}

type IMap = Record<
  FilterFieldEnum,
  {
    value: FilterFieldEnum;
    name: string;
  }
>;

export const filterFieldMap: IMap = {
  [FilterFieldEnum.COMPANY]: {
    value: FilterFieldEnum.COMPANY,
    name: 'Empresa',
  },
  [FilterFieldEnum.WORSKAPACE]: {
    value: FilterFieldEnum.WORSKAPACE,
    name: 'Estabelecimento',
  },
  [FilterFieldEnum.COMPANIES]: {
    value: FilterFieldEnum.COMPANIES,
    name: 'Empresas',
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
  [FilterFieldEnum.EXTERNAL_SYSTEM]: {
    value: FilterFieldEnum.EXTERNAL_SYSTEM,
    name: 'Exportar para',
  },
  [FilterFieldEnum.RISK_TYPES]: {
    value: FilterFieldEnum.RISK_TYPES,
    name: 'Tipo de risco',
  },
  [FilterFieldEnum.RISK_SEVERITIES]: {
    value: FilterFieldEnum.RISK_SEVERITIES,
    name: 'Severidade',
  },
  [FilterFieldEnum.RISK_SUB_TYPE_IDS]: {
    value: FilterFieldEnum.RISK_SUB_TYPE_IDS,
    name: 'Subtipo',
  },
  [FilterFieldEnum.RISK_MUST_IS_PGR]: {
    value: FilterFieldEnum.RISK_MUST_IS_PGR,
    name: 'Com PGR',
  },
  [FilterFieldEnum.RISK_MUST_IS_PPP]: {
    value: FilterFieldEnum.RISK_MUST_IS_PPP,
    name: 'Com PPP',
  },
  [FilterFieldEnum.RISK_MUST_IS_PCMSO]: {
    value: FilterFieldEnum.RISK_MUST_IS_PCMSO,
    name: 'Com PCMSO',
  },
  [FilterFieldEnum.RISK_MUST_IS_ASO]: {
    value: FilterFieldEnum.RISK_MUST_IS_ASO,
    name: 'Com ASO',
  },
  [FilterFieldEnum.ABSENTEEISM_EMPLOYEES]: {
    value: FilterFieldEnum.ABSENTEEISM_EMPLOYEES,
    name: 'Funcionário',
  },
  [FilterFieldEnum.ABSENTEEISM_MOTIVE_IDS]: {
    value: FilterFieldEnum.ABSENTEEISM_MOTIVE_IDS,
    name: 'Motivo',
  },
  [FilterFieldEnum.ABSENTEEISM_OVERLAP_START]: {
    value: FilterFieldEnum.ABSENTEEISM_OVERLAP_START,
    name: 'Data (início período)',
  },
  [FilterFieldEnum.ABSENTEEISM_OVERLAP_END]: {
    value: FilterFieldEnum.ABSENTEEISM_OVERLAP_END,
    name: 'Data (fim período)',
  },
};
