import React, { FC, useCallback } from 'react';

import { useAuth } from 'core/contexts/AuthContext';

import { ISAuthShow } from './types';
import { RoleEnum } from '@/project/enum/roles.enums';
import { isMaster } from 'core/utils/auth/validateUserPermissions';

export const useAuthShow = () => {
  const { user } = useAuth();

  const isAuthSuccess = useCallback(
    ({ roles, permissions, cruds, hideIf }: ISAuthShow) => {
      if (roles) {
        if (!user?.roles) return false;
        const userIsMaster = isMaster({
          roles: user.roles,
          permissions: user.permissions ?? [],
        });
        if (
          !userIsMaster &&
          !roles.some((role) => user.roles?.includes(role))
        ) {
          return false;
        }
      }
      if (permissions) {
        const userIsMaster = isMaster({
          roles: user?.roles ?? [],
          permissions: user?.permissions ?? [],
        });
        if (!userIsMaster) {
          if (!user?.permissions) return false;
          if (
            !permissions.some((permission) => {
              const permissionInit = permission.split('-')[0];
              return user.permissions?.find((userPerm) => {
                const splitPer = userPerm.split('-');

                const isValidPermission = splitPer[0] == permissionInit;
                if (!cruds) return isValidPermission;

                const isValidCrud = cruds
                  .split('')
                  .every((crud) => splitPer[1].includes(crud));

                return isValidPermission && isValidCrud;
              });
            })
          ) {
            return false;
          }
        }
      }

      if (hideIf) return false;

      return true;
    },
    [user],
  );

  const isMasterAdmin = isAuthSuccess({
    roles: [RoleEnum.MASTER],
  });

  return { isAuthSuccess, user, isMasterAdmin };
};

//<Acces
//<SAcces
export const SAuthShow: FC<
  { children?: any } & { children?: any } & ISAuthShow
> = ({ roles, permissions, hideIf, cruds, children }) => {
  const { isAuthSuccess } = useAuthShow();

  if (hideIf) return null;
  if (!isAuthSuccess({ roles, permissions, cruds })) return null;

  return <>{children}</>;
};
