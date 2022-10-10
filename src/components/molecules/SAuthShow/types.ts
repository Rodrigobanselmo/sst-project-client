import { PermissionEnum } from 'project/enum/permission.enum';
import { RoleEnum } from 'project/enum/roles.enums';

export interface ISAuthShow {
  roles?: RoleEnum[];
  permissions?: PermissionEnum[];
  hideIf?: boolean;
  cruds?: string;
}
