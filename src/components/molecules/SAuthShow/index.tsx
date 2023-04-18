import React, { FC } from 'react';

import { useAuth } from 'core/contexts/AuthContext';

import { ISAuthShow } from './types';

export const useAuthShow = () => {
  const { user } = useAuth();

  const isAuthSuccess = ({ roles, permissions, cruds }: ISAuthShow) => {
    if (roles) {
      if (!user?.roles) return false;
      if (!roles.some((role) => user.roles?.includes(role))) return false;
    }

    if (permissions) {
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
      )
        return false;
    }

    return true;
  };

  return { isAuthSuccess, user };
};

//<Acces
//<SAcces
export const SAuthShow: FC<ISAuthShow> = ({
  roles,
  permissions,
  hideIf,
  cruds,
  children,
}) => {
  const { isAuthSuccess } = useAuthShow();

  if (hideIf) return null;
  if (!isAuthSuccess({ roles, permissions, cruds })) return null;

  return <>{children}</>;
};
