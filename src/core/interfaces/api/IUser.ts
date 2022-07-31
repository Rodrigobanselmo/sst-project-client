import { StatusEnum } from 'project/enum/status.enum';

import { IAccessGroup } from './IAccessGroup';

export type IUserCompany = {
  roles: string[];
  permissions: string[];
  status: StatusEnum;
  userId: number;
  groupId: number;
  group: IAccessGroup | null;
  companyId: string;
  created_at: Date;
  updated_at: Date;
};

export type IUserToRiskGroup = {
  userId: number;
  riskDataGroupId: string;
  isSigner: boolean;
  user?: IUser;
};

export type IUser = {
  id: number;
  name: string;
  cpf: string;
  crea: string;
  formation: string[];
  certifications: string[];
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
  companies: IUserCompany[];
  userPgrSignature?: IUserToRiskGroup;
  usersPgrSignatures?: IUserToRiskGroup[];
  permissions?: string[];
  roles?: string[];
  companyId?: string;
};
