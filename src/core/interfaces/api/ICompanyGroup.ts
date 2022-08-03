import { ICompany } from './ICompany';

export interface ICompanyGroup {
  id: number;
  name: string;
  description: string;
  companies: ICompany[];
  created_at: Date;
  updated_at: Date;
  companyId: string;
  numAsos: number;
  blockResignationExam: boolean;
  esocialStart: Date;
}
