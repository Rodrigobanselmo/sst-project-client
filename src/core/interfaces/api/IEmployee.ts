import { ExamHistoryConclusionEnum } from 'project/enum/employee-exam-history-conclusion.enum';
import { ExamHistoryEvaluationEnum } from 'project/enum/employee-exam-history-evaluation.enum';
import { ExamHistoryTypeEnum } from 'project/enum/employee-exam-history-type.enum';
import { EmployeeHierarchyMotiveTypeEnum } from 'project/enum/employee-hierarchy-motive.enum';
import { SexTypeEnum } from 'project/enum/risk.enums copy';
import { StatusEnum } from 'project/enum/status.enum';

import { ICompany } from './ICompany';
import { ClinicScheduleTypeEnum, IExam } from './IExam';
import { IHierarchy } from './IHierarchy';
import { IProfessional } from './IProfessional';
import { IUser } from './IUser';

export interface IEmployee {
  id: number;
  created_at: Date;
  updated_at: Date;
  status: StatusEnum;
  name: string;
  cpf: string;
  companyId: string;
  hierarchyId: string;
  hierarchy: IHierarchy;
  company: ICompany;

  esocialCode: string;
  socialName: string;
  nickname: string;
  phone: string;
  email: string;
  isComorbidity: boolean;
  sex: SexTypeEnum;
  cidId: string;
  shiftId: number;
  birthday: Date;
  admissionDate: Date;
  subOffices?: IHierarchy[];
}

export interface IEmployeeHierarchyHistory {
  id: number;
  motive: EmployeeHierarchyMotiveTypeEnum;
  startDate: Date;
  hierarchyId: string;
  employeeId: number;
  employee: IEmployee;
  created_at: Date;
  updated_at: Date;
  hierarchy: IHierarchy;
}

export interface IEmployeeExamsHistory {
  id: number;
  created_at: Date;
  updated_at: Date;
  doneDate: Date;
  validityInMonths: number;
  examId: number;
  employeeId: number;
  doctorId: number;
  clinicId: string;
  userDoneId: number;
  userScheduleId: number;
  employee?: IEmployee;
  exam?: IExam;
  clinic?: ICompany;
  doctor?: IProfessional;
  userDone?: IUser;
  userSchedule?: IUser;
  examType: ExamHistoryTypeEnum;
  evaluationType: ExamHistoryEvaluationEnum;
  conclusion: ExamHistoryConclusionEnum;
  status: StatusEnum;
  obs?: string;
  time: string;

  hierarchyId: string;
  hierarchy?: IHierarchy;
  clinicObs: string;
  scheduleType: ClinicScheduleTypeEnum;
  changeHierarchyDate: Date;
  changeHierarchyAnyway: boolean;
}
