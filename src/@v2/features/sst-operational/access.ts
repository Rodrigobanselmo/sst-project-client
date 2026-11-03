import {
  canChooseEsocialEnvironment,
  canOperateEsocialEnvironment,
} from './environment-model';
import { PermissionEnum } from 'project/enum/permission.enum';
import type { StructuralTable } from './structural-review-model';
import { useAuth } from 'core/contexts/AuthContext';
const structuralPermission: Record<StructuralTable, PermissionEnum> = {
  Hierarchy: PermissionEnum.EMPLOYEE,
  HomogeneousGroup: PermissionEnum.HOMO_GROUP,
  CompanyCharacterization: PermissionEnum.CHARACTERIZATION,
  Workspace: PermissionEnum.COMPANY,
};
export function useSstAccess() {
  const { user } = useAuth();
  const allowed = (code: string, right: string) =>
    (user?.permissions || []).some((p) => {
      const [key, rights] = p.split('-');
      return (
        (key === code || key === 'master') &&
        /^[crud]+$/.test(rights || '') &&
        rights.includes(right)
      );
    });
  const canChooseEnvironment = canChooseEsocialEnvironment(user?.roles);
  return {
    canChooseEnvironment,
    canSendInEnvironment: (environment: number) =>
      allowed(PermissionEnum.ESOCIAL, 'u') &&
      canOperateEsocialEnvironment(canChooseEnvironment, environment),
    canRead: allowed('26', 'r'),
    canConfigure: allowed('26.1', 'u'),
    canReadDeclaration: allowed(PermissionEnum.ESOCIAL, 'r'),
    canSendDeclaration: allowed(PermissionEnum.ESOCIAL, 'u'),
    canReadOperations: allowed(PermissionEnum.ESOCIAL, 'r'),
    canReconcileOperations: allowed(PermissionEnum.ESOCIAL, 'u'),
    canReadToxicology:
      allowed(PermissionEnum.EMPLOYEE_HISTORY, 'r') ||
      allowed(PermissionEnum.ESOCIAL, 'r'),
    canCreateToxicology: allowed(PermissionEnum.EMPLOYEE_HISTORY, 'c'),
    canUpdateToxicology: allowed(PermissionEnum.EMPLOYEE_HISTORY, 'u'),
    canReadStructure: (table: StructuralTable) =>
      allowed(structuralPermission[table], 'r'),
    canUpdateStructure: (table: StructuralTable) =>
      allowed(structuralPermission[table], 'u'),
    companyId: user?.companyId,
    userId: user?.id,
  };
}
