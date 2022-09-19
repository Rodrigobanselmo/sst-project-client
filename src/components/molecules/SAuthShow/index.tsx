import React, { FC } from 'react';

import { useAuth } from 'core/contexts/AuthContext';

import { ISAuthShow } from './types';

export const SAuthShow: FC<ISAuthShow> = ({
  roles,
  permissions,
  hideIf,
  children,
}) => {
  const { user } = useAuth();

  if (hideIf) return null;

  if (roles) {
    if (!user?.roles) return null;
    if (!roles.some((role) => user.roles?.includes(role))) return null;
  }

  if (permissions) {
    if (!user?.permissions) return null;
    if (
      !permissions.some((permission) => user.permissions?.includes(permission))
    )
      return null;
  }

  return <>{children}</>;
};
