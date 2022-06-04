import { RoleEnum } from 'project/enum/roles.enums';
import { selectUserRoles } from 'store/reducers/user/userSlice';

import { useAppSelector } from './useAppSelector';

export const useAccess = () => {
  const roles = useAppSelector(selectUserRoles);

  const isValidRoles = (accessRoles?: string[]) => {
    const isPublic = !accessRoles || accessRoles.length === 0;
    if (isPublic) return true;

    if (!roles) return false;
    const isMaster = roles?.includes(RoleEnum.MASTER);
    if (isMaster) return true;

    const isPrivate = accessRoles.length > 0;
    const isAccessible = accessRoles?.some((role) => roles?.includes(role));
    if (isPrivate && !isAccessible) return false;

    return true;
  };

  return { isValidRoles };
};
