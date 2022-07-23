import { RoleEnum } from 'project/enum/roles.enums';

export interface IAccessGroup {
  id: number;
  created_at: Date;
  roles: RoleEnum[];
  permissions: string[];
  companyId: string;
  system: boolean;
  name: string;
  description: string;
}
