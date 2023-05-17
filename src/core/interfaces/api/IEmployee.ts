import { ExamHistoryConclusionEnum } from 'project/enum/employee-exam-history-conclusion.enum';
import { ExamHistoryEvaluationEnum } from 'project/enum/employee-exam-history-evaluation.enum';
import { ExamHistoryTypeEnum } from 'project/enum/employee-exam-history-type.enum';
import { EmployeeHierarchyMotiveTypeEnum } from 'project/enum/employee-hierarchy-motive.enum';
import { SexTypeEnum } from 'project/enum/sex.enums';
import { StatusEnum } from 'project/enum/status.enum';
import { StatusEmployeeStepEnum } from 'project/enum/statusEmployeeStep.enum';
import { StatusExamEnum } from 'project/enum/statusExam.enum';

import { ICid } from './ICid';
import { ICompany } from './ICompany';
import { ClinicScheduleTypeEnum, IExam } from './IExam';
import { IHierarchy } from './IHierarchy';
import { IProfessional } from './IProfessional';
import { IUser } from './IUser';

export type IEmployeeInfoExam = Record<
  number,
  {
    expiredDate?: Date;
    closeToExpired?: boolean;
    isAttendance: boolean;
    examId: number;
    validity: number;
  }
>;
export interface IEmployee {
  id: number;
  created_at: Date;
  updated_at: Date;
  status: StatusEnum;
  name: string;
  cpf: string;
  rg: string;
  companyId: string;
  hierarchyId: string;
  hierarchy: IHierarchy;
  sectorHierarchy: IHierarchy;

  esocialCode: string;
  socialName: string;
  nickname: string;
  phone: string;
  email: string;
  isComorbidity: boolean;
  isPCD: boolean;
  sex: SexTypeEnum;
  cidId: string;
  shiftId: number;
  birthday: Date;
  admissionDate: Date;
  subOffices?: IHierarchy[];
  clinicId: string;
  expiredDateExam: Date;
  skippedDismissalExam: boolean;
  lastExam: Date;
  statusExam?: StatusExamEnum;
  statusStep?: StatusEmployeeStepEnum;
  cids?: ICid[];

  company: ICompany;
  examsHistory?: IEmployeeExamsHistory[];
  lastDoneExam?: IEmployeeExamsHistory;
  hierarchyHistory?: IEmployeeHierarchyHistory[];
  examType?: ExamHistoryTypeEnum;
  infoExams?: IEmployeeInfoExam;
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
  subHierarchies: IHierarchy[];
}

export interface IEmployeeExamsHistory {
  id: number;
  scheduleMedicalVisitId: number;
  created_at: Date;
  updated_at: Date;
  doneDate: Date;
  expiredDate: Date;
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
  fileUrl: string;

  hierarchyId: string;
  hierarchy?: IHierarchy;
  subOfficeId: string;
  subOffice?: IHierarchy;
  clinicObs: string;
  scheduleType: ClinicScheduleTypeEnum;
  changeHierarchyDate: Date;
  changeHierarchyAnyway: boolean;
}
