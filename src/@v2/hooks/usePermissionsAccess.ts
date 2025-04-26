import { useAuthShow } from 'components/molecules/SAuthShow';
import { PermissionEnum } from 'project/enum/permission.enum';
import { RoleEnum } from 'project/enum/roles.enums';

export const usePermissionsAccess = () => {
  const { isAuthSuccess } = useAuthShow();

  const isCompany = isAuthSuccess({
    roles: [RoleEnum.EMPLOYEE, RoleEnum.COMPANY],
  });
  const isActionPlan = isAuthSuccess({
    roles: [RoleEnum.ACTION_PLAN],
  });
  const isMasterAdmin = isAuthSuccess({
    roles: [RoleEnum.MASTER],
  });

  const isCharacterizationManager =
    isAuthSuccess({
      roles: [RoleEnum.COMPANY],
      permissions: [PermissionEnum.CHARACTERIZATION],
      cruds: 'u',
    }) || isMasterAdmin;

  const isActionPlanResponsible = isActionPlan && !isCompany;

  return {
    isActionPlanResponsible,
    isMasterAdmin,
    isCharacterizationManager,
  };
};
