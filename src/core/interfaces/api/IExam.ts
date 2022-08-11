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
}

export interface IExamToClinic {
  id: number;
  examId: number;
  companyId: string;
  dueInDays: number;
  isScheduled: boolean;
  observation: string;
  examMinDuration: number;
  scheduleType: ClinicScheduleTypeEnum;
  exam?: IExam;
  price: number;
  startDate: Date;
  scheduleRange?: Record<string, string>;
  status: StatusEnum;
}

export interface IExamToClinicPricing {
  id: number;
  examToClinicId: number;
  price: number;
  startDate: Date;
  observation: string;
  examToClinic?: IExamToClinic;
}

export interface IExamToRisk {
  examId: number;
  riskId: string;
  exam?: IExam;
  risk?: IRiskFactors;
}

export interface IExamToRiskData {
  examId: number;
  riskId: string;
  exam?: IExam;
  riskData?: IRiskData;
}
