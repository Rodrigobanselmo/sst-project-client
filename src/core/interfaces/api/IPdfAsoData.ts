import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

import { ICompany } from './ICompany';
import { IEmployee, IEmployeeExamsHistory } from './IEmployee';
import { IExam } from './IExam';
import { IProfessional } from './IProfessional';
import { IProtocolToRisk } from './IProtocol';
import { IRiskData } from './IRiskData';

export interface IPdfAsoData {
  doneExams: {
    exam: IExam;
    doneDate: Date;
  }[];
  employee: IEmployee;
  consultantCompany: ICompany;
  actualCompany: ICompany;
  doctorResponsible: Partial<IProfessional>;
  admissionDate: Date;
  numAsos: number;
  sector: IHierarchy;
  clinicExam: IEmployeeExamsHistory;
  protocols: IProtocolToRisk[];
  risks: {
    riskData: IRiskData;
    riskFactor: IRiskFactors;
  }[];
}
