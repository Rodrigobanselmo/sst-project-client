import { ICompany } from './ICompany';
import { IUser } from './IUser';

export type IUserHistory = {
  id: number;
  companyId: string;
  ip: string;
  city: string;
  country: string;
  region: string;
  userAgent: string;
  userAgentString: string;
  userId: number;
  created_at: Date;
  updated_at: Date;
  user: IUser;
  company: ICompany;
};
