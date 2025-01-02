import { useAuthShow } from 'components/molecules/SAuthShow';
import { RoleEnum } from 'project/enum/roles.enums';

export const usePermissionsAccess = () => {
  const { isAuthSuccess } = useAuthShow();

  const isCompany = isAuthSuccess({
    roles: [RoleEnum.EMPLOYEE, RoleEnum.COMPANY],
  });
  const isActionPlan = isAuthSuccess({
    roles: [RoleEnum.ACTION_PLAN],
  });

  const isActionPlanResponsible = isActionPlan && !isCompany;

  return {
    isActionPlanResponsible,
  };
};
