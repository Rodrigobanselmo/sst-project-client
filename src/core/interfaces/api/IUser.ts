import { ProfessionalTypeEnum } from 'project/enum/professional-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { IAccessGroup } from './IAccessGroup';
import { IProfessionalCouncil } from './IProfessional';

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
  crm: string;
  formation: string[];
  certifications: string[];
  phone: string;
  email: string;
  facebookExternalId: string;
  googleExternalId: string;
  googleUser: string;
  facebookuser: string;
  type: ProfessionalTypeEnum;
  password: string;
  created_at: Date;
  updated_at: Date;
  companies: IUserCompany[];
  userPgrSignature?: IUserToRiskGroup;
  usersPgrSignatures?: IUserToRiskGroup[];
  permissions?: string[];
  roles?: string[];
  companyId?: string;
  councilType: string;
  councilUF: string;
  councilId: string;
  councils: IProfessionalCouncil[];
};
