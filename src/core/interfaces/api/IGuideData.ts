import { ExamHistoryTypeEnum } from 'project/enum/employee-exam-history-type.enum';

import { ICompany } from './ICompany';
import { IEmployee } from './IEmployee';
import { IExam } from './IExam';

export interface IGuideDataType {}

export type IClinicExamData = {
  clinic: ICompany;
  exam: IExam;
  doneDate: Date;
  time: string;
  type: ExamHistoryTypeEnum;
  isScheduled: boolean;
  scheduleRange: Record<string, string>;
};

export type IClinicComplementaryData = {
  clinic: ICompany;
  exams: IExam[];
  doneDate: Date;
  time: string;
  id: string;
  isScheduled: boolean;
  scheduleRange: Record<string, string>;
};

export interface IGuideData extends IEmployee {
  clinics: ICompany[];
  exams: IExam[];
  consultantCompany: ICompany;
  company: ICompany;
  clinicExam: IClinicExamData;
  clinicComplementaryExams: IClinicComplementaryData[];
  user: {
    email: string;
    id: string;
  };
}
