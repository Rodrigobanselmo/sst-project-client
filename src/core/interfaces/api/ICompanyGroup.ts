import { ICompany } from './ICompany';

export interface ICompanyGroup {
  id: number;
  name: string;
  description: string;
  companies: ICompany[];
  companyGroup: ICompany;
  created_at: Date;
  updated_at: Date;
  companyId: string;
  numAsos: number;
  blockResignationExam: boolean;
  esocialSend: boolean;
  esocialStart: Date;
}
