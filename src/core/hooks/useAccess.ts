import { useCallback, useMemo } from 'react';

import { RoleEnum } from 'project/enum/roles.enums';
import {
  selectUserPermissions,
  selectUserRoles,
} from 'store/reducers/user/userSlice';

import { useAppSelector } from './useAppSelector';
import { PermissionEnum } from 'project/enum/permission.enum';
import { ICompany } from 'core/interfaces/api/ICompany';
import { PermissionCompanyEnum } from 'project/enum/permissionsCompany';

export interface IAccessFilterBase {
  text: string;
  search?: string;
  roles?: RoleEnum[];
  permissions?: PermissionEnum[];
  removeWithRoles?: RoleEnum[];
  hideIf?: {
    isClinic?: boolean;
    isConsulting?: boolean;
    isCompany?: boolean;
    isDocuments?: boolean;
    isSchedule?: boolean;
    isAbs?: boolean;
    isEsocial?: boolean;
    isCat?: boolean;
  };
  showIf?: {
    isClinic?: boolean;
    isConsulting?: boolean;
    isCompany?: boolean;
    isDocuments?: boolean;
    isSchedule?: boolean;
    isAbs?: boolean;
    isEsocial?: boolean;
    isCat?: boolean;
  };
}

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

  const onAccessFilterBase = useCallback(
    (item: IAccessFilterBase, company: ICompany) => {
      if (!isValidRoles(item?.roles)) return false;
      if (!isValidPermissions(item?.permissions)) return false;
      if (isToRemoveWithRoles(item?.removeWithRoles)) return false;

      if (item.hideIf) {
        let hide = false;
        // eslint-disable-next-line prettier/prettier
        if (!hide) hide = !!(item.hideIf.isClinic && company.isClinic);
        // eslint-disable-next-line prettier/prettier
        if (!hide) hide = !!(item.hideIf.isConsulting && company.isConsulting);
        // eslint-disable-next-line prettier/prettier
        if (!hide)
          hide = !!(
            item.hideIf.isCompany &&
            !company.isConsulting &&
            !company.isClinic
          );

        // eslint-disable-next-line prettier/prettier
        if (!hide)
          hide = !!(
            item.hideIf.isAbs &&
            !company.permissions?.includes(PermissionCompanyEnum.absenteeism)
          );
        // eslint-disable-next-line prettier/prettier
        if (!hide)
          hide = !!(
            item.hideIf.isCat &&
            !company.permissions?.includes(PermissionCompanyEnum.cat)
          );
        // eslint-disable-next-line prettier/prettier
        if (!hide)
          hide = !!(
            item.hideIf.isDocuments &&
            !company.permissions?.includes(PermissionCompanyEnum.document)
          );
        // eslint-disable-next-line prettier/prettier
        if (!hide)
          hide = !!(
            item.hideIf.isEsocial &&
            !company.permissions?.includes(PermissionCompanyEnum.esocial)
          );
        // eslint-disable-next-line prettier/prettier
        if (!hide)
          hide = !!(
            item.hideIf.isSchedule &&
            !company.permissions?.includes(PermissionCompanyEnum.schedule)
          );

        if (hide) return false;
      }

      if (item.showIf) {
        let show = false;
        // eslint-disable-next-line prettier/prettier
        if (!show) show = !!(item.showIf.isClinic && company.isClinic);
        // eslint-disable-next-line prettier/prettier
        if (!show) show = !!(item.showIf.isConsulting && company.isConsulting);
        // eslint-disable-next-line prettier/prettier
        if (!show)
          show = !!(
            item.showIf.isCompany &&
            !company.isConsulting &&
            !company.isClinic
          );

        // eslint-disable-next-line prettier/prettier
        if (!show)
          show = !!(
            item.showIf.isAbs &&
            company.permissions?.includes(PermissionCompanyEnum.absenteeism)
          );
        // eslint-disable-next-line prettier/prettier
        if (!show)
          show = !!(
            item.showIf.isCat &&
            company.permissions?.includes(PermissionCompanyEnum.cat)
          );
        // eslint-disable-next-line prettier/prettier
        if (!show)
          show = !!(
            item.showIf.isDocuments &&
            company.permissions?.includes(PermissionCompanyEnum.document)
          );
        // eslint-disable-next-line prettier/prettier
        if (!show)
          show = !!(
            item.showIf.isEsocial &&
            company.permissions?.includes(PermissionCompanyEnum.esocial)
          );
        // eslint-disable-next-line prettier/prettier
        if (!show)
          show = !!(
            item.showIf.isSchedule &&
            company.permissions?.includes(PermissionCompanyEnum.schedule)
          );

        if (!show) return false;
      }

      return true;
    },
    [isToRemoveWithRoles, isValidPermissions, isValidRoles],
  );

  return {
    isMaster,
    onAccessFilterBase,
    isValidRoles,
    isValidPermissions,
    isToRemoveWithRoles,
  };
};
