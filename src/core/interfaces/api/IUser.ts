import { StatusEnum } from 'project/enum/status.enum';

export type IUserCompany = {
  roles: string[];
  permissions: string[];
  status: StatusEnum;
  userId: number;
  companyId: string;
  created_at: Date;
  updated_at: Date;
};

export type IUser = {
  id: number;
  name: string;
  email: string;
  permissions: string[];
  roles: string[];
  companyId: string;
  password: string;
  created_at: Date;
  updated_at: Date;
  companies: IUserCompany[];
};
