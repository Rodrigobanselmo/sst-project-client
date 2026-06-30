import { StatusEnum } from 'project/enum/status.enum';

import { IGho } from './IGho';
import { IRiskData } from './IRiskData';
import { IRiskFactors } from './IRiskFactors';

export enum ExamTypeEnum {
  LAB = 'LAB',
  AUDIO = 'AUDIO',
  VISUAL = 'VISUAL',
  OTHERS = 'OTHERS',
}

export enum ExamOriginEnum {
  NR07 = 'NR07',
  SYSTEM = 'SYSTEM',
  CLIENT = 'CLIENT',
  OTHER = 'OTHER',
}

/**
 * Fonte técnica/normativa acumulativa de um exame. Diferente de
 * {@link ExamOriginEnum} (bucket único legado), um exame pode carregar várias
 * fontes ao mesmo tempo — ex.: ["NR_07", "ACGIH_BEI"]. SYSTEM/CLIENT/OTHER só
 * aparecem quando não há fonte normativa específica.
 */
export enum ExamOriginSourceEnum {
  ESOCIAL_T27 = 'ESOCIAL_T27',
  NR_07 = 'NR_07',
  ACGIH_BEI = 'ACGIH_BEI',
  SYSTEM = 'SYSTEM',
  CLIENT = 'CLIENT',
  OTHER = 'OTHER',
}

export enum ClinicScheduleTypeEnum {
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
  ONLINE = 'ONLINE',
  ASK = 'ASK',
  NONE = 'NONE',
}

export interface IExam {
  id: number;
  name: string;
  instruction: string;
  material: string;
  companyId: string;
  status: StatusEnum;
  type: ExamTypeEnum;
  updated_at: Date;
  created_at: Date;
  system: boolean;
  isAttendance: boolean;
  isAvaliation: boolean;
  analyses: string;
  deleted_at: Date;
  origin?: ExamOriginEnum;
  /** Fontes técnicas/normativas acumulativas (ex.: ["NR_07", "ACGIH_BEI"]). */
  originSources?: ExamOriginSourceEnum[];
  esocial27Code?: string | null;
  /** Item da Tabela 27/eSocial ainda não materializado no catálogo operacional. */
  isEsocialT27Unpublished?: boolean;
  examToClinic: IExamToClinic[];
  examToRiskData: IExamRiskData[];
  examsRiskData: IExamRiskData;
}

export interface IExamToClinic {
  id: number;
  examId: number;
  companyId: string;
  groupId: string;
  dueInDays?: number;
  isScheduled: boolean;
  observation: string;
  examMinDuration: number;
  isPeriodic?: boolean;
  isChange?: boolean;
  isAdmission?: boolean;
  isReturn?: boolean;
  isDismissal?: boolean;
  scheduleType: ClinicScheduleTypeEnum;
  exam?: IExam;
  price: number;
  startDate: Date;
  scheduleRange?: Record<string, string>;
  status: StatusEnum;
}

export interface IExamToRisk {
  id: number;
  examId: number;
  riskId: string;
  companyId?: string;
  exam?: IExam;
  risk?: IRiskFactors;

  isMale?: boolean;
  isFemale?: boolean;
  isPeriodic?: boolean;
  isChange?: boolean;
  isAdmission?: boolean;
  isReturn?: boolean;
  isDismissal?: boolean;
  validityInMonths?: number;
  lowValidityInMonths?: number;
  considerBetweenDays?: number;
  fromAge?: number;
  toAge?: number;
  minRiskDegree?: number;
  minRiskDegreeQuantity?: number;
}

export interface IExamRiskData {
  examId?: number;
  riskFactorDataId?: string;
  exam?: IExam;
  riskData?: IRiskData;

  isMale?: boolean;
  isFemale?: boolean;
  isPeriodic?: boolean;
  isChange?: boolean;
  isAdmission?: boolean;
  isReturn?: boolean;
  isDismissal?: boolean;
  validityInMonths?: number;
  lowValidityInMonths?: number;
  considerBetweenDays?: number;
  fromAge?: number;
  toAge?: number;
  minRiskDegree?: number;
  minRiskDegreeQuantity?: number;
  isStandard?: boolean;
}

export interface IExamOriginData extends Partial<IExamRiskData> {
  origin?: string;
  prioritization?: number;
  skipEmployee?: boolean;
  status?: StatusEnum;
  closeToExpired?: boolean;
  homogeneousGroup?: IGho;
  expiredDate?: Date | null;
  doneDate?: Date | null;
  risk: IRiskFactors;
}

export interface IExamsByHierarchyRiskData {
  origins?: IExamOriginData[];
  exam?: { id: number; name: string; isAttendance: boolean };
}
