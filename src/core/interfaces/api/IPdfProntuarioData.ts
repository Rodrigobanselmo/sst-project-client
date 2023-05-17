import { SexTypeEnum } from 'project/enum/sex.enums';

import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

import { ICompany } from './ICompany';
import { IEmployee, IEmployeeExamsHistory } from './IEmployee';
import { IExam } from './IExam';
import { IProfessional } from './IProfessional';
import { IRiskData } from './IRiskData';

export interface IProntuarioQuestion {
  name: string;
  textAnswer?: string;
  objectiveAnswer?: string[];
  sex?: SexTypeEnum;
}

export interface IPdfProntuarioData {
  questions: IProntuarioQuestion[];
  examination: IProntuarioQuestion[];
  employee: IEmployee;
  consultantCompany: ICompany;
  actualCompany: ICompany;
  admissionDate: Date;
  doctorResponsible: Partial<IProfessional>;
  clinicExam: IEmployeeExamsHistory;
  sector: IHierarchy;
  withDate?: boolean;
  doneExams?: {
    exam: IExam;
    doneDate: Date;
  }[];
  risks: {
    riskData: IRiskData;
    riskFactor: IRiskFactors;
  }[];
}
