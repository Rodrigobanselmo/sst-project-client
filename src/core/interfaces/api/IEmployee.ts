import { EmployeeHierarchyMotiveTypeEnum } from 'project/enum/employee-hierarchy-motive.enum';
import { SexTypeEnum } from 'project/enum/risk.enums copy';
import { StatusEnum } from 'project/enum/status.enum';

import { IExam } from './IExam';
import { IHierarchy } from './IHierarchy';

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
  time: string;
  examId: number;
  employeeId: number;
  employee: IEmployee;
  exam: IExam;
  hierarchyId: string;
}
