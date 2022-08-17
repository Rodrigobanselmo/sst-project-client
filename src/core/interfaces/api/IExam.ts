import { StatusEnum } from 'project/enum/status.enum';

import { IRiskData } from './IRiskData';
import { IRiskFactors } from './IRiskFactors';

export enum ExamTypeEnum {
  LAB = 'LAB',
  AUDIO = 'AUDIO',
  VISUAL = 'VISUAL',
  OTHERS = 'OTHERS',
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
  analyses: string;
  deleted_at: Date;
  examToClinic: IExamToClinic[];
  examsRiskData: IExamRiskData;
}

export interface IExamToClinic {
  id: number;
  examId: number;
  companyId: string;
  groupId: string;
  dueInDays: number;
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
  fromAge?: number;
  toAge?: number;
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
  fromAge?: number;
  toAge?: number;
}
