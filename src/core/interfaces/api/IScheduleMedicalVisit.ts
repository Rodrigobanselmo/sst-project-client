import { StatusEnum } from 'project/enum/status.enum';

import { ICompany } from './ICompany';
import { IEmployeeExamsHistory } from './IEmployee';
import { IProfessionalCouncil } from './IProfessional';
import { IUser } from './IUser';

export interface IScheduleMedicalVisit {
  id: number;
  updated_at: Date;
  created_at: Date;
  status: StatusEnum;
  doneClinicDate: Date;
  doneLabDate: Date;
  companyId: string;
  userId: number;
  clinicId: string;
  labId: string;
  docId: number;

  company?: ICompany;
  user?: IUser;
  clinic?: ICompany;
  lab?: ICompany;
  doc?: IProfessionalCouncil;

  exams?: IEmployeeExamsHistory[];
}
