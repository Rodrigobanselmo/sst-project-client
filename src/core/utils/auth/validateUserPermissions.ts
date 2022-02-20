import { RoleEnum } from '../../../project/enum/roles.enums';

type User = {
  permissions: string[];
  roles: string[];
};

type ValidateUserPermissionsParams = {
  user: User;
  permissions?: string[];
  roles?: string[];
};

const isMaster = (user: User) => {
  return user.roles.some((_permission) => {
    return _permission.split('-')[0] === RoleEnum.MASTER;
  });
};

export function validateUserPermissions({
  user,
  permissions,
  roles,
}: ValidateUserPermissionsParams) {
  if (isMaster(user)) return true;

  if (permissions && permissions?.length > 0) {
    const hasAllPermissions = permissions.some((permission) => {
      return user.permissions.some((_permission) => {
        return _permission.split('-')[0] === permission;
      });
    });

    if (!hasAllPermissions) {
      return false;
    }
  }

  if (roles && roles?.length > 0) {
    const hasAllRoles = roles.some((permission) => {
      return user.roles.includes(permission);
    });

    if (!hasAllRoles) {
      return false;
    }
  }

  return true;
}
