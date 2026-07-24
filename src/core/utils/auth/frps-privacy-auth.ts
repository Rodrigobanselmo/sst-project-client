import { RoleEnum } from 'project/enum/roles.enums';

/**
 * Espelha a regra da API (`canManageFrpsRiskAnalysisPrivacy`):
 * MASTER do sistema OU Administrador Máximo da empresa.
 *
 * Administrador Máximo = RoleEnum.ADMIN ('0') OU o bundle completo
 * USER+COMPANY+SECURITY+MEDICINE+RISK+FORM (sem validar pelo nome do perfil).
 */
export const COMPANY_MAX_ADMIN_ROLE_BUNDLE: readonly RoleEnum[] = [
  RoleEnum.USER,
  RoleEnum.COMPANY,
  RoleEnum.SECURITY,
  RoleEnum.MEDICINE,
  RoleEnum.RISK,
  RoleEnum.FORM,
] as const;

export function isSystemMasterRole(
  roles: string[] | null | undefined,
): boolean {
  return (roles ?? []).includes(RoleEnum.MASTER);
}

export function isCompanyMaxAdminRole(
  roles: string[] | null | undefined,
): boolean {
  const list = roles ?? [];
  if (list.includes(RoleEnum.ADMIN)) return true;
  return COMPANY_MAX_ADMIN_ROLE_BUNDLE.every((role) => list.includes(role));
}

export function canManageFrpsRiskAnalysisPrivacy(
  roles: string[] | null | undefined,
): boolean {
  return isSystemMasterRole(roles) || isCompanyMaxAdminRole(roles);
}
