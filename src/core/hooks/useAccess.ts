import { useCallback, useMemo } from 'react';

import { RoleEnum } from 'project/enum/roles.enums';
import {
  selectUserPermissions,
  selectUserRoles,
} from 'store/reducers/user/userSlice';

import { useAppSelector } from './useAppSelector';

export const useAccess = () => {
  const roles = useAppSelector(selectUserRoles);
  const permissions = useAppSelector(selectUserPermissions);

  const isMaster = useMemo(() => roles?.includes(RoleEnum.MASTER), [roles]);
  const permissionsValue = useMemo(
    () => permissions?.map((p) => p.split('-')[0]),
    [permissions],
  );

  const isValidRoles = useCallback(
    (accessRoles?: string[]) => {
      const isPublic = !accessRoles || accessRoles.length === 0;
      if (isPublic) return true;
      if (!roles) return false;

      if (isMaster) return true;

      const isPrivate = accessRoles.length > 0;
      const isAccessible = accessRoles?.some((role) => roles?.includes(role));
      if (isPrivate && !isAccessible) return false;

      return true;
    },
    [isMaster, roles],
  );

  const isValidPermissions = useCallback(
    (accessPermissions?: string[]) => {
      const isPublic = !accessPermissions || accessPermissions.length === 0;
      if (isPublic) return true;
      if (isMaster) return true;

      if (!permissions) return false;

      const isPrivate = accessPermissions.length > 0;
      const isAccessible = accessPermissions?.some((permissionShort) =>
        permissionsValue?.includes(permissionShort),
      );
      if (isPrivate && !isAccessible) return false;

      return true;
    },
    [isMaster, permissions, permissionsValue],
  );

  const isToRemoveWithRoles = useCallback(
    (removeWithRoles?: string[]) => {
      const isToRemoveAccessible = removeWithRoles?.some((role) =>
        roles?.includes(role),
      );

      return isToRemoveAccessible;
    },
    [roles],
  );

  return { isValidRoles, isValidPermissions, isToRemoveWithRoles };
};
